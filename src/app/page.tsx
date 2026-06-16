"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getFeaturedIdeas, ERA_CONFIG, type Idea } from "@/lib/ideas";
import { HERO_STATS } from "@/lib/constants";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { cn } from "@/lib/utils";
import { MagneticButton } from "@/components/MagneticButton";
import { HeroBackground } from "@/components/HeroBackground";
import { AnimatedHeading, AnimatedText, AnimatedSection, StaggerContainer, staggerItem } from "@/components/AnimatedElements";
import { EventCountdownTimeline } from "@/components/EventCountdownTimeline";

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const featured = getFeaturedIdeas();

  // Refs for section containers (used for scroll-based effects)
  const featuredRef = useRef<HTMLDivElement>(null);
  const communityRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative flex flex-col">
      {/* ════════════════════════════════════════════════════════════ */}
      {/* HERO — Cinematic Full-Viewport Experience                   */}
      {/* ════════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden"
      >
        {/* 6-Layer Cinematic Background System */}
        <HeroBackground />

        {/* Hero Content */}
        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
          {/* Premium badge — blur reveal */}
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 text-xs font-medium text-text-tertiary glass rounded-full"
          >
            <span className="flex h-1.5 w-1.5 rounded-full bg-primary animate-glow-pulse" />
            Where Ideas Become Movements
            <span className="flex h-1.5 w-1.5 rounded-full bg-accent animate-glow-pulse" style={{ animationDelay: "1s" }} />
          </motion.div>

          {/* Main headline — cinematic letter-by-letter reveal with shimmer + float */}
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold leading-[0.9] tracking-[-0.05em] animate-title-float">
            {"YUGANTAR".split("").map((letter, i) => (
              <motion.span
                key={i}
                className="inline-block animate-title-shimmer"
                style={{
                  background: "linear-gradient(135deg, #FF3B30 0%, #FF6A3D 25%, #FFB347 50%, #FF6A3D 75%, #FF3B30 100%)",
                  backgroundSize: "300% 100%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  textShadow: "0 0 80px rgba(255,59,48,0.15), 0 0 40px rgba(255,179,71,0.08)",
                }}
                initial={{ opacity: 0, y: 50, scale: 0.9, filter: "blur(12px)" }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: 0.15 + i * 0.06,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {letter === " " ? "\u00A0" : letter}
              </motion.span>
            ))}
          </h1>

          {/* Subheadline — animated */}
          <AnimatedText
            text="Discover visionaries, innovators, leaders, and creators shaping tomorrow."
            className="mt-6 text-lg sm:text-xl md:text-2xl font-medium text-text-secondary max-w-2xl mx-auto leading-relaxed"
            delay={0.5}
          />

          {/* Description — animated */}
          <AnimatedText
            text="A refined gallery of bold ideas. Where great minds leave their mark."
            className="mt-3 text-base text-text-tertiary max-w-lg mx-auto"
            delay={0.8}
          />

          {/* CTA Buttons — Magnetic + Ripple */}
          <motion.div
            initial={{ opacity: 0, y: 25, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <MagneticButton as="a" href="/explore">
              <span className="group relative inline-flex items-center gap-2.5 px-8 py-3.5 text-sm font-semibold text-white rounded-xl overflow-hidden transition-all duration-300 glow-hover-primary btn-ripple">
                <span className="absolute inset-0 bg-gradient-to-r from-primary via-primary-dark to-secondary opacity-100 group-hover:opacity-90 transition-opacity duration-300" />
                {/* Shine sweep overlay */}
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent animate-shine-sweep pointer-events-none" />
                <span className="relative z-10 flex items-center gap-2.5">
                  Explore Ideas
                  <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </span>
              </span>
            </MagneticButton>
            <MagneticButton as="a" href="/about">
              <span className="group relative inline-flex items-center gap-2.5 px-8 py-3.5 text-sm font-medium text-text-secondary rounded-xl overflow-hidden transition-all duration-300 border border-white/[0.10] hover:border-white/[0.20] hover:text-white glass btn-ripple"
                style={{
                  boxShadow: "0 0 20px rgba(255,59,48,0.06), 0 0 0px rgba(255,179,71,0)",
                  transition: "box-shadow 0.3s ease, border-color 0.3s ease, color 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 0 30px rgba(255,59,48,0.12), 0 0 60px rgba(255,179,71,0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 0 20px rgba(255,59,48,0.06), 0 0 0px rgba(255,179,71,0)";
                }}
              >
                <span className="relative z-10 flex items-center gap-2.5">
                  Learn More
                  <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                  </svg>
                </span>
              </span>
            </MagneticButton>
          </motion.div>

          {/* Animated Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 30, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto"
          >
            {HERO_STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.8 + i * 0.1 }}
                className="flex flex-col items-center gap-1"
              >
                <span className="text-2xl sm:text-3xl font-bold text-white animated-counter">
                  <AnimatedCounter to={stat.value} suffix={stat.suffix} duration={2.5} />
                </span>
                <span className="text-xs text-text-tertiary font-medium">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0, filter: "blur(4px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ delay: 2.0 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] font-medium uppercase tracking-widest text-text-muted">Scroll</span>
          <motion.svg
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="h-3.5 w-3.5 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </motion.svg>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* EVENT COUNTDOWN & TIMELINE SECTION                          */}
      {/* ════════════════════════════════════════════════════════════ */}
      <EventCountdownTimeline />

      {/* ════════════════════════════════════════════════════════════ */}
      {/* FEATURED SPEAKERS SECTION                                   */}
      {/* ════════════════════════════════════════════════════════════ */}
      <AnimatedSection className="py-24 md:py-32">
        <section ref={featuredRef} className="mx-auto max-w-6xl px-6">
          {/* Section header — animated */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 glass rounded-full text-xs font-medium text-text-tertiary mb-4">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Featured Voices
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              </div>
            </motion.div>
            <AnimatedHeading
              text="Visionaries of the Tribe"
              as="h2"
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mt-4"
              delay={0.1}
            />
            <AnimatedText
              text="The most celebrated thoughts from our community. Each one a spark of brilliance."
              className="mt-4 text-base text-text-tertiary max-w-lg mx-auto"
              delay={0.3}
            />
          </div>

          {/* Speaker Cards Grid */}
          <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" staggerDelay={0.08}>
            {featured.map((idea, index) => (
              <motion.div key={idea.id} variants={staggerItem}>
                <div className="idea-card">
                  <IdeaCard idea={idea} index={index} />
                </div>
              </motion.div>
            ))}
          </StaggerContainer>

          {/* View all link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-14 text-center"
          >
            <Link
              href="/explore"
              className="group inline-flex items-center gap-2 text-sm text-text-tertiary hover:text-white transition-colors duration-200"
            >
              <span className="h-px w-8 bg-white/[0.08] group-hover:bg-white/[0.15] transition-colors" />
              <span>View All Ideas</span>
              <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
              <span className="h-px w-8 bg-white/[0.08] group-hover:bg-white/[0.15] transition-colors" />
            </Link>
          </motion.div>
        </section>
      </AnimatedSection>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* TRENDING TALKS / COMMUNITY SECTION                           */}
      {/* ════════════════════════════════════════════════════════════ */}
      <AnimatedSection className="py-24 md:py-32 bg-bg-dark/50" delay={0.1}>
        <section ref={communityRef} className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 glass rounded-full text-xs font-medium text-text-tertiary mb-4">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-glow-pulse" />
                Community
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-glow-pulse" style={{ animationDelay: "1s" }} />
              </div>
            </motion.div>
            <AnimatedHeading
              text="Join the Movement"
              as="h2"
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mt-4"
              delay={0.1}
            />
            <AnimatedText
              text="Speak your thought — let it echo through the ages. The tribe is waiting."
              className="mt-4 text-base text-text-tertiary max-w-lg mx-auto"
              delay={0.3}
            />
          </div>

          {/* Community CTA Cards */}
          <StaggerContainer className="grid gap-6 md:grid-cols-3" staggerDelay={0.1}>
            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                  </svg>
                ),
                title: "Share Your Voice",
                desc: "Every great movement starts with a single thought. Submit your idea to the gallery.",
                action: "Submit Idea",
                href: "/explore",
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
                title: "Explore Ideas",
                desc: "Discover bold thoughts from visionaries, innovators, and creators worldwide.",
                action: "Explore",
                href: "/explore",
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                  </svg>
                ),
                title: "The Atrium",
                desc: "An interactive experience where ideas come alive through light and motion.",
                action: "Experience",
                href: "/cave",
              },
            ].map((card, i) => (
              <motion.div key={card.title} variants={staggerItem}>
                <Link
                  href={card.href}
                  className="community-card group block glass-card p-8 h-full"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.06] text-primary mb-5 group-hover:scale-110 transition-transform duration-300">
                    {card.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{card.title}</h3>
                  <p className="text-sm text-text-tertiary leading-relaxed mb-5">{card.desc}</p>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary group-hover:gap-2.5 transition-all duration-200">
                    {card.action}
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </span>
                </Link>
              </motion.div>
            ))}
          </StaggerContainer>
        </section>
      </AnimatedSection>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* BOTTOM DIVIDER                                              */}
      {/* ════════════════════════════════════════════════════════════ */}
      <AnimatedSection className="mx-auto mb-10 w-full max-w-2xl px-6" delay={0.2}>
        <div className="separator" />
        <AnimatedText
          text="The gallery is always open. Great ideas never fade."
          className="mt-5 text-center text-xs text-text-muted"
        />
      </AnimatedSection>
    </div>
  );
}

