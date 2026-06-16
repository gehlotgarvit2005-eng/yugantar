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

    if (!user) {
      openAuthModal("signin", "Please sign in or create an account to submit your idea.");
      return;
    }

    if (!text.trim() || !author.trim()) {
      setError("The gallery awaits your thought and your name.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), author: author.trim(), era }),
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

  if (!user) {
    return (
      <div className="text-center py-8 px-6 border border-dashed border-white/[0.08] rounded-2xl bg-white/[0.01] backdrop-blur-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.04] border border-white/[0.06] text-accent mx-auto mb-4 text-lg">
          🔒
        </div>
        <h3 className="text-sm font-bold text-white mb-1.5">Locked for Guests</h3>
        <p className="text-xs text-text-tertiary mb-5">
          Please sign in or create an account to submit your idea.
        </p>
        <button
          type="button"
          onClick={() => openAuthModal("signin", "Please sign in or create an account to submit your idea.")}
          className="relative inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white rounded-lg overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-primary to-secondary" />
          <span className="relative z-10">Sign In / Register</span>
        </button>
      </div>
    );
  }

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
          className="w-full resize-none rounded-xl border border-white/[0.08] bg-bg-surface p-4 text-sm text-text-secondary placeholder-text-muted transition-all focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
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
        <input
          id="idea-author"
          type="text"
          value={author}
          disabled
          placeholder="Your profile name"
          maxLength={40}
          className="w-full rounded-xl border border-white/[0.08] bg-bg-surface/50 px-4 py-3 text-sm text-text-muted cursor-not-allowed select-none focus:outline-none"
        />
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
                    ? cn(
                        "border border-primary/20 bg-primary/5 text-primary"
                      )
                    : "border-white/[0.06] text-text-muted hover:border-white/[0.12] hover:text-text-tertiary"
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
              Consulting the Oracle...
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
    </form>
  );
}
