"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const addressText = "Parihar Nagar, Shri Ram Nagar, Mata Ka Than, Rawat Nagar, Jodhpur, Rajasthan - 342006";

export function Footer() {
  const [copied, setCopied] = useState(false);
  const currentYear = new Date().getFullYear();

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(addressText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  };

  return (
    <footer className="relative border-t border-border-subtle bg-bg-deep overflow-hidden pt-20 pb-8">
      {/* Top background glow sweeps */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-secondary/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6">
        {/* ════════════════════════════════════════════════════════════ */}
        {/* TOP ROW: GLASSMORPHISM CONTACT CARDS                         */}
        {/* ════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* Card 1: Call Us */}
          <motion.div
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="glass-card p-6 rounded-2xl border border-border-subtle bg-bg-glass backdrop-blur-xl flex flex-col items-center text-center shadow-lg relative group"
          >
            {/* Hover card glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />
            
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 border border-primary/20 text-primary mb-4 shadow-inner">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.824-1.802-5.14-4.118-6.944-6.94l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Call Us</h3>
            <p className="text-[11px] text-text-muted mb-4 uppercase tracking-widest leading-none">Voice & Support</p>
            <div className="flex flex-col gap-2 mt-auto w-full">
              <a
                href="tel:+919829659238"
                className="text-xs font-semibold text-text-secondary hover:text-primary transition-colors py-1.5 rounded-lg bg-white/[0.02] dark:bg-white/[0.02] light:bg-black/[0.02] border border-border-subtle hover:border-primary/25"
              >
                +91 98296 59238
              </a>
              <a
                href="tel:+918619506994"
                className="text-xs font-semibold text-text-secondary hover:text-primary transition-colors py-1.5 rounded-lg bg-white/[0.02] dark:bg-white/[0.02] light:bg-black/[0.02] border border-border-subtle hover:border-primary/25"
              >
                +91 86195 06994
              </a>
            </div>
          </motion.div>

          {/* Card 2: Write Us */}
          <motion.div
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="glass-card p-6 rounded-2xl border border-border-subtle bg-bg-glass backdrop-blur-xl flex flex-col items-center text-center shadow-lg relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/15 border border-secondary/20 text-secondary mb-4 shadow-inner">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Write Us</h3>
            <p className="text-[11px] text-text-muted mb-4 uppercase tracking-widest leading-none">Emails & Manifesto</p>
            <div className="flex flex-col gap-2 mt-auto w-full">
              <a
                href="mailto:gehlotgarvit2005@gmail.com"
                className="text-xs font-semibold text-text-secondary hover:text-secondary transition-colors py-1.5 rounded-lg bg-white/[0.02] dark:bg-white/[0.02] light:bg-black/[0.02] border border-border-subtle hover:border-secondary/25 truncate px-2"
                title="gehlotgarvit2005@gmail.com"
              >
                gehlotgarvit2005@gmail.com
              </a>
              <a
                href="mailto:sourabhsinghtak.2207@gmail.com"
                className="text-xs font-semibold text-text-secondary hover:text-secondary transition-colors py-1.5 rounded-lg bg-white/[0.02] dark:bg-white/[0.02] light:bg-black/[0.02] border border-border-subtle hover:border-secondary/25 truncate px-2"
                title="sourabhsinghtak.2207@gmail.com"
              >
                sourabhsinghtak.2207@gmail.com
              </a>
            </div>
          </motion.div>

          {/* Card 3: Visit Us */}
          <motion.div
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="glass-card p-6 rounded-2xl border border-border-subtle bg-bg-glass backdrop-blur-xl flex flex-col items-center text-center shadow-lg relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 border border-accent/20 text-accent mb-4 shadow-inner">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Visit Us</h3>
            <p className="text-[11px] text-text-muted mb-3 uppercase tracking-widest leading-none">Office Head</p>
            
            <p className="text-[11px] text-text-tertiary leading-relaxed mb-4 max-w-[220px]">
              Parihar Nagar, Shri Ram Nagar, Mata Ka Than, Rawat Nagar, Jodhpur, Rajasthan - 342006
            </p>

            <button
              onClick={handleCopyAddress}
              className="mt-auto px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl bg-white/[0.04] dark:bg-white/[0.04] light:bg-black/[0.04] border border-border-default hover:bg-white/[0.08] dark:hover:bg-white/[0.08] light:hover:bg-black/[0.08] text-text-primary transition-all w-full flex items-center justify-center gap-1.5"
            >
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.span
                    key="copied"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="text-accent flex items-center gap-1"
                  >
                    <span>✓</span> Copied!
                  </motion.span>
                ) : (
                  <motion.span
                    key="copy"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H5.25m11.9-3.66l3.41 3.41m-1.9-3.41h1.9a1.125 1.125 0 011.125 1.125v12.19a1.125 1.125 0 01-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V18" />
                    </svg>
                    Copy Address
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </motion.div>
        </div>

        {/* ════════════════════════════════════════════════════════════ */}
        {/* MID ROW: BRANDING & SOCIAL MEDIA (INSTAGRAM)                 */}
        {/* ════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 py-10 border-t border-border-subtle">
          {/* Logo & Description */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-3">
            <Link href="/" className="flex items-center group">
              <Image
                src="/logo.png"
                alt="Yugantar"
                width={1600}
                height={759}
                className="object-contain transition-all duration-300 group-hover:scale-105 group-hover:brightness-110"
                style={{ height: "32px", width: "auto", maxHeight: "32px" }}
              />
            </Link>
            <p className="text-xs text-text-tertiary max-w-sm">
              Discover visionaries, innovators, leaders, and creators shaping tomorrow.
            </p>
          </div>

          {/* Social Media Link (Instagram Redirect) */}
          <div className="flex flex-col items-center gap-3">
            <span className="text-[10px] uppercase font-bold tracking-widest text-text-muted">Stay Connected</span>
            <Link
              href="https://www.instagram.com/yugantar_st.austin?igsh=NTc4MTIwNjQ2YQ=="
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/[0.02] dark:bg-white/[0.02] light:bg-black/[0.02] border border-border-subtle text-text-tertiary hover:text-white hover:bg-gradient-to-tr hover:from-[#f9ce34] hover:via-[#ee2a7b] hover:to-[#6228d7] hover:border-transparent hover:scale-110 transition-all duration-300 shadow-md group relative"
              aria-label="Follow Yugantar on Instagram"
            >
              {/* Premium Glow effect */}
              <div className="absolute inset-0 rounded-xl bg-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-[8px] pointer-events-none" />
              <svg className="w-5 h-5 relative z-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </Link>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════ */}
        {/* BOTTOM ROW: COPYRIGHT & PORTAL REDIRECTS                     */}
        {/* ════════════════════════════════════════════════════════════ */}
        <div className="py-6 border-t border-border-subtle">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[11px] text-text-muted uppercase tracking-wider">
              &copy; {currentYear} YUGANTAR. All Rights Reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/about" className="text-[10px] text-text-muted hover:text-text-tertiary transition-colors uppercase tracking-wider">
                Privacy
              </Link>
              <span className="text-text-muted text-[10px]">·</span>
              <Link href="/about" className="text-[10px] text-text-muted hover:text-text-tertiary transition-colors uppercase tracking-wider">
                Terms
              </Link>
              <span className="text-text-muted text-[10px]">·</span>
              <Link href="/admin" className="text-[10px] text-text-muted hover:text-text-tertiary transition-colors uppercase tracking-wider font-semibold">
                ⚙️ Admin Portal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
