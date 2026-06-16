import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { tempRegistrations } from "@/lib/otpStore";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    if (!email?.trim() || !otp?.trim()) {
      return NextResponse.json(
        { error: "Email and verification OTP are required." },
        { status: 400 }
      );
    }

    const key = email.trim().toLowerCase();
    const tempReg = tempRegistrations.get(key);

    // 1. Check if temporary registration exists
    if (!tempReg) {
      return NextResponse.json(
        { error: "Registration details not found. Please register again." },
        { status: 400 }
      );
    }

    // 2. Check if code has expired (10 minutes)
    if (Date.now() > tempReg.expiresAt) {
      tempRegistrations.delete(key);
      return NextResponse.json(
        { error: "Verification code expired. Please register again." },
        { status: 400 }
      );
    }

    // 3. Verify OTP
    if (tempReg.otp !== otp.trim()) {
      return NextResponse.json(
        { error: "Incorrect verification code." },
        { status: 400 }
      );
    }

    // 4. Verification successful, proceed to create confirmed user in Supabase
    const { password, full_name, phone, team_name, idea_title, idea_description } = tempReg.data;

    const { data: userCreate, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email: key,
        password,
        email_confirm: true, // Auto-confirm email since we verified it
        user_metadata: {
          full_name,
          phone,
          team_name,
          idea_title,
          idea_description,
          submission_status: "Pending", // Default idea status
        },
      });

    if (createError) {
      console.error("Supabase user creation error:", createError);
      const isDuplicate = createError.message?.toLowerCase().includes("already exists") || createError.message?.toLowerCase().includes("registered");
      return NextResponse.json(
        { error: isDuplicate ? "This email is already registered." : (createError.message ?? "Failed to create user account.") },
        { status: isDuplicate ? 400 : 500 }
      );
    }

    // 5. Clean up local map cache
    tempRegistrations.delete(key);

    return NextResponse.json(
      {
        message: "Account verified and created successfully.",
        user: userCreate.user,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Verify OTP error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred during OTP verification." },
      { status: 500 }
    );
  }
}
