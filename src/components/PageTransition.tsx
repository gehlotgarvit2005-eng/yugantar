"use client";

import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface PageTransitionProps {
  children: React.ReactNode;
}

const pageVariants = {
  initial: {
    opacity: 0,
    rotateY: -10,
    rotateX: 4,
    z: -60,
    scale: 0.96,
    transformPerspective: 1200,
    filter: "blur(6px)",
  },
  animate: {
    opacity: 1,
    rotateY: 0,
    rotateX: 0,
    z: 0,
    scale: 1,
    transformPerspective: 1200,
    filter: "blur(0px)",
    transition: {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number], // easeOutQuart
    },
  },
  exit: {
    opacity: 0,
    rotateY: 10,
    rotateX: -4,
    z: -60,
    scale: 0.96,
    transformPerspective: 1200,
    filter: "blur(6px)",
    transition: {
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="w-full origin-center"
        style={{ transformStyle: "preserve-3d" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
