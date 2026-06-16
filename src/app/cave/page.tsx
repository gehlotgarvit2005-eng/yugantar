"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/ScrollReveal";
import { WordReveal } from "@/components/WordReveal";
import { CaveInteractive } from "@/components/CaveInteractive";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

export default function CavePage() {
  useEffect(() => {
    document.title = "The Atrium | Yugantar";
  }, []);

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={stagger}
      className="mx-auto px-6"
      style={{ maxWidth: "1200px", paddingTop: "100px", paddingBottom: "100px" }}
    >
      {/* Page Header */}
      <motion.div variants={fadeUp} className="mb-10 text-center">
        <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 glass rounded-full text-xs font-medium text-text-tertiary">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Interactive
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        </div>
        <WordReveal
          text="The Atrium"
          as="h1"
          mode="word"
          stagger={0.04}
          delay={0.1}
          className="text-4xl sm:text-5xl md:text-6xl font-bold text-white"
        />
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-text-tertiary">
          Move your cursor like light through crystal. Touch the orbs to awaken the elements.
        </p>
      </motion.div>

      {/* Interactive space */}
      <ScrollReveal>
        <div className="glass overflow-hidden rounded-2xl border-white/[0.08]">
          <CaveInteractive />
        </div>
      </ScrollReveal>

      {/* Legend */}
      <ScrollReveal className="mt-12">
        <div className="grid gap-5 sm:grid-cols-3">
          {([
            {
              icon: "✦",
              title: "Gold",
              desc: "Warm as fortune, bright as ambition. The mark of lasting value.",
              gradient: "from-primary/20 to-primary/5",
              border: "border-primary/20",
              textColor: "text-primary",
            },
            {
              icon: "◆",
              title: "Platinum",
              desc: "Cool as precision, rare as vision. The signature of distinction.",
              gradient: "from-secondary/20 to-secondary/5",
              border: "border-secondary/20",
              textColor: "text-secondary",
            },
            {
              icon: "✦",
              title: "Champagne",
              desc: "Light as celebration, warm as welcome. The essence of elegance.",
              gradient: "from-accent/20 to-accent/5",
              border: "border-accent/20",
              textColor: "text-accent",
            },
          ] as const).map((el, i) => (
            <motion.div
              key={el.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
              whileHover={{ y: -4 }}
              className={`glass-card p-5 bg-gradient-to-br ${el.gradient}`}
            >
              <div className="flex items-center gap-3">
                <motion.span
                  className={`text-2xl ${el.textColor}`}
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
                >
                  {el.icon}
                </motion.span>
                <h3 className={`text-base font-semibold ${el.textColor}`}>{el.title}</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-text-tertiary">
                {el.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </ScrollReveal>
    </motion.div>
  );
}
