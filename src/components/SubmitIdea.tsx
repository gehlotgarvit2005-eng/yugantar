"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ERA_CONFIG, type IdeaEra } from "@/lib/ideas";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

export function SubmitIdea() {
  const router = useRouter();
  const { user, openAuthModal, refreshUser } = useAuth();

  const [text, setText] = useState("");
  const [author, setAuthor] = useState(user ? user.full_name : "");
  const [era, setEra] = useState<IdeaEra>("fire");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<string | null>(null);

  // Sync author name with logged in user profile
  useEffect(() => {
    if (user) {
      setAuthor(user.full_name);
    } else {
      setAuthor("");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Require login on submit
    if (!user) {
      openAuthModal("signin", "Please sign in or create an account to submit your idea.");
      return;
    }

    if (!text.trim()) {
      setError("Please write your idea before submitting.");
      return;
    }

    const authorName = author.trim() || user.full_name || "Anonymous";

    setSubmitting(true);

    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), author: authorName, era }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Your idea could not be received.");
        setSubmitting(false);
        return;
      }

      // Sync submission back to user profile metadata for dashboard display
      try {
        await supabase.auth.updateUser({
          data: {
            idea_title: text.trim(),
            idea_description: `Era of ${era.charAt(0).toUpperCase() + era.slice(1)}: ${text.trim().slice(0, 45)}...`,
            submission_status: "Pending",
          },
        });
        await refreshUser();
      } catch (metaErr) {
        console.error("Failed to update user profile idea metadata:", metaErr);
      }

      setSuccess(data.idea.id);
      router.push(`/ideas/${data.idea.id}`);
    } catch {
      setError("The connection faltered. Try again.");
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 text-2xl mb-4"
        >
          ✦
        </motion.div>
        <p className="text-text-tertiary">Entering the gallery...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Idea text */}
      <div>
        <label
          htmlFor="idea-text"
          className="mb-2 block text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted"
        >
          Your Thought
        </label>
        <textarea
          id="idea-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What brilliance lies in your mind?"
          rows={3}
          maxLength={280}
          className="w-full resize-none rounded-xl border border-border-default bg-bg-dark p-4 text-sm text-white placeholder-text-muted transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20"
        />
        <p className="mt-1.5 text-right text-xs text-text-muted">
          {text.length}/280
        </p>
      </div>

      {/* Author */}
      <div>
        <label
          htmlFor="idea-author"
          className="mb-2 block text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted"
        >
          Your Name
        </label>
        {user ? (
          <input
            id="idea-author"
            type="text"
            value={author}
            disabled
            className="w-full rounded-xl border border-border-default bg-bg-dark px-4 py-3 text-sm text-white/70 cursor-not-allowed select-none focus:outline-none"
          />
        ) : (
          <div className="w-full rounded-xl border border-dashed border-border-default bg-bg-dark px-4 py-3 text-sm text-text-muted italic">
            Sign in to use your profile name
          </div>
        )}
      </div>

      {/* Era selector */}
      <div>
        <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted">
          Choose Your Element
        </label>
        <div className="flex gap-3">
          {(["fire", "night", "sun"] as const).map((e) => {
            const cfg = ERA_CONFIG[e];
            const selected = era === e;
            return (
              <motion.button
                key={e}
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setEra(e)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all",
                  selected
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-border-default bg-bg-dark text-text-muted hover:border-white/[0.20] hover:text-white"
                )}
              >
                <span>{cfg.icon}</span>
                <span>{cfg.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Error */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-accent bg-accent/5 px-4 py-2 rounded-lg border border-accent/10"
        >
          {error}
        </motion.p>
      )}

      {/* Submit */}
      <motion.button
        type="submit"
        disabled={submitting}
        whileHover={submitting ? {} : { scale: 1.02 }}
        whileTap={submitting ? {} : { scale: 0.98 }}
        className="relative w-full rounded-xl px-5 py-3.5 text-sm font-semibold text-white overflow-hidden transition-all duration-300 glow-hover-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-primary via-primary-dark to-secondary" />
        <span className="relative z-10 flex items-center justify-center gap-2">
          {submitting ? (
            <>
              <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Submitting...
            </>
          ) : !user ? (
            <>
              <span>Sign In to Submit</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </>
          ) : (
            <>
              <span>Submit to the Gallery</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0 0l-6.75-6.75M12 19.5l6.75-6.75" />
              </svg>
            </>
          )}
        </span>
      </motion.button>

      {/* Guest hint */}
      {!user && (
        <p className="text-center text-xs text-text-muted">
          <button
            type="button"
            onClick={() => openAuthModal("signin", "Sign in to submit your idea to the gallery.")}
            className="text-primary hover:underline font-medium"
          >
            Sign in
          </button>{" "}
          or{" "}
          <button
            type="button"
            onClick={() => openAuthModal("signup")}
            className="text-primary hover:underline font-medium"
          >
            create an account
          </button>{" "}
          to share your idea.
        </p>
      )}
    </form>
  );
}
