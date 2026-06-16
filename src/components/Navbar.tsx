"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Navbar() {
  const { user, openAuthModal } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("/");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      setActiveSection(window.location.pathname);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-bg-deep/80 backdrop-blur-xl border-b border-border-subtle shadow-lg shadow-black/5"
          : "bg-transparent"
      )}
    >
      <nav className="mx-auto flex h-16 items-center justify-between px-6 max-w-7xl">
        {/* Logo */}
        <Link href="/" className="flex items-center group relative">
          <Image
            src="/logo.png"
            alt="Yugantar"
            width={1600}
            height={759}
            className="object-contain transition-all duration-300 group-hover:scale-105 group-hover:brightness-110"
            style={{ height: "40px", width: "auto", maxHeight: "40px" }}
            priority
          />
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 group-hover:w-full rounded-full" />
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = activeSection === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "relative rounded-lg px-4 py-2 text-xs font-medium transition-all duration-200",
                    isActive
                      ? "text-white"
                      : "text-text-tertiary hover:text-white hover:bg-white/[0.04]"
                  )}
                  style={{ letterSpacing: "0.02em" }}
                >
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute inset-0 rounded-lg bg-white/[0.06] -z-10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
          {/* Header Authentication Button */}
          <li className="ml-2">
            {user ? (
              <button
                onClick={() => openAuthModal("dashboard")}
                className="relative group inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-text-secondary rounded-lg border border-white/[0.08] hover:border-white/[0.16] hover:text-white glass btn-ripple cursor-pointer"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 text-accent text-[9px] font-bold">
                  {user.full_name.charAt(0).toUpperCase()}
                </div>
                <span>Dashboard</span>
              </button>
            ) : (
              <button
                onClick={() => openAuthModal("signin")}
                className="relative group inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-text-secondary rounded-lg border border-white/[0.08] hover:border-white/[0.16] hover:text-white glass btn-ripple cursor-pointer"
              >
                Register / Login
              </button>
            )}
          </li>

          {/* Premium CTA button */}
          <li className="ml-2">
            <Link
              href="/explore"
              onClick={(e) => {
                if (!user) {
                  e.preventDefault();
                  openAuthModal("signin", "Please sign in or create an account to submit your idea.");
                }
              }}
              className="relative group inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white rounded-lg overflow-hidden transition-all duration-300"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10 flex items-center gap-2">
                Submit Idea
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0 0l-6.75-6.75M12 19.5l6.75-6.75" />
                </svg>
              </span>
            </Link>
          </li>
          {/* Theme Toggle */}
          <li className="ml-3">
            <ThemeToggle />
          </li>
        </ul>

        {/* Mobile toggle */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center justify-center rounded-lg p-2 text-text-tertiary hover:text-white hover:bg-white/[0.04] transition-all md:hidden"
          aria-label="Toggle navigation menu"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            )}
          </svg>
        </motion.button>
      </nav>

      {/* Mobile menu — premium slide-down */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden border-t border-border-subtle bg-bg-deep/95 backdrop-blur-xl"
          >
            <ul className="space-y-1 px-6 py-4">
              {NAV_LINKS.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="block rounded-lg px-4 py-3 text-sm font-medium text-text-tertiary hover:text-white hover:bg-white/[0.04] transition-all"
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
              {/* Mobile Auth Button */}
              <motion.li
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: 0.25 }}
              >
                {user ? (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      openAuthModal("dashboard");
                    }}
                    className="w-full block rounded-lg px-4 py-3 text-sm font-semibold text-white bg-white/[0.04] border border-white/[0.08] mt-2 text-center"
                  >
                    Dashboard ({user.full_name})
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      openAuthModal("signin");
                    }}
                    className="w-full block rounded-lg px-4 py-3 text-sm font-semibold text-white bg-white/[0.04] border border-white/[0.08] mt-2 text-center"
                  >
                    Register / Login
                  </button>
                )}
              </motion.li>

              {/* Mobile Submit Idea button */}
              <motion.li
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: 0.3 }}
              >
                <Link
                  href="/explore"
                  onClick={(e) => {
                    setIsOpen(false);
                    if (!user) {
                      e.preventDefault();
                      openAuthModal("signin", "Please sign in or create an account to submit your idea.");
                    }
                  }}
                  className="block rounded-lg px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary to-secondary mt-2 text-center"
                >
                  Submit Idea
                </Link>
              </motion.li>

              {/* Mobile Appearance Settings */}
              <motion.li
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: 0.35 }}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.02] dark:bg-white/[0.02] light:bg-black/[0.02] border border-white/[0.04] dark:border-white/[0.04] light:border-black/[0.04] mt-3"
              >
                <span className="text-xs font-semibold text-text-secondary">Appearance</span>
                <ThemeToggle />
              </motion.li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
