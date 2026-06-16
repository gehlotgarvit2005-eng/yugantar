"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const isPasswordStrong = (pwd: string): boolean => {
    if (pwd.length < 8) return false;
    const hasUppercase = /[A-Z]/.test(pwd);
    const hasLowercase = /[a-z]/.test(pwd);
    const hasDigit = /[0-9]/.test(pwd);
    const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
    return hasUppercase && hasLowercase && hasDigit && hasSpecial;
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!password || !confirmPassword) {
      setErrorMsg("Both password fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (!isPasswordStrong(password)) {
      setErrorMsg(
        "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a digit, and a special character."
      );
      return;
    }

    setSubmitting(true);

    try {
      const { data, error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setErrorMsg(error.message || "Failed to update your password.");
      } else {
        setSuccessMsg("Password updated successfully! Redirecting to homepage...");
        setTimeout(() => {
          router.push("/");
        }, 2000);
      }
    } catch {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex-1 flex items-center justify-center min-h-[70vh] px-6 py-20">
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute w-[400px] h-[400px] rounded-full blur-[140px] top-1/3 left-1/3 opacity-30 bg-primary/20" />
      </div>

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.08] bg-neutral-900/60 p-6 md:p-8 shadow-2xl backdrop-blur-2xl text-left"
        style={{ fontFamily: "var(--font-sora), var(--font-inter), sans-serif" }}
      >
        <div className="text-center mb-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary mb-3">
            🔑
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Set New Password</h1>
          <p className="text-xs text-text-tertiary mt-1">
            Choose a strong password to secure your Yugantar account
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-1.5">
              New Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-white/[0.08] bg-bg-surface px-4 py-3 text-sm text-white placeholder-text-muted transition-all focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-white/[0.08] bg-bg-surface px-4 py-3 text-sm text-white placeholder-text-muted transition-all focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
          </div>

          {errorMsg && (
            <p className="text-xs text-accent bg-accent/5 p-3 rounded-lg border border-accent/10">
              {errorMsg}
            </p>
          )}

          {successMsg && (
            <p className="text-xs text-green-400 bg-green-500/5 p-3 rounded-lg border border-green-500/10">
              {successMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl px-5 py-3.5 text-sm font-semibold text-white overflow-hidden transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 relative cursor-pointer"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-primary to-secondary" />
            <span className="relative z-10 flex items-center justify-center gap-2">
              {submitting ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Updating Password...
                </>
              ) : (
                "Update Password"
              )}
            </span>
          </button>
        </form>
      </motion.div>
    </div>
  );
}
