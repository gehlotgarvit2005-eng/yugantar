"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ScrollReveal } from "@/components/ScrollReveal";
import { WordReveal } from "@/components/WordReveal";
import { ParticleField } from "@/components/ParticleField";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

const contactChannels = [
  {
    icon: "✦",
    label: "Oracle",
    value: "oracle@yugantar.io",
    href: "mailto:oracle@yugantar.io",
    desc: "For ideas seeking refinement",
    gradient: "from-primary/20 to-primary/5",
    border: "border-primary/20",
    textColor: "text-primary",
  },
  {
    icon: "◆",
    label: "The Archive",
    value: "@yugantar_ideas",
    href: "https://twitter.com",
    desc: "Follow the tribe on X",
    gradient: "from-secondary/20 to-secondary/5",
    border: "border-secondary/20",
    textColor: "text-secondary",
  },
  {
    icon: "✦",
    label: "The Fire",
    value: "github.com/yugantar",
    href: "https://github.com",
    desc: "Contribute to the code",
    gradient: "from-accent/20 to-accent/5",
    border: "border-accent/20",
    textColor: "text-accent",
  },
];

export default function ContactPage() {
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
            Connect
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          </div>
          <WordReveal
            text="Reach Into the Darkness"
            as="h1"
            mode="word"
            stagger={0.04}
            delay={0.1}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white"
          />
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-text-tertiary"
          >
            The cave has ears. Whether you carry a thought, a question, or a spark — 
            the tribe is listening.
          </motion.p>
        </motion.div>

        {/* Contact Channels */}
        <ScrollReveal className="mt-16">
          <div className="grid gap-5">
            {contactChannels.map((channel) => (
              <motion.div
                key={channel.label}
                whileHover={{ x: 6 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`group flex items-center gap-5 p-6 glass-card bg-gradient-to-r ${channel.gradient}`}
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl ${channel.textColor} bg-white/[0.04] border ${channel.border}`}>
                  {channel.icon}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium uppercase tracking-widest text-text-muted">{channel.label}</p>
                  <Link
                    href={channel.href}
                    className={`mt-0.5 block text-sm font-medium text-text-secondary hover:${channel.textColor} transition-colors`}
                  >
                    {channel.value}
                  </Link>
                  <p className="mt-0.5 text-xs text-text-muted">{channel.desc}</p>
                </div>
                <motion.span
                  className={`text-text-muted transition-colors group-hover:${channel.textColor}`}
                  whileHover={{ x: 3 }}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </motion.span>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>

        {/* Message card */}
        <ScrollReveal className="mt-12">
          <div className="glass-card p-8 md:p-10 text-center border-primary/10 bg-primary/[0.02]">
            <span className="text-3xl">🕯️</span>
            <p className="mt-4 text-sm italic leading-relaxed text-text-tertiary">
              &ldquo;A message left in the cave reaches the Oracle faster than the wind. 
              Speak clearly, and the fire will carry your voice.&rdquo;
            </p>
            <div className="mt-6">
              <p className="text-xs text-text-muted">
                — Ancient Yugantar saying
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* Back link */}
        <ScrollReveal className="mt-14 text-center">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-xs text-text-tertiary hover:text-white transition-colors"
          >
            <span className="h-px w-8 bg-white/[0.08] group-hover:bg-white/[0.15] transition-colors" />
            Return to the Entrance
            <span className="h-px w-8 bg-white/[0.08] group-hover:bg-white/[0.15] transition-colors" />
          </Link>
        </ScrollReveal>
      </div>
    </motion.div>
  );
}
