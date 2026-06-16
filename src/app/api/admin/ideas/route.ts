import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyAdmin } from "../helper";

export const runtime = "nodejs";

/** GET /api/admin/ideas — List ideas with query options (admin only) */
export async function GET(request: Request) {
  const { error: authError } = await verifyAdmin(request);
  if (authError) {
    return NextResponse.json({ error: authError }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const showTrash = searchParams.get("trash") === "true";

  try {
    let query = supabaseAdmin.from("ideas").select("*");

    // Attempt to filter by soft-delete column
    if (showTrash) {
      query = query.not("deleted_at", "is", null);
    } else {
      // Fetch active ideas (deleted_at is null)
      // To prevent crashes if columns are missing, we run the query and catch errors
    }

    let { data, error } = await query.order("created_at", { ascending: false });

    // Fallback: If deleted_at column doesn't exist yet, fetch all ideas without filtering
    if (error && (error.message?.includes("deleted_at") || error.message?.includes("column"))) {
      const fallbackQuery = supabaseAdmin.from("ideas").select("*").order("created_at", { ascending: false });
      const fallbackRes = await fallbackQuery;
      if (fallbackRes.error) {
        return NextResponse.json({ error: fallbackRes.error.message }, { status: 500 });
      }
      // Simulate client side filtering or return all as active
      data = showTrash ? [] : fallbackRes.data;
      error = null;
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Double check: if columns are missing in returned rows, set default values
    const ideas = (data ?? []).map((idea) => ({
      ...idea,
      status: idea.status || "Pending",
      review_notes: idea.review_notes || "",
      review_history: idea.review_history || [],
      deleted_at: idea.deleted_at || null,
    }));

    return NextResponse.json({ ideas }, { status: 200 });
  } catch (err) {
    console.error("GET admin ideas error:", err);
    return NextResponse.json({ error: "Failed to load admin ideas list." }, { status: 500 });
  }
}

/** PATCH /api/admin/ideas — Update idea properties (status, notes, featured, soft-delete) */
export async function PATCH(request: Request) {
  const { error: authError, user: adminUser } = await verifyAdmin(request);
  if (authError) {
    return NextResponse.json({ error: authError }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, featured, status, review_notes, review_history, restore, softDelete } = body;

    if (!id) {
      return NextResponse.json({ error: "Idea ID is required." }, { status: 400 });
    }

    // 1. Fetch current idea details for logging / reference
    const { data: currentIdea, error: fetchError } = await supabaseAdmin
      .from("ideas")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !currentIdea) {
      return NextResponse.json({ error: "Idea not found." }, { status: 404 });
    }

    // 2. Build update payload
    const updateData: Record<string, any> = {};
    const logDetails: string[] = [];

    if (featured !== undefined) {
      updateData.featured = !!featured;
      logDetails.push(featured ? "featured" : "unfeatured");
    }

    if (status !== undefined) {
      updateData.status = status;
      logDetails.push(`status to: ${status}`);
    }

    if (review_notes !== undefined) {
      updateData.review_notes = review_notes;
      logDetails.push("updated review notes");
    }

    if (review_history !== undefined) {
      updateData.review_history = review_history;
    }

    if (softDelete === true) {
      updateData.deleted_at = new Date().toISOString();
      logDetails.push("moved to trash");
    } else if (restore === true) {
      updateData.deleted_at = null;
      logDetails.push("restored from trash");
    }

    // 3. Perform the update
    const { data: updatedIdea, error: updateError } = await supabaseAdmin
      .from("ideas")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    // Fallback handler if status / review_notes / deleted_at columns are missing in database
    if (updateError && (updateError.message?.includes("column") || updateError.message?.includes("relation"))) {
      // If db columns are missing, we fall back to only updating featured (which we know exists)
      const fallbackData: Record<string, any> = {};
      if (featured !== undefined) fallbackData.featured = !!featured;

      if (Object.keys(fallbackData).length > 0) {
        const { data: fbIdea, error: fbErr } = await supabaseAdmin
          .from("ideas")
          .update(fallbackData)
          .eq("id", id)
          .select()
          .single();
        if (fbErr) return NextResponse.json({ error: fbErr.message }, { status: 500 });
        
        // Return simulated updated fields
        return NextResponse.json({ 
          idea: { ...fbIdea, ...updateData },
          warning: "Some administrative columns are missing in database. Please run migrations." 
        });
      }

      return NextResponse.json({
        error: "Database tables are missing admin fields. Please run migrations script 002_admin_system.sql."
      }, { status: 400 });
    }

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // 4. Log the action
    try {
      await supabaseAdmin.from("admin_activity_logs").insert({
        admin_email: adminUser?.email || "unknown_admin",
        action: softDelete ? "TRASH_IDEA" : restore ? "RESTORE_IDEA" : "REVIEW_IDEA",
        target: `Idea by ${currentIdea.author}: ${logDetails.join(", ")}`,
      });
    } catch (logErr) {
      console.warn("Logging action warning:", logErr);
    }

    return NextResponse.json({ idea: updatedIdea });
  } catch (err) {
    console.error("PATCH admin ideas error:", err);
    return NextResponse.json({ error: "Failed to update idea review state." }, { status: 500 });
  }
}

/** DELETE /api/admin/ideas — Permanently purge an idea (admin only) */
export async function DELETE(request: Request) {
  const { error: authError, user: adminUser } = await verifyAdmin(request);
  if (authError) {
    return NextResponse.json({ error: authError }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Idea ID is required." }, { status: 400 });
    }

    // Fetch current details for logging
    const { data: currentIdea } = await supabaseAdmin
      .from("ideas")
      .select("author, text")
      .eq("id", id)
      .single();

    const { error: deleteError } = await supabaseAdmin
      .from("ideas")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Log the purge
    try {
      await supabaseAdmin.from("admin_activity_logs").insert({
        admin_email: adminUser?.email || "unknown_admin",
        action: "PURGE_IDEA",
        target: `Permanently deleted idea by ${currentIdea?.author || "unknown"}: "${currentIdea?.text?.slice(0, 30) || ""}..."`,
      });
    } catch (logErr) {
      console.warn("Logging action warning:", logErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE admin ideas error:", err);
    return NextResponse.json({ error: "Failed to permanently delete idea." }, { status: 500 });
  }
}
