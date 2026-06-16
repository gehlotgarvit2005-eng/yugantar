"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";

// Countdown target: 18 June 2026, 5:00 PM (Asia/Kolkata or local timezone)
const TARGET_DATE = new Date("2026-06-18T17:00:00+05:30").getTime();

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const timelineData = [
  {
    time: "04:00 PM",
    title: "Registration & Entry",
    desc: "Verification and custom badge assignment at the futuristic gate system. Welcome mocktails and identity initialization.",
    icon: "🎫",
  },
  {
    time: "04:30 PM",
    title: "Guest Arrival",
    desc: "Networking at the Grand Atrium, interactive holographic gallery view, and opening interactions with Oracle AI.",
    icon: "👥",
  },
  {
    time: "05:00 PM",
    title: "Grand Opening Ceremony",
    desc: "Main stage audio-visual reveal. Dynamic projection mapping showing the evolution of ideas at Yugantar.",
    icon: "✨",
  },
  {
    time: "05:15 PM",
    title: "Welcome Address",
    desc: "Opening declarations by the founders and special interactive tribal keynote focusing on decentralized innovation.",
    icon: "📢",
  },
  {
    time: "05:45 PM",
    title: "Innovation & Idea Showcase",
    desc: "Elevator pitches from the top-rated gallery thinkers. Presentations in three categories: Fire, Night, and Champagne.",
    icon: "💡",
  },
  {
    time: "06:30 PM",
    title: "Expert Session & Interaction",
    desc: "Panel discussion with leading AI researchers, Web3 builders, and design experts. Interactive Q&A via local nodes.",
    icon: "🤝",
  },
  {
    time: "07:00 PM",
    title: "Closing Ceremony",
    desc: "Celebratory announcements, award presentations for the most innovative movement, and virtual cocktail hour.",
    icon: "🏆",
  },
];

