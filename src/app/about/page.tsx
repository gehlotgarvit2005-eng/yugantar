"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ScrollReveal } from "@/components/ScrollReveal";
import { WordReveal } from "@/components/WordReveal";
import { ParticleField } from "@/components/ParticleField";
import { TeamSection } from "@/components/TeamSection";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

export default function AboutPage() {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={stagger}
      className="relative min-h-screen"
    >
      <ParticleField count={30} />

      <div className="mx-auto max-w-4xl px-6 py-24 md:py-32">
        {/* Header */}
        <motion.div variants={fadeUp} className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 glass rounded-full text-xs font-medium text-text-tertiary">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            About
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          </div>
          <WordReveal
            text="The Yugantar Manifesto"
            as="h1"
            mode="word"
            stagger={0.04}
            delay={0.1}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white"
          />
        </motion.div>

        {/* Intro */}
        <motion.p
          variants={fadeUp}
          className="mx-auto mt-8 max-w-2xl text-center text-lg leading-relaxed text-text-secondary"
        >
          <span className="italic text-text-primary">&ldquo;Ideas Strong Like Mammoth&rdquo;</span> — a gathering of thoughts
          that refuse to freeze in the ice. A cold storage for the warmest ideas.
        </motion.p>

        {/* Core Pillars */}
        <ScrollReveal className="mt-16">
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: "✦",
                title: "Vision",
                desc: "Ideas that see beyond the horizon. Bold visions that shape the future of the tribe.",
                gradient: "from-primary/20 to-primary/5",
                border: "border-primary/20",
                textColor: "text-primary",
              },
              {
                icon: "◆",
                title: "Innovation",
                desc: "The precision of deep thought. Cool, rare, and brilliantly cut from the darkness of contemplation.",
                gradient: "from-secondary/20 to-secondary/5",
                border: "border-secondary/20",
                textColor: "text-secondary",
              },
              {
                icon: "✦",
                title: "Community",
                desc: "Light as connection, warm as belonging. The celebration of ideas well-born and well-shared.",
                gradient: "from-accent/20 to-accent/5",
                border: "border-accent/20",
                textColor: "text-accent",
              },
            ].map((pillar) => (
              <motion.div
                key={pillar.title}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`glass-card p-6 bg-gradient-to-br ${pillar.gradient}`}
              >
                <span className={`text-2xl ${pillar.textColor}`}>{pillar.icon}</span>
                <h3 className={`mt-3 text-base font-semibold ${pillar.textColor}`}>
                  {pillar.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-tertiary">{pillar.desc}</p>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>

        {/* Story */}
        <ScrollReveal className="mt-16">
          <div className="glass-card p-8 md:p-10 border-primary/10 bg-primary/[0.02]">
            <h2 className="text-2xl font-bold text-white">
              The Story
            </h2>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-text-tertiary">
              <p>
                Yugantar is a Sanskrit word — <span className="italic text-text-secondary">युगान्तर</span> — meaning
                &ldquo;the end of an era&rdquo; or &ldquo;the beginning of a new one.&rdquo; It marks the
                turning point between what was and what will be.
              </p>
              <p>
                This is a gallery of ideas. Not the polished, finalized versions — but the raw,
                powerful thoughts that emerge at the boundary between epochs. The ones that
                feel too big to speak, yet too urgent to hold.
              </p>
              <p>
                Here, every idea is cast in one of three eternal materials:{" "}
                <span className="text-primary font-medium">Gold</span> for
                the bold and warm, <span className="text-secondary font-medium">Platinum</span> for the cool and refined, and{" "}
                <span className="text-accent font-medium">Champagne</span> for the bright and celebratory.
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* Values */}
        <ScrollReveal className="mt-12">
          <h2 className="mb-6 text-center text-xl font-bold text-white">
            The Values
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { label: "Boldness", icon: "✦", desc: "Great ideas are never timid. They charge." },
              { label: "Timelessness", icon: "◆", desc: "A real thought survives the ice age." },
              { label: "Community", icon: "✦", desc: "The tribe that paints together thinks together." },
              { label: "Refinement", icon: "✦", desc: "Every idea deserves the Oracle's gaze." },
            ].map((value) => (
              <motion.div
                key={value.label}
                whileHover={{ x: 4 }}
                className="glass-card flex items-start gap-3 p-4"
              >
                <span className={`mt-0.5 text-lg text-accent`}>{value.icon}</span>
                <div>
                  <h4 className="text-sm font-medium text-text-secondary">{value.label}</h4>
                  <p className="text-xs text-text-muted">{value.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>

        {/* Team Section */}
        <ScrollReveal className="w-full mt-16">
          <TeamSection />
        </ScrollReveal>

        {/* CTA */}
        <ScrollReveal className="mt-16 text-center">
          <Link
            href="/explore"
            className="group relative inline-flex items-center gap-2.5 px-8 py-3.5 text-sm font-semibold text-white rounded-xl overflow-hidden transition-all duration-300 glow-hover-primary"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-primary via-primary-dark to-secondary" />
            <span className="relative z-10 flex items-center gap-2.5">
              Explore the Gallery
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </Link>
        </ScrollReveal>

        {/* Bottom divider */}
        <ScrollReveal className="mx-auto mt-20 w-full max-w-xs">
          <div className="separator" />
          <p className="mt-4 text-center text-[10px] text-text-muted">
            The cave is always open. Great ideas never fade.
          </p>
        </ScrollReveal>
      </div>
    </motion.div>
  );
}
