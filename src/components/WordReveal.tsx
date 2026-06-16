"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface WordRevealProps {
  text: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  className?: string;
  letterClassName?: string;
  mode?: "word" | "letter" | "blur";
  delay?: number;
  stagger?: number;
  once?: boolean;
}

export function WordReveal({
  text,
  as: Tag = "p",
  className,
  letterClassName,
  mode = "word",
  delay = 0,
  stagger = 0.04,
  once = true,
}: WordRevealProps) {
  if (mode === "blur") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <Tag className={className}>{text}</Tag>
      </motion.div>
    );
  }

  const words = text.split(" ");
  const letters = text.split("");

  return (
    <Tag className={cn("inline", className)}>
      {(mode === "word" ? words : letters).map((item, i) => (
        <motion.span
          key={i}
          className={cn("inline-block", letterClassName)}
          initial={{ opacity: 0, y: mode === "word" ? 30 : 20, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            duration: 0.5,
            delay: delay + i * stagger,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          {item}
          {mode === "word" && i < words.length - 1 && "\u00A0"}
        </motion.span>
      ))}
    </Tag>
  );
}

interface FadeInViewProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  duration?: number;
}

export function FadeInView({
  children,
  className,
  delay = 0,
  y = 20,
  duration = 0.6,
}: FadeInViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface ScaleInViewProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function ScaleInView({ children, className, delay = 0 }: ScaleInViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
