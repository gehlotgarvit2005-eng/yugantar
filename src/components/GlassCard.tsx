"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  glow?: "primary" | "secondary" | "accent" | "none";
  hoverEffect?: "lift" | "glow" | "both" | "none";
  className?: string;
}

export function GlassCard({
  children,
  glow = "none",
  hoverEffect = "lift",
  className,
  ...props
}: GlassCardProps) {
  const glowClass = glow !== "none" ? `glow-${glow}` : "";

  const hoverVariants = {
    lift: { y: -6, boxShadow: "0 12px 48px rgba(0,0,0,0.3)" },
    glow: { boxShadow: "0 0 30px rgba(255,59,48,0.12), 0 8px 32px rgba(0,0,0,0.3)" },
    both: {
      y: -6,
      boxShadow: "0 12px 48px rgba(0,0,0,0.3), 0 0 30px rgba(255,59,48,0.12)",
    },
    none: {},
  };

  return (
    <motion.div
      className={cn("glass-card", glowClass, className)}
      whileHover={hoverEffect !== "none" ? hoverVariants[hoverEffect] : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