// ─── Premium Idea Card ──────────────────────────────────────────────

function IdeaCard({ idea, index }: { idea: Idea; index: number }) {
  const cfg = ERA_CONFIG[idea.era];

  return (
    <Link
      href={`/ideas/${idea.id}`}
      className="group block glass-card p-6 h-full"
    >
      {/* Badge row */}
      <div className="mb-4 flex items-center justify-between">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border",
            cfg.color === "primary" ? "border-primary/20 bg-primary/5 text-primary" :
            cfg.color === "secondary" ? "border-secondary/20 bg-secondary/5 text-secondary" :
            "border-accent/20 bg-accent/5 text-accent"
          )}
        >
          <span>{cfg.icon}</span>
          <span>{cfg.label}</span>
        </span>
        <span className="flex items-center gap-1 text-xs text-text-muted">
          <span>{idea.upvotes}</span>
          <span className={cn(
            "text-sm",
            index === 0 ? "text-primary" : index === 1 ? "text-secondary" : "text-accent"
          )}>✦</span>
        </span>
      </div>

      {/* Quote */}
      <blockquote className="text-sm leading-relaxed text-text-secondary group-hover:text-white transition-colors duration-300">
        &ldquo;{idea.text}&rdquo;
      </blockquote>



      {/* Author */}
      <div className="mt-4 flex items-center gap-2.5 pt-4 border-t border-white/[0.04]">
        <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium bg-gradient-to-br from-primary/20 to-accent/20 text-accent border border-white/[0.06]">
          {idea.author.charAt(0)}
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-text-tertiary">{idea.author}</span>
          <span className="text-[10px] text-text-muted">{idea.date}</span>
        </div>
      </div>
    </Link>
  );
}
