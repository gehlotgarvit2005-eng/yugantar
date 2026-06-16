"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, type AuthTab } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const ALLOWED_ADMINS = [
  "sourabhsinghtak.2207@gmail.com",
  "gehlotgarvit2005@gmail.com",
];

export function AuthModal() {
  const {
    user,
    isAuthModalOpen,
    authModalTab,
    tempEmail,
    authWarning,
    setAuthWarning,
    closeAuthModal,
    setAuthModalTab,
    setTempEmail,
    logout,
    refreshUser,
  } = useAuth();

  // Common Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up Form States
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [teamName, setTeamName] = useState("");
  const [ideaTitle, setIdeaTitle] = useState("");
  const [ideaDesc, setIdeaDesc] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // OTP Form State
  const [otp, setOtp] = useState("");
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  // Dashboard / Edit Profile States
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editTeam, setEditTeam] = useState("");

  // UI Status States
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Reset form states on tab change
  useEffect(() => {
    setErrorMsg("");
    setSuccessMsg("");
    setOtp("");
    setDevOtpHint(null);
    if (user && authModalTab === "dashboard") {
      setEditName(user.full_name);
      setEditPhone(user.phone);
      setEditTeam(user.team_name);
      setIsEditing(false);
    }
    return () => {
      setAuthWarning("");
    };
  }, [authModalTab, user, setAuthWarning]);

  if (!isAuthModalOpen) return null;

  // Handle Sign In submission
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!email.trim() || !password.trim()) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        setErrorMsg(error.message || "Invalid credentials.");
      } else {
        setSuccessMsg("Welcome back!");
        await refreshUser();
        setTimeout(() => {
          closeAuthModal();
        }, 800);
      }
    } catch {
      setErrorMsg("An unexpected login error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Sign Up (OTP Request) submission
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // Local validation
    if (
      !fullName.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !teamName.trim() ||
      !password ||
      !confirmPassword
    ) {
      setErrorMsg("All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          full_name: fullName.trim(),
          phone: phone.trim(),
          team_name: teamName.trim(),
          idea_title: ideaTitle.trim(),
          idea_description: ideaDesc.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Failed to start registration.");
      } else {
        setTempEmail(email.trim());
        setSuccessMsg("OTP verification code generated.");
        if (data.otp_hint) {
          setDevOtpHint(data.otp_hint);
        }
        setAuthModalTab("otp");
      }
    } catch {
      setErrorMsg("Connection error. Could not send verification code.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle OTP verification
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!otp.trim()) {
      setErrorMsg("Please enter the 6-digit OTP code.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: tempEmail,
          otp: otp.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "OTP verification failed.");
        setSubmitting(false);
      } else {
        setSuccessMsg("Account verified! Logging you in...");
        
        // Auto-login on client side using email & password
        const loginRes = await supabase.auth.signInWithPassword({
          email: tempEmail,
          password: password,
        });

        if (loginRes.error) {
          setErrorMsg("Account created, but auto-login failed. Please sign in manually.");
          setAuthModalTab("signin");
          setSubmitting(false);
        } else {
          await refreshUser();
          setTimeout(() => {
            closeAuthModal();
          }, 1200);
        }
      }
    } catch {
      setErrorMsg("Connection failed. Could not verify OTP.");
      setSubmitting(false);
    }
  };

  // Handle Forgot Password submission
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!email.trim()) {
      setErrorMsg("Please provide your email address.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        setErrorMsg(error.message || "Failed to initiate reset.");
      } else {
        setSuccessMsg("A reset link has been sent to your email. Check developer terminal logs if needed.");
        // Log locally so the developer knows the URL
        console.log(`\n======================================\nPASSWORD RESET ACTION\nEmail: ${email.trim()}\n======================================\n`);
      }
    } catch {
      setErrorMsg("Could not process password reset.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Profile submission
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!editName.trim() || !editPhone.trim() || !editTeam.trim()) {
      setErrorMsg("All profile fields are required.");
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: editName.trim(),
          phone: editPhone.trim(),
          team_name: editTeam.trim(),
        },
      });

      if (error) {
        setErrorMsg(error.message || "Failed to update profile.");
      } else {
        setSuccessMsg("Profile updated successfully!");
        await refreshUser();
        setIsEditing(false);
      }
    } catch {
      setErrorMsg("Failed to update profile settings.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Dim backdrop filter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeAuthModal}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />

      {/* Glassmorphic Modal Card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-white/[0.08] bg-neutral-900/60 p-6 md:p-8 shadow-2xl backdrop-blur-2xl text-left font-sans text-white"
        style={{ fontFamily: "var(--font-sora), var(--font-inter), sans-serif" }}
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.06] text-text-tertiary hover:text-white transition-colors"
          aria-label="Close modal"
        >
          ✕
        </button>

        <AnimatePresence mode="wait">
          {/* ======================================================== */}
          {/* TAB 1: SIGN IN                                           */}
          {/* ======================================================== */}
          {authModalTab === "signin" && (
            <motion.div
              key="signin"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold tracking-tight">Sign In</h2>
                <p className="text-xs text-text-tertiary mt-1">
                  Access your Yugantar 2026 account to submit and view ideas
                </p>
              </div>

              <form onSubmit={handleSignIn} className="space-y-4">
                {authWarning && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2">
                    <span className="text-amber-400 text-sm mt-0.5">⚠️</span>
                    <p className="text-xs text-amber-200/90 leading-relaxed">
                      {authWarning}
                    </p>
                  </div>
                )}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-white/[0.08] bg-bg-surface px-4 py-3 text-sm placeholder-text-muted transition-all focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setAuthModalTab("forgot")}
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-white/[0.08] bg-bg-surface px-4 py-3 text-sm placeholder-text-muted transition-all focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    id="remember_me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-white/[0.08] bg-bg-surface text-primary focus:ring-primary/20 accent-primary"
                  />
                  <label htmlFor="remember_me" className="ml-2 text-xs text-text-tertiary">
                    Remember Me
                  </label>
                </div>

                {errorMsg && <p className="text-xs text-accent bg-accent/5 p-3 rounded-lg border border-accent/10">{errorMsg}</p>}
                {successMsg && <p className="text-xs text-green-400 bg-green-500/5 p-3 rounded-lg border border-green-500/10">{successMsg}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl px-5 py-3.5 text-sm font-semibold text-white overflow-hidden transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 relative"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-primary to-secondary" />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {submitting ? (
                      <>
                        <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </span>
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-white/[0.06] text-center text-xs text-text-tertiary flex flex-col gap-2">
                <div>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setAuthModalTab("signup")}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign Up (New User)
                  </button>
                </div>
                <div className="text-[11px] opacity-75">
                  Are you an administrator?{" "}
                  <Link
                    href="/admin"
                    onClick={closeAuthModal}
                    className="text-accent hover:underline font-medium"
                  >
                    Admin Portal
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: SIGN UP                                           */}
          {/* ======================================================== */}
          {authModalTab === "signup" && (
            <motion.div
              key="signup"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="max-h-[80vh] overflow-y-auto pr-1"
            >
              <div className="text-center mb-5">
                <h2 className="text-2xl font-bold tracking-tight">Create Account</h2>
                <p className="text-xs text-text-tertiary mt-1">
                  Submit your team's details to enter the Yugantar gallery
                </p>
              </div>

              <form onSubmit={handleSignUp} className="space-y-4">
                {authWarning && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2">
                    <span className="text-amber-400 text-sm mt-0.5">⚠️</span>
                    <p className="text-xs text-amber-200/90 leading-relaxed">
                      {authWarning}
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Alan Turing"
                      className="w-full rounded-xl border border-white/[0.08] bg-bg-surface px-4 py-2.5 text-sm placeholder-text-muted focus:border-primary/40 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-xl border border-white/[0.08] bg-bg-surface px-4 py-2.5 text-sm placeholder-text-muted focus:border-primary/40 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@domain.com"
                      className="w-full rounded-xl border border-white/[0.08] bg-bg-surface px-4 py-2.5 text-sm placeholder-text-muted focus:border-primary/40 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-1">
                      Team Name
                    </label>
                    <input
                      type="text"
                      required
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="The Enigma Tribe"
                      className="w-full rounded-xl border border-white/[0.08] bg-bg-surface px-4 py-2.5 text-sm placeholder-text-muted focus:border-primary/40 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="separator" />

                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-accent/80">Your Proposed Movement</h3>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-1">
                      Idea Title
                    </label>
                    <input
                      type="text"
                      value={ideaTitle}
                      onChange={(e) => setIdeaTitle(e.target.value)}
                      placeholder="Decentralized Energy Grid"
                      className="w-full rounded-xl border border-white/[0.08] bg-bg-surface px-4 py-2.5 text-sm placeholder-text-muted focus:border-primary/40 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-1">
                      Short Description of Idea
                    </label>
                    <textarea
                      value={ideaDesc}
                      onChange={(e) => setIdeaDesc(e.target.value)}
                      placeholder="Describe what movements your idea will spark..."
                      rows={2}
                      className="w-full resize-none rounded-xl border border-white/[0.08] bg-bg-surface px-4 py-2.5 text-sm placeholder-text-muted focus:border-primary/40 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="separator" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-1">
                      Create Password
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-white/[0.08] bg-bg-surface px-4 py-2.5 text-sm placeholder-text-muted focus:border-primary/40 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-white/[0.08] bg-bg-surface px-4 py-2.5 text-sm placeholder-text-muted focus:border-primary/40 focus:outline-none"
                    />
                  </div>
                </div>

                {errorMsg && <p className="text-xs text-accent bg-accent/5 p-3 rounded-lg border border-accent/10">{errorMsg}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl px-5 py-3 text-sm font-semibold text-white overflow-hidden transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 relative"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent" />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {submitting ? (
                      <>
                        <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Generating OTP...
                      </>
                    ) : (
                      "Send OTP Code"
                    )}
                  </span>
                </button>
              </form>

              <div className="mt-5 pt-3 border-t border-white/[0.06] text-center text-xs text-text-tertiary">
                Already registered?{" "}
                <button
                  onClick={() => setAuthModalTab("signin")}
                  className="text-primary hover:underline font-medium"
                >
                  Sign In
                </button>
              </div>
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: OTP VERIFICATION                                  */}
          {/* ======================================================== */}
          {authModalTab === "otp" && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold tracking-tight">Verify Email</h2>
                <p className="text-xs text-text-tertiary mt-1">
                  Enter the 6-digit OTP code sent to <strong>{tempEmail}</strong>
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-1.5 text-center">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="123456"
                    className="w-32 mx-auto text-center rounded-xl border border-white/[0.08] bg-bg-surface px-4 py-3 text-lg font-bold tracking-[0.25em] placeholder-text-muted focus:border-primary/40 focus:outline-none block"
                  />
                </div>

                {/* Developer OTP Helper Hint */}
                {devOtpHint && (
                  <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl text-center">
                    <p className="text-xs text-primary font-medium">
                      [Dev Hint] Your OTP verification code is: <strong>{devOtpHint}</strong>
                    </p>
                  </div>
                )}

                {errorMsg && <p className="text-xs text-accent bg-accent/5 p-3 rounded-lg border border-accent/10 text-center">{errorMsg}</p>}
                {successMsg && <p className="text-xs text-green-400 bg-green-500/5 p-3 rounded-lg border border-green-500/10 text-center">{successMsg}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl px-5 py-3.5 text-sm font-semibold text-white overflow-hidden transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 relative"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-primary to-secondary" />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {submitting ? (
                      <>
                        <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify & Create Account"
                    )}
                  </span>
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-white/[0.06] text-center text-xs">
                Didn't receive code?{" "}
                <button
                  onClick={() => {
                    setAuthModalTab("signup");
                  }}
                  className="text-primary hover:underline font-medium"
                >
                  Go back and resend
                </button>
              </div>
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: FORGOT PASSWORD                                   */}
          {/* ======================================================== */}
          {authModalTab === "forgot" && (
            <motion.div
              key="forgot"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold tracking-tight">Recover Password</h2>
                <p className="text-xs text-text-tertiary mt-1">
                  Enter your email address and we'll send you a password recovery link
                </p>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full rounded-xl border border-white/[0.08] bg-bg-surface px-4 py-3 text-sm placeholder-text-muted focus:border-primary/40 focus:outline-none"
                  />
                </div>

                {errorMsg && <p className="text-xs text-accent bg-accent/5 p-3 rounded-lg border border-accent/10">{errorMsg}</p>}
                {successMsg && <p className="text-xs text-green-400 bg-green-500/5 p-3 rounded-lg border border-green-500/10">{successMsg}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl px-5 py-3.5 text-sm font-semibold text-white overflow-hidden transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 relative"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-primary to-secondary" />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {submitting ? (
                      <>
                        <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Sending Link...
                      </>
                    ) : (
                      "Send Recovery Link"
                    )}
                  </span>
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-white/[0.06] text-center text-xs">
                Remember your password?{" "}
                <button
                  onClick={() => setAuthModalTab("signin")}
                  className="text-primary hover:underline font-medium"
                >
                  Sign In
                </button>
              </div>
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: DASHBOARD (AUTHENTICATED ONLY)                   */}
          {/* ======================================================== */}
          {authModalTab === "dashboard" && user && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-center mb-6">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 text-accent border border-white/[0.08] text-xl font-bold mb-3">
                  {user.full_name.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-2xl font-bold tracking-tight">{user.full_name}</h2>
                <p className="text-xs text-text-tertiary mt-0.5">{user.email}</p>
              </div>

              <AnimatePresence mode="wait">
                {!isEditing ? (
                  <motion.div
                    key="view-profile"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="space-y-4"
                  >
                    {/* User profile parameters */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="glass-card p-3 rounded-xl bg-white/[0.02] border-white/[0.04]">
                        <span className="text-[10px] uppercase tracking-wider text-text-muted block">Team Name</span>
                        <span className="text-sm font-semibold text-white mt-1 block truncate">{user.team_name}</span>
                      </div>
                      <div className="glass-card p-3 rounded-xl bg-white/[0.02] border-white/[0.04]">
                        <span className="text-[10px] uppercase tracking-wider text-text-muted block">Contact Phone</span>
                        <span className="text-sm font-semibold text-white mt-1 block truncate">{user.phone || "Not Set"}</span>
                      </div>
                    </div>

                    {/* Submitted Idea details */}
                    <div className="glass-card p-4 rounded-xl bg-white/[0.02] border-white/[0.04] space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase tracking-wider text-text-muted">Proposed Movement</span>
                        <span className={cn(
                          "text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border",
                          user.submission_status === "Approved" ? "bg-green-500/10 border-green-500/20 text-green-400" :
                          user.submission_status === "Reviewed" ? "bg-primary/10 border-primary/20 text-primary" :
                          "bg-amber-500/10 border-amber-500/20 text-amber-400"
                        )}>
                          {user.submission_status || "Pending"}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white leading-snug">
                        {user.idea_title || "No Idea Submitted Yet"}
                      </h4>
                      {user.idea_description && (
                        <p className="text-xs text-text-tertiary leading-relaxed truncate max-w-full">
                          {user.idea_description}
                        </p>
                      )}
                    </div>

                    {/* Admin Portal Shortcut Link */}
                    {user && user.email && ALLOWED_ADMINS.includes(user.email.toLowerCase()) && (
                      <div className="pt-2">
                        <Link
                          href="/admin"
                          onClick={closeAuthModal}
                          className="relative group w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold text-white rounded-xl overflow-hidden shadow-lg border border-accent/20"
                        >
                          <span className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-90 group-hover:opacity-100 transition-opacity" />
                          <span className="relative z-10">🛡️ Open Admin Portal</span>
                        </Link>
                      </div>
                    )}

                    {/* Actions row */}
                    <div className="flex gap-3 pt-3">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex-1 rounded-xl bg-white/[0.06] border border-white/[0.08] hover:bg-white/[0.10] px-4 py-3 text-xs font-semibold text-white text-center transition-colors"
                      >
                        Edit Profile
                      </button>
                      <button
                        onClick={logout}
                        className="flex-1 rounded-xl bg-accent/10 border border-accent/20 hover:bg-accent/15 px-4 py-3 text-xs font-semibold text-accent text-center transition-colors"
                      >
                        Log Out
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form
                    key="edit-profile"
                    onSubmit={handleUpdateProfile}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full rounded-xl border border-white/[0.08] bg-bg-surface px-4 py-2.5 text-sm focus:border-primary/40 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          required
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          className="w-full rounded-xl border border-white/[0.08] bg-bg-surface px-4 py-2.5 text-sm focus:border-primary/40 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-1">
                          Team Name
                        </label>
                        <input
                          type="text"
                          required
                          value={editTeam}
                          onChange={(e) => setEditTeam(e.target.value)}
                          className="w-full rounded-xl border border-white/[0.08] bg-bg-surface px-4 py-2.5 text-sm focus:border-primary/40 focus:outline-none"
                        />
                      </div>
                    </div>

                    {errorMsg && <p className="text-xs text-accent bg-accent/5 p-3 rounded-lg border border-accent/10">{errorMsg}</p>}
                    {successMsg && <p className="text-xs text-green-400 bg-green-500/5 p-3 rounded-lg border border-green-500/10">{successMsg}</p>}

                    <div className="flex gap-3 pt-3">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="flex-1 rounded-xl bg-white/[0.06] border border-white/[0.08] hover:bg-white/[0.10] px-4 py-3 text-xs font-semibold text-white text-center transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 rounded-xl px-4 py-3 text-xs font-semibold text-white relative overflow-hidden active:scale-[0.98]"
                      >
                        <span className="absolute inset-0 bg-gradient-to-r from-primary to-secondary" />
                        <span className="relative z-10 flex items-center justify-center gap-1.5">
                          {submitting ? (
                            <>
                              <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                              Saving...
                            </>
                          ) : (
                            "Save Changes"
                          )}
                        </span>
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
