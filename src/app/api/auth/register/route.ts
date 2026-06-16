import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

function isPasswordStrong(password: string): boolean {
  if (password.length < 8) return false;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  return hasUppercase && hasLowercase && hasDigit && hasSpecial;
}

function isPhoneValid(phone: string): boolean {
  const cleaned = phone.replace(/[^0-9]/g, "");
  return cleaned.length >= 10 && cleaned.length <= 15;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      full_name,
      phone,
      team_name,
      idea_title,
      idea_description,
    } = body;

    // 1. Basic Fields Presence check
    if (
      !email?.trim() ||
      !password?.trim() ||
      !full_name?.trim() ||
      !phone?.trim() ||
      !team_name?.trim()
    ) {
      return NextResponse.json(
        { error: "All profile fields are required." },
        { status: 400 }
      );
    }

    // 2. Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // 3. Phone validation
    if (!isPhoneValid(phone.trim())) {
      return NextResponse.json(
        { error: "Please provide a valid phone number (10-15 digits)." },
        { status: 400 }
      );
    }

    // 4. Password Strength check
    if (!isPasswordStrong(password)) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a digit, and a special character.",
        },
        { status: 400 }
      );
    }

    // 5. Check for duplicate registration in Supabase
    try {
      const { data: listData, error: listError } =
        await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });

      if (!listError && listData?.users) {
        const exists = listData.users.some(
          (u) => u.email?.toLowerCase() === email.trim().toLowerCase()
        );
        if (exists) {
          return NextResponse.json(
            { error: "This email is already registered." },
            { status: 400 }
          );
        }
      }
    } catch (searchErr) {
      console.warn("Supabase user pre-check warning:", searchErr);
    }

    // 6. Create user directly in Supabase (no OTP required)
    const { data: userCreate, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email: email.trim().toLowerCase(),
        password,
        email_confirm: true,
        user_metadata: {
          full_name: full_name.trim(),
          phone: phone.trim(),
          team_name: team_name.trim(),
          idea_title: idea_title?.trim() || "",
          idea_description: idea_description?.trim() || "",
          submission_status: "Pending",
        },
      });

    if (createError) {
      console.error("Supabase user creation error:", createError);
      const isDuplicate =
        createError.message?.toLowerCase().includes("already exists") ||
        createError.message?.toLowerCase().includes("registered");
      return NextResponse.json(
        {
          error: isDuplicate
            ? "This email is already registered."
            : createError.message ?? "Failed to create user account.",
        },
        { status: isDuplicate ? 400 : 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Account created successfully.",
        user: userCreate.user,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred during registration." },
      { status: 500 }
    );
  }
}
