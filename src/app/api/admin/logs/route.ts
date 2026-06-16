import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyAdmin } from "../helper";

export const runtime = "nodejs";

/** GET /api/admin/logs — List admin activities */
export async function GET(request: Request) {
  const { error: authError } = await verifyAdmin(request);
  if (authError) {
    return NextResponse.json({ error: authError }, { status: 401 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("admin_activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      // Fallback: If table is not set up, don't crash, return empty array with a warning indicator
      if (error.code === "PGRST205" || error.message?.includes("relation") || error.message?.includes("cache")) {
        return NextResponse.json({ logs: [], db_warning: true }, { status: 200 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ logs: data ?? [] }, { status: 200 });
  } catch (err) {
    console.error("Get logs error:", err);
    return NextResponse.json({ logs: [], db_warning: true }, { status: 200 });
  }
}

/** POST /api/admin/logs — Log a new administrative event */
export async function POST(request: Request) {
  const { error: authError, user: adminUser } = await verifyAdmin(request);
  if (authError) {
    return NextResponse.json({ error: authError }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, target } = body;

    if (!action?.trim()) {
      return NextResponse.json({ error: "Action is required." }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("admin_activity_logs")
      .insert({
        admin_email: adminUser?.email || "unknown_admin",
        action: action.trim(),
        target: target?.trim() || "",
      })
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST205" || error.message?.includes("relation") || error.message?.includes("cache")) {
        return NextResponse.json({ success: true, db_warning: true });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, log: data });
  } catch (err) {
    console.error("Add log error:", err);
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}
