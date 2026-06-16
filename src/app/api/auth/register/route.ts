import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { tempRegistrations } from "@/lib/otpStore";

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

    // 5. Check for duplicate registration in Supabase (Pre-check limit 1000 users)
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
      console.warn("Supabase user pre-check check warning:", searchErr);
    }

    // 6. Generate 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    // 7. Store temporary registration info
    tempRegistrations.set(email.trim().toLowerCase(), {
      otp,
      expiresAt,
      data: {
        password,
        full_name: full_name.trim(),
        phone: phone.trim(),
        team_name: team_name.trim(),
        idea_title: idea_title?.trim() || "",
        idea_description: idea_description?.trim() || "",
      },
    });

    // 8. Log the OTP code in a prominent terminal box for developer access
    console.log("\n");
    console.log("┌──────────────────────────────────────────────────────────┐");
    console.log("│             YUGANTAR 2026 - EMAIL VERIFICATION OTP       │");
    console.log("├──────────────────────────────────────────────────────────┤");
    console.log(`│  Email:    ${email.trim().toLowerCase().padEnd(46)}│`);
    console.log(`│  OTP Code: ${otp.padEnd(46)}│`);
    console.log("│                                                          │");
    console.log("│  Dev Note: Copy and enter this code in the verification  │");
    console.log("│            screen to complete registration.              │");
    console.log("└──────────────────────────────────────────────────────────┘");
    console.log("\n");

    return NextResponse.json(
      {
        message: "Verification OTP code sent. Check developer terminal console.",
        // We can pass a hint in development mode so they don't even have to look at terminal if they prefer
        otp_hint: process.env.NODE_ENV === "development" ? otp : undefined,
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
