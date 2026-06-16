"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ERA_CONFIG, type Idea } from "@/lib/ideas";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function IdeaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [explanation, setExplanation] = useState("");
  const [isStreaming, setIsStreaming] = useState(true);
  const [upvotes, setUpvotes] = useState(0);
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const explanationRef = useRef<HTMLDivElement>(null);
  const abortedRef = useRef(false);
  const textRef = useRef("");
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    async function fetchIdea() {
      try {
        const res = await fetch(`/api/ideas/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setIdea(data.idea);
        setUpvotes(data.idea.upvotes);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Idea not found");
      } finally {
        setLoading(false);
      }
    }
    fetchIdea();
  }, [id]);

  useEffect(() => {
    if (!idea) return;
    const currentIdea = idea;

    async function streamExplanation() {
      abortedRef.current = false;

      if (currentIdea.ai_explanation) {
        setExplanation(currentIdea.ai_explanation);
        setIsStreaming(false);
        return;
      }

      try {
        const res = await fetch(`/api/ideas/${id}/explain`);
        if (!res.ok) {
          const err = await res.json();
          setError(err.error ?? "The Oracle is silent.");
          setIsStreaming(false);
          return;
        }

        const reader = res.body?.getReader();
        if (!reader) {
          setIsStreaming(false);
          return;
        }

        const decoder = new TextDecoder();
        const scheduleUpdate = () => {
          if (rafRef.current === null) {
            rafRef.current = requestAnimationFrame(() => {
              setExplanation(textRef.current);
              rafRef.current = null;
            });
          }
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done || abortedRef.current) break;
          textRef.current += decoder.decode(value, { stream: true });
          scheduleUpdate();
        }

        setExplanation(textRef.current);
        setIsStreaming(false);
      } catch {
        if (!abortedRef.current) {
          setError("The connection faltered. The Oracle's wisdom was lost.");
          setIsStreaming(false);
        }
      }
    }

    streamExplanation();
    return () => {
      abortedRef.current = true;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [idea, id]);

  useEffect(() => {
    if (explanationRef.current) {
      explanationRef.current.scrollTop = explanationRef.current.scrollHeight;
    }
  }, [explanation]);

  const handleVote = async () => {
    if (voted) return;
    setVoted(true);
    setUpvotes((prev) => prev + 1);
    fetch(`/api/ideas/${id}/vote`, { method: "POST" }).catch(() => {
      setUpvotes((prev) => prev - 1);
      setVoted(false);
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="mx-auto h-10 w-10 rounded-full bg-primary/20 border border-primary/30"
            style={{ boxShadow: "0 0 30px rgba(255, 59, 48, 0.15)" }}
          />
          <motion.p
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="mt-5 text-sm text-text-tertiary"
          >
            The Oracle is consulting the ages...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (error && !idea) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md text-center"
        >
          <p className="text-4xl">🕯️</p>
          <h1 className="mt-4 text-2xl font-bold text-text-secondary">Not Found</h1>
          <p className="mt-2 text-sm text-text-tertiary">{error}</p>
          <Link
            href="/explore"
            className="mt-6 group relative inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-xl overflow-hidden transition-all duration-300 glow-hover-primary"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-primary to-secondary" />
            <span className="relative z-10 flex items-center gap-2">
              ← Back to the Gallery
            </span>
          </Link>
        </motion.div>
      </div>
    );
  }

  if (!idea) return null;
  const cfg = ERA_CONFIG[idea.era];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto px-6"
      style={{ maxWidth: "880px", paddingTop: "100px", paddingBottom: "100px" }}
    >
      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-10"
      >
        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-white transition-colors"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Gallery
        </Link>
      </motion.div>

      {/* ═══ Header ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="mb-12"
      >
        <div className="mb-5 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border border-primary/20 bg-primary/5 text-primary">
            <span>{cfg.icon}</span>
            <span>{cfg.label}</span>
          </span>
          <span className="text-xs text-text-muted">{idea.date}</span>
        </div>

        <blockquote style={{ borderLeft: "3px solid", borderImage: "linear-gradient(to bottom, #FF3B30, #FFB347) 1", paddingLeft: "24px" }}>
          <p className="text-2xl leading-snug text-text-secondary sm:text-3xl font-medium">
            &ldquo;{idea.text}&rdquo;
          </p>
        </blockquote>

        <div className="mt-5 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium bg-gradient-to-br from-primary/20 to-accent/20 text-accent border border-white/[0.06]">
            {idea.author.charAt(0)}
          </div>
          <span className="text-sm text-text-tertiary">— {idea.author}</span>
        </div>
      </motion.div>

      {/* ═══ The Oracle ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="relative mb-14"
      >
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
            <span className="text-base text-primary">✦</span>
          </div>
          <div>
            <p className="text-sm font-medium text-primary">
              The Oracle
            </p>
            <p className="text-xs text-text-muted">
              {isStreaming ? "Composing..." : "Refinement complete"}
            </p>
          </div>
          {isStreaming && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="ml-auto flex gap-1"
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-primary/60"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                />
              ))}
            </motion.div>
          )}
        </div>

        <div
          ref={explanationRef}
          className="max-h-[60vh] overflow-y-auto glass-card p-6 md:p-8"
        >
          {explanation ? (
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary transition-opacity duration-300">
              {explanation}
              {isStreaming && <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-primary" />}
            </div>
          ) : (
            <div className="flex items-center gap-3 text-text-tertiary">
              <div className="h-4 w-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
              <p className="text-sm italic">The Oracle is weaving wisdom...</p>
            </div>
          )}
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 glass-card px-4 py-3 border-accent/20 bg-accent/5"
          >
            <p className="text-sm text-accent">{error}</p>
          </motion.div>
        )}
      </motion.div>

      {/* ═══ Voting ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="flex items-center justify-center gap-8 glass-card px-8 py-6"
      >
        <motion.button
          onClick={handleVote}
          disabled={voted}
          whileTap={voted ? {} : { scale: 0.9 }}
          animate={voted ? { scale: [1, 1.3, 0.9, 1.1, 1], transition: { duration: 0.5 } } : { scale: 1 }}
          className="group flex flex-col items-center gap-1"
          aria-label="Upvote this idea"
        >
          <motion.span
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-2xl text-3xl transition-all duration-300",
              voted
                ? "bg-primary/10 border border-primary/30 text-primary shadow-lg shadow-primary/10"
                : "bg-white/[0.03] border border-white/[0.06] text-text-muted hover:bg-white/[0.06] hover:border-white/[0.12]"
            )}
            animate={voted ? { rotate: [0, -15, 15, -10, 10, 0], transition: { duration: 0.5 } } : { rotate: 0 }}
          >
            ✦
          </motion.span>
          <span className={cn("text-lg font-semibold transition-colors duration-300", voted ? "text-primary" : "text-text-muted")}>
            {upvotes}
          </span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-text-muted">
            {voted ? "Refined ✦" : "Refine this?"}
          </span>
        </motion.button>

        <div className="h-14 w-px bg-white/[0.04]" />

        <div className="flex flex-col gap-1 text-center">
          <span className="text-[10px] font-medium uppercase tracking-wider text-text-muted">Category</span>
          <span className="text-sm font-medium text-primary">
            {cfg.icon} {cfg.label}
          </span>
        </div>

        <div className="h-14 w-px bg-white/[0.04]" />

        <div className="flex flex-col gap-1 text-center">
          <span className="text-[10px] font-medium uppercase tracking-wider text-text-muted">Shared by</span>
          <span className="text-sm font-medium text-text-tertiary">{idea.author}</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-14 text-center"
      >
        <Link
          href="/explore"
          className="group inline-flex items-center gap-2 text-xs text-text-tertiary hover:text-white transition-colors"
        >
          <span className="h-px w-8 bg-white/[0.08] group-hover:bg-white/[0.15] transition-colors" />
          See all ideas
          <span className="h-px w-8 bg-white/[0.08] group-hover:bg-white/[0.15] transition-colors" />
        </Link>
      </motion.div>
    </motion.div>
  );
}
