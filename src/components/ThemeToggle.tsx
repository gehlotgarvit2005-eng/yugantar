"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative flex h-8 w-16 items-center justify-between rounded-full border border-white/[0.08] dark:border-white/[0.08] light:border-black/[0.08] bg-white/[0.03] dark:bg-white/[0.03] light:bg-black/[0.03] p-1 shadow-inner cursor-pointer select-none"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {/* Dynamic ambient hover glow */}
      <div className="absolute inset-0 rounded-full bg-primary/5 dark:bg-primary/5 light:bg-primary/[0.02] opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Sun Icon (Light Mode) */}
      <div className="flex h-6 w-6 items-center justify-center text-amber-500 relative z-10">
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
          />
        </svg>
      </div>

      {/* Moon Icon (Dark Mode) */}
      <div className="flex h-6 w-6 items-center justify-center text-indigo-400 relative z-10">
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.75 12.83A9.53 9.53 0 0012 2.25c-5.278 0-9.562 4.258-9.562 9.5 0 5.241 4.284 9.5 9.563 9.5 3.486 0 6.54-1.854 8.243-4.63a8.9 8.9 0 01-1.077.08c-4.885 0-8.847-3.963-8.847-8.85 0-1.804.542-3.486 1.472-4.9A8.99 8.99 0 0021.75 12.83z"
          />
        </svg>
      </div>

      {/* Sliding Knob Capsule */}
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 450, damping: 28 }}
        className="absolute left-1 h-6 w-6 rounded-full shadow-md z-0 flex items-center justify-center"
        style={{
          x: theme === "light" ? 0 : 32,
          background:
            theme === "light"
              ? "radial-gradient(circle at center, #FFF, #FFE29A)"
              : "radial-gradient(circle at center, #312E81, #1E1B4B)",
          boxShadow:
            theme === "light"
              ? "0 0 10px rgba(245, 158, 11, 0.4), 0 2px 4px rgba(0,0,0,0.15)"
              : "0 0 10px rgba(99, 102, 241, 0.4), 0 2px 4px rgba(0,0,0,0.15)",
        }}
      />
    </button>
  );
}
