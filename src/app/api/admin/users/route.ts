import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyAdmin } from "../helper";

export const runtime = "nodejs";

/** GET /api/admin/users — List registered profiles */
export async function GET(request: Request) {
  const { error: authError } = await verifyAdmin(request);
  if (authError) {
    return NextResponse.json({ error: authError }, { status: 401 });
  }

  try {
    // Retrieve users from Supabase Auth list (up to 1000 users)
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      perPage: 1000,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Filter out internal service users or map metadata cleanly
    const users = (data?.users ?? []).map((u) => ({
      id: u.id,
      email: u.email,
      full_name: u.user_metadata?.full_name || "Unknown User",
      phone: u.user_metadata?.phone || "",
      team_name: u.user_metadata?.team_name || "No Team",
      idea_title: u.user_metadata?.idea_title || "",
      idea_description: u.user_metadata?.idea_description || "",
      restricted: u.user_metadata?.restricted === true,
      restriction_reason: u.user_metadata?.restriction_reason || "",
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
    }));

    return NextResponse.json({ users }, { status: 200 });
  } catch (err) {
    console.error("Fetch users error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred while loading users." },
      { status: 500 }
    );
  }
}

/** POST /api/admin/users — Restrict or unsuspend a user */
export async function POST(request: Request) {
  const { error: authError, user: adminUser } = await verifyAdmin(request);
  if (authError) {
    return NextResponse.json({ error: authError }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { userId, restrict, reason } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required." }, { status: 400 });
    }

    // 1. Fetch current target user data
    const { data: { user: targetUser }, error: getError } = 
      await supabaseAdmin.auth.admin.getUserById(userId);

    if (getError || !targetUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Prevent self-restriction if admin is in the list
    if (targetUser.email?.toLowerCase() === adminUser?.email?.toLowerCase()) {
      return NextResponse.json({ error: "You cannot restrict your own admin account." }, { status: 400 });
    }

    // 2. Update user metadata
    const updatedMetadata = {
      ...targetUser.user_metadata,
      restricted: !!restrict,
      restriction_reason: restrict ? (reason || "Suspended by Administrator") : "",
    };

    const { data: updatedUser, error: updateError } = 
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: updatedMetadata,
      });

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // 3. Add to user_restrictions DB table (safely, ignore failures if table not set up)
    try {
      if (targetUser.email) {
        if (restrict) {
          await supabaseAdmin.from("user_restrictions").upsert({
            email: targetUser.email.toLowerCase(),
            restricted: true,
            restriction_reason: reason || "Suspended by Admin",
            restricted_at: new Date().toISOString(),
          });
        } else {
          await supabaseAdmin
            .from("user_restrictions")
            .delete()
            .eq("email", targetUser.email.toLowerCase());
        }
      }
    } catch (dbErr) {
      console.warn("User restriction sync database warning:", dbErr);
    }

    // 4. Create an activity log
    try {
      await supabaseAdmin.from("admin_activity_logs").insert({
        admin_email: adminUser?.email || "unknown_admin",
        action: restrict ? "SUSPEND_USER" : "UNSUSPEND_USER",
        target: `User: ${targetUser.email} (${reason || "No reason specified"})`,
      });
    } catch (logErr) {
      console.warn("Log creation database warning:", logErr);
    }

    return NextResponse.json({ 
      success: true, 
      user: {
        id: updatedUser.user.id,
        email: updatedUser.user.email,
        restricted: updatedUser.user.user_metadata?.restricted === true,
      } 
    });
  } catch (err) {
    console.error("Restrict user error:", err);
    return NextResponse.json(
      { error: "Failed to update user restriction status." },
      { status: 500 }
    );
  }
}