export function EventCountdownTimeline() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isCompleted, setIsCompleted] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Background Particles Canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Celebration Fireworks Canvas
  const fireworksCanvasRef = useRef<HTMLCanvasElement>(null);
  // Interactive Venue Card Ref
  const venueCardRef = useRef<HTMLDivElement>(null);

  // Hydration safety check
  useEffect(() => {
    setIsMounted(true);
    
    // Calculate initial time
    const calcTime = () => {
      const difference = TARGET_DATE - Date.now();
      if (difference <= 0) {
        setIsCompleted(true);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calcTime());

    const timer = setInterval(() => {
      const left = calcTime();
      setTimeLeft(left);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 1️⃣ Particle Background Effect
  useEffect(() => {
    if (!isMounted || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener("resize", handleResize);

    // Create particles
    const particleCount = 60;
    const particles: Array<{
      x: number;
      y: number;
      radius: number;
      color: string;
      vx: number;
      vy: number;
      alpha: number;
    }> = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 1,
        color: i % 2 === 0 ? "rgba(0, 242, 254, 0.4)" : "rgba(189, 16, 224, 0.4)",
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.5 + 0.2,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;

        // Boundary bounce
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // Connect nearby particles with subtle lines
        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(0, 242, 254, ${0.12 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isMounted]);

  // 2️⃣ Celebration Mode Fireworks Effect
  useEffect(() => {
    if (!isMounted || !isCompleted || !fireworksCanvasRef.current) return;
    const canvas = fireworksCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener("resize", handleResize);

    interface FireworkParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      alpha: number;
      decay: number;
    }

    interface Rocket {
      x: number;
      y: number;
      targetY: number;
      vy: number;
      color: string;
    }

    const particles: FireworkParticle[] = [];
    const rockets: Rocket[] = [];
    const colors = ["#00F2FE", "#BD10E0", "#FF007F", "#39FF14", "#FFD700", "#FF5E3A"];

    const spawnRocket = () => {
      if (rockets.length >= 5) return;
      rockets.push({
        x: Math.random() * (width - 100) + 50,
        y: height,
        targetY: Math.random() * (height * 0.5) + 50,
        vy: -(Math.random() * 4 + 6),
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    };

    const explode = (x: number, y: number, color: string) => {
      const count = 40;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color,
          alpha: 1,
          decay: Math.random() * 0.02 + 0.015,
        });
      }
    };

    // Auto-launch rockets
    const interval = setInterval(spawnRocket, 900);

    const render = () => {
      ctx.fillStyle = "rgba(10, 10, 15, 0.2)"; // Fade trail
      ctx.fillRect(0, 0, width, height);

      // 1. Update and Draw Rockets
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.y += r.vy;

        // Draw rocket head
        ctx.beginPath();
        ctx.arc(r.x, r.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = r.color;
        ctx.fill();

        // Check if exploded
        if (r.y <= r.targetY) {
          explode(r.x, r.y, r.color);
          rockets.splice(i, 1);
        }
      }

      // 2. Update and Draw Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04; // gravity
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      clearInterval(interval);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isMounted, isCompleted]);

  // 3️⃣ Card Hover Mouse Tracking (Dynamic 3D shadows and glows)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!venueCardRef.current) return;
    const card = venueCardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    // Direct inline variable manipulation for CSS performance
    card.style.setProperty("--mx", `${x}px`);
    card.style.setProperty("--my", `${y}px`);
    card.style.setProperty("--rx", `${-y / 12}deg`);
    card.style.setProperty("--ry", `${x / 12}deg`);
  };

  const handleMouseLeave = () => {
    if (!venueCardRef.current) return;
    const card = venueCardRef.current;
    card.style.setProperty("--mx", "0px");
    card.style.setProperty("--my", "0px");
    card.style.setProperty("--rx", "0deg");
    card.style.setProperty("--ry", "0deg");
  };

  if (!isMounted) {
    return (
      <section className="relative min-h-[50vh] flex items-center justify-center bg-black">
        <span className="text-sm text-text-tertiary">Loading Section...</span>
      </section>
    );
  }

  return (
    <section className="relative py-28 overflow-hidden bg-[#0A0A0F] border-t border-white/[0.04] flex flex-col items-center">
      {/* Dynamic Backgrounds & Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-secondary/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Particle Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Floating 3D Geometric shapes */}
      <div className="absolute top-20 left-12 w-20 h-20 opacity-20 pointer-events-none animate-float-slow hidden md:block">
        <svg viewBox="0 0 100 100" className="w-full h-full text-primary" fill="none" stroke="currentColor" strokeWidth="1">
          <polygon points="50,5 95,90 5,90" strokeDasharray="4 2" />
          <polygon points="50,25 80,80 20,80" />
        </svg>
      </div>
      <div className="absolute bottom-40 right-12 w-24 h-24 opacity-20 pointer-events-none animate-float-medium hidden md:block">
        <svg viewBox="0 0 100 100" className="w-full h-full text-secondary" fill="none" stroke="currentColor" strokeWidth="1">
          <rect x="15" y="15" width="70" height="70" rx="10" strokeDasharray="3 3" />
          <rect x="30" y="30" width="40" height="40" rx="5" />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-5xl px-6 flex flex-col items-center">
        {/* Section title */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 0.8, y: 0 }}
            viewport={{ once: true }}
            className="text-xs uppercase tracking-widest text-primary font-semibold block mb-3"
          >
            Chronicle of Launch
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-4"
          >
            Countdown to Yugantar
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.6 }}
            viewport={{ once: true }}
            className="text-sm text-text-tertiary max-w-md mx-auto leading-relaxed"
          >
            Watch the clock wind down as we prepare to launch the future of open technology.
          </motion.p>
        </div>

        {/* ════════════════════════════════════════════════════════════ */}
        {/* EVENT COUNTDOWN VIEW                                        */}
        {/* ════════════════════════════════════════════════════════════ */}
        <div className="w-full flex flex-col items-center mb-20 relative">
          <AnimatePresence mode="wait">
            {!isCompleted ? (
              <motion.div
                key="countdown-grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-3xl"
              >
                {/* Countdown Card Maker */}
                {[
                  { value: timeLeft.days, label: "Days" },
                  { value: timeLeft.hours, label: "Hours" },
                  { value: timeLeft.minutes, label: "Minutes" },
                  { value: timeLeft.seconds, label: "Seconds" },
                ].map((item, idx) => (
                  <div
                    key={item.label}
                    className="relative flex flex-col items-center justify-center p-6 rounded-2xl border border-white/[0.06] bg-neutral-950/40 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden group"
                  >
                    {/* Glowing card border and back glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-primary/25 to-secondary/25 opacity-30 blur-[2px] pointer-events-none" />

                    {/* Numeric display with sliding number animation */}
                    <div className="h-16 flex items-center justify-center overflow-hidden mb-2 relative">
                      <AnimatePresence mode="popLayout">
                        <motion.span
                          key={item.value}
                          initial={{ y: 30, opacity: 0, filter: "blur(4px)" }}
                          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                          exit={{ y: -30, opacity: 0, filter: "blur(4px)" }}
                          transition={{ type: "spring", stiffness: 200, damping: 20 }}
                          className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent filter drop-shadow-[0_0_15px_rgba(0,242,254,0.15)]"
                        >
                          {String(item.value).padStart(2, "0")}
                        </motion.span>
                      </AnimatePresence>
                    </div>

                    <span className="text-[10px] uppercase font-bold tracking-widest text-text-muted">
                      {item.label}
                    </span>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="celebration-container"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", duration: 0.8 }}
                className="relative w-full max-w-4xl p-8 md:p-12 rounded-3xl border border-primary/20 bg-neutral-950/60 backdrop-blur-2xl text-center overflow-hidden flex flex-col items-center"
              >
                {/* Celebratory Canvas */}
                <canvas ref={fireworksCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

                <div className="relative z-10 space-y-4">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white text-2xl font-bold shadow-[0_0_30px_rgba(0,242,254,0.5)]"
                  >
                    🎉
                  </motion.div>
                  <h3 className="text-3xl md:text-5xl font-black tracking-tight text-white uppercase bg-gradient-to-r from-[#00F2FE] via-[#BD10E0] to-[#FF007F] bg-clip-text text-transparent animate-gradient-xy">
                    YUGANTAR 2026 Has Begun!
                  </h3>
                  <p className="text-lg font-semibold text-text-secondary">
                    "Shaping Tomorrow, Today" — Welcome to the Future.
                  </p>
                  <p className="text-xs text-text-muted max-w-md mx-auto leading-relaxed">
                    The portals of innovation are wide open. Dive into the gallery and review submitted movements, or log in to launch your own legacy.
                  </p>
                  <div className="pt-4 flex justify-center gap-4">
                    <Link
                      href="/explore"
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-sm font-semibold text-white shadow-lg hover:scale-105 transition-transform"
                    >
                      Enter Gallery
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ════════════════════════════════════════════════════════════ */}
        {/* EVENT DATE & VENUE FLOAT CARD                              */}
        {/* ════════════════════════════════════════════════════════════ */}
        <div className="w-full flex justify-center mb-24">
          <div
            ref={venueCardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative w-full max-w-xl p-8 rounded-3xl border border-white/[0.08] bg-neutral-900/20 backdrop-blur-xl transition-all duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden cursor-default group"
            style={{
              transform: "perspective(1000px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))",
              boxShadow: "0 20px 50px rgba(0,0,0,0.5), inset 0 0 0px var(--tw-ring-offset-width) rgba(0,242,254,0)",
            }}
          >
            {/* Dynamic hover glow overlay using cursor location */}
            <div
              className="absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-3xl"
              style={{
                background: "radial-gradient(800px circle at var(--mx, 0px) var(--my, 0px), rgba(0,242,254,0.06), transparent 40%)",
              }}
            />
            {/* Ambient edge highlight glow */}
            <div className="absolute -inset-px rounded-3xl bg-gradient-to-r from-primary/30 to-secondary/30 opacity-20 blur-[1px] pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
              {/* Calendar Icon Widget */}
              <div className="flex-shrink-0 h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-white/[0.06] flex flex-col overflow-hidden shadow-inner group-hover:scale-105 transition-transform duration-300">
                <div className="bg-primary/20 py-1 text-center text-[9px] uppercase font-black tracking-widest text-primary">
                  JUN
                </div>
                <div className="flex-grow flex items-center justify-center text-2xl font-black text-white">
                  18
                </div>
              </div>

              {/* Venue details */}
              <div className="flex-grow text-center md:text-left space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center md:justify-start">
                  <span className="text-sm font-semibold text-white flex items-center justify-center md:justify-start gap-2">
                    📅 Date: <strong className="text-primary">18 June 2026</strong>
                  </span>
                  <span className="hidden sm:inline text-white/20">|</span>
                  <span className="text-sm font-semibold text-white flex items-center justify-center md:justify-start gap-2">
                    🕔 Time: <strong className="text-secondary">5:00 PM onwards</strong>
                  </span>
                </div>
                <p className="text-xs text-text-tertiary leading-relaxed flex items-center justify-center md:justify-start gap-2">
                  📍 Venue: <span className="text-white">The Grand Atrium & Interactive Gallery Portals</span>
                </p>
              </div>

              <div className="flex-shrink-0">
                <Link
                  href="/cave"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white transition-all inline-flex items-center gap-1.5"
                >
                  Enter Atrium ➔
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════ */}
        {/* INTERACTIVE FUTURE TIMELINE                                 */}
        {/* ════════════════════════════════════════════════════════════ */}
        <div className="w-full relative flex flex-col items-center">
          {/* Central neon vertical energy line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary via-secondary to-accent opacity-50 shadow-[0_0_15px_rgba(0,242,254,0.5)] pointer-events-none -translate-x-[1px]" />

          {/* Timeline Nodes */}
          <div className="w-full space-y-12">
            {timelineData.map((item, idx) => {
              const isEven = idx % 2 === 0;

              return (
                <div
                  key={item.title}
                  className={`relative flex flex-col md:flex-row items-start md:items-center w-full ${
                    isEven ? "md:justify-start" : "md:justify-end"
                  }`}
                >
                  {/* Outer glowing point on central line */}
                  <div className="absolute left-[16px] md:left-1/2 h-4 w-4 -translate-x-[9px] md:-translate-x-[9px] rounded-full border border-white/20 bg-neutral-950 flex items-center justify-center z-20">
                    <span className={`h-2 w-2 rounded-full ${
                      idx === 0 ? "bg-primary animate-ping" : 
                      idx === timelineData.length - 1 ? "bg-accent" : 
                      "bg-secondary"
                    }`} />
                  </div>

                  {/* Milestone Card */}
                  <motion.div
                    initial={{ opacity: 0, x: isEven ? -40 : 40, scale: 0.95 }}
                    whileInView={{ opacity: 1, x: 0, scale: 1 }}
                    viewport={{ once: true, margin: "-120px" }}
                    transition={{ type: "spring", duration: 0.6, delay: 0.1 }}
                    className={`w-[calc(100%-40px)] md:w-[45%] ml-12 md:ml-0 p-6 rounded-2xl border border-white/[0.06] bg-neutral-900/10 backdrop-blur-md shadow-lg transition-all duration-300 hover:scale-[1.01] hover:border-primary/40 hover:shadow-[0_0_30px_rgba(0,242,254,0.08)] cursor-default group`}
                    style={{ transformOrigin: isEven ? "right center" : "left center" }}
                    whileHover={{ rotate: isEven ? -0.8 : 0.8 }}
                  >
                    {/* Glowing highlight indicator */}
                    <div className="absolute top-4 right-4 text-sm font-semibold opacity-30 group-hover:opacity-100 transition-opacity duration-300 text-primary">
                      {item.icon}
                    </div>

                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 inline-block mb-3">
                      {item.time}
                    </span>

                    <h4 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors duration-300">
                      {item.title}
                    </h4>

                    <p className="text-xs text-text-tertiary leading-relaxed">
                      {item.desc}
                    </p>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Styled animation keyframes inside tags */}
      <style jsx global>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(-5deg); }
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        .animate-float-medium {
          animation: float-medium 6s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
