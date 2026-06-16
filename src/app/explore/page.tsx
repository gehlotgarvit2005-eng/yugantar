"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ERA_CONFIG, type Idea } from "@/lib/ideas";
import { SubmitIdea } from "@/components/SubmitIdea";
import { ScrollReveal } from "@/components/ScrollReveal";
import { WordReveal } from "@/components/WordReveal";
import { cn } from "@/lib/utils";
import { ParticleField } from "@/components/ParticleField";

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function SkeletonCard() {
  return (
    <div className="glass-card p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="skeleton h-5 w-16 rounded-lg" />
          <div className="skeleton h-5 w-12 rounded-lg" />
        </div>
        <div className="space-y-2">
          <div className="skeleton h-3 w-full rounded-lg" />
          <div className="skeleton h-3 w-3/4 rounded-lg" />
        </div>
        <div className="skeleton h-3 w-20 rounded-lg" />
        <div className="flex items-center gap-2 pt-3 border-t border-white/[0.04]">
          <div className="skeleton h-8 w-8 rounded-full" />
          <div className="skeleton h-3 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default function ExplorePage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    async function fetchIdeas() {
      try {
        const res = await fetch("/api/ideas");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setIdeas(data.ideas ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load ideas");
      } finally {
        setLoading(false);
      }
    }
    fetchIdeas();
  }, []);

  const filteredIdeas = filter
    ? ideas.filter((i) => i.era === filter)
    : ideas;

  const counts = {
    fire: ideas.filter((i) => i.era === "fire").length,
    night: ideas.filter((i) => i.era === "night").length,
    sun: ideas.filter((i) => i.era === "sun").length,
  };

  return (
    <div className="relative flex-1">
      <ParticleField count={40} />

      <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
        {/* ═══ HEADER ═══ */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 glass rounded-full text-xs font-medium text-text-tertiary"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Idea Gallery
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          </motion.div>

          <WordReveal
            text="All Ideas of the Tribe"
            as="h1"
            mode="word"
            stagger={0.04}
            delay={0.1}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white"
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-text-tertiary"
          >
            Every thought offered to the collective. The refined mind of Yugantar.
          </motion.p>

          {/* Filter badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-8 flex items-center justify-center gap-3 flex-wrap"
          >
            <button
              onClick={() => setFilter(null)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-full border transition-all duration-200",
                !filter
                  ? "bg-white/[0.06] border-white/[0.12] text-white"
                  : "border-white/[0.06] text-text-tertiary hover:border-white/[0.12] hover:text-text-secondary"
              )}
            >
              All ({ideas.length})
            </button>
            {(["fire", "night", "sun"] as const).map((era) => {
              const cfg = ERA_CONFIG[era];
              const isActive = filter === era;
              return (
                <button
                  key={era}
                  onClick={() => setFilter(isActive ? null : era)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-full border transition-all duration-200",
                    isActive
                      ? "bg-primary/10 border-primary/20 text-primary"
                      : "border-white/[0.06] text-text-tertiary hover:border-white/[0.12] hover:text-text-secondary"
                  )}
                >
                  <span>{cfg.icon}</span>
                  <span>{cfg.label} ({counts[era]})</span>
                </button>
              );
            })}
          </motion.div>
        </div>

        {/* ═══ Submit Idea ═══ */}
        <div className="mb-16">
          <div className="glass-card p-8 md:p-10 border-primary/10 bg-primary/[0.02]">
            <div className="mb-6 text-center">
              <h2 className="text-xl font-bold text-white">
                Submit Your Idea
              </h2>
              <p className="mt-1 text-sm text-text-tertiary">
                Speak your thought. Share it with the Yugantar community.
              </p>
            </div>
            <div className="mx-auto" style={{ maxWidth: "500px" }}>
              <SubmitIdea />
            </div>
          </div>
        </div>

        {/* ═══ Ideas Grid ═══ */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <SkeletonCard />
              </motion.div>
            ))}
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 text-center"
          >
            <p className="text-sm text-text-tertiary">{error}</p>
          </motion.div>
        ) : filteredIdeas.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-16 text-center"
          >
            <motion.p
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="text-4xl"
            >
              🕯️
            </motion.p>
            <p className="mt-4 text-sm text-text-tertiary">
              {filter
                ? `No ideas in this category yet.`
                : "The gallery awaits. Be the first to share your thought."}
            </p>
          </motion.div>
        ) : (
          <>
            <motion.div
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {filteredIdeas.map((idea) => (
                <motion.div key={idea.id} variants={cardVariants}>
                  <IdeaCard idea={idea} />
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-16 text-center"
            >
              <div className="separator max-w-xs mx-auto" />
              <p className="mt-5 text-xs text-text-muted">
                {filteredIdeas.length} idea{filteredIdeas.length !== 1 ? "s" : ""} in the collection. The gallery grows every day.
              </p>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Premium Idea Card ──────────────────────────────────────────────

function IdeaCard({ idea }: { idea: Idea }) {
  const cfg = ERA_CONFIG[idea.era];

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Link
        href={`/ideas/${idea.id}`}
        className="group block glass-card p-6 h-full"
      >
        {/* Top row */}
        <div className="mb-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border border-primary/20 bg-primary/5 text-primary">
            <span>{cfg.icon}</span>
            <span>{cfg.label}</span>
          </span>
          <span className="flex items-center gap-1 text-xs text-text-muted">
            <span>{idea.upvotes}</span>
            <span className="text-text-tertiary">✦</span>
          </span>
        </div>

        {/* Text */}
        <blockquote className="text-sm leading-relaxed text-text-secondary group-hover:text-white transition-colors duration-300">
          &ldquo;{idea.text}&rdquo;
        </blockquote>

        {/* Status */}
        <div className="mt-3">
          {idea.ai_explanation ? (
            <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-accent/70">
              <span className="h-1 w-1 rounded-full bg-accent" />
              Oracle has spoken
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-text-muted">
              <span className="h-1 w-1 rounded-full bg-text-muted" />
              Awaiting the Oracle
            </span>
          )}
        </div>

        {/* Author */}
        <div className="mt-3 flex items-center gap-2.5 pt-3 border-t border-white/[0.04]">
          <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium bg-gradient-to-br from-primary/20 to-accent/20 text-accent border border-white/[0.06]">
            {idea.author.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-text-tertiary">{idea.author}</span>
            <span className="text-[10px] text-text-muted">
              {idea.created_at ? new Date(idea.created_at).toLocaleDateString() : "Ancient times"}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
