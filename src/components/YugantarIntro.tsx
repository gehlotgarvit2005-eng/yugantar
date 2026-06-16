"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface YugantarIntroProps {
  onComplete: () => void;
}

export function YugantarIntro({ onComplete }: YugantarIntroProps) {
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 1. Detect and Watch Light/Dark Mode
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
    setIsLightMode(mediaQuery.matches);

    const mediaHandler = (e: MediaQueryListEvent) => setIsLightMode(e.matches);
    mediaQuery.addEventListener("change", mediaHandler);

    // Watch for .light class changes on html/body
    const observer = new MutationObserver(() => {
      const hasLightClass =
        document.documentElement.classList.contains("light") ||
        document.body.classList.contains("light");
      setIsLightMode(hasLightClass);
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      mediaQuery.removeEventListener("change", mediaHandler);
      observer.disconnect();
    };
  }, []);

  // 2. Smooth Organic Progress Counter
  useEffect(() => {
    const startTime = Date.now();
    const duration = 2800; // 2.8 seconds loading screen duration

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      // Add a slight ease-out curves to make progress feel natural (organic loading)
      const ratio = Math.min(1, elapsed / duration);
      // Easing function: cubic ease out
      const easeRatio = 1 - Math.pow(1 - ratio, 3);
      const currentProgress = easeRatio * 100;

      setProgress(Math.floor(currentProgress));

      if (ratio < 1) {
        requestAnimationFrame(updateProgress);
      } else {
        setProgress(100);
      }
    };

    const frameId = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(frameId);
  }, []);

  // 3. Completion sequence triggers when progress hits 100
  useEffect(() => {
    if (progress >= 100) {
      setIsCompleted(true);
      const timer = setTimeout(() => {
        onComplete();
      }, 1200); // 1.2s to enjoy the welcome screen and visual glow burst
      return () => clearTimeout(timer);
    }
  }, [progress, onComplete]);

  // 4. Typing Effect for Loading Text
  useEffect(() => {
    const fullText = "Loading the Future...";
    let index = 0;
    
    // Slight initial delay before typing starts
    const delayTimer = setTimeout(() => {
      const typingTimer = setInterval(() => {
        setTypedText(fullText.slice(0, index + 1));
        index++;
        if (index >= fullText.length) {
          clearInterval(typingTimer);
        }
      }, 75); // Typing speed
      
      return () => clearInterval(typingTimer);
    }, 200);

    return () => clearTimeout(delayTimer);
  }, []);

  // 5. Canvas Fluid Particle Field
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frameId: number;
    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      baseAlpha: number;
      alpha: number;
      color: string;
      glow: boolean;
    }> = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particleCount = 45;
    const palette = isLightMode
      ? ["65, 105, 225", "138, 43, 226", "0, 206, 209"] // RoyalBlue, Violet, Turquoise
      : ["34, 211, 238", "168, 85, 247", "59, 130, 246"]; // Cyan, Purple, Blue

    for (let i = 0; i < particleCount; i++) {
      const size = Math.random() * 2 + 0.8;
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.4 - 0.15, // Floating upward
        size,
        baseAlpha: Math.random() * 0.35 + 0.1,
        alpha: 0,
        color: palette[Math.floor(Math.random() * palette.length)],
        glow: Math.random() > 0.5,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Smoothly fade in/out near boundaries
        if (p.y < 50) {
          p.alpha = Math.max(0, p.alpha - 0.02);
        } else {
          p.alpha = Math.min(p.baseAlpha, p.alpha + 0.02);
        }

        // Reset particle
        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
          p.alpha = 0;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        
        ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;

        if (!isLightMode && p.glow) {
          ctx.shadowBlur = p.size * 3;
          ctx.shadowColor = `rgba(${p.color}, 0.8)`;
        }

        ctx.fill();
        ctx.restore();
      });

      frameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frameId);
    };
  }, [isLightMode]);

  // 6. Interactive 3D tilt handler
  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Normalized offset from center of viewport (-1 to 1)
    const xOffset = (clientX - width / 2) / (width / 2);
    const yOffset = (clientY - height / 2) / (height / 2);
    
    // Set 3D tilt angles (up to 12 degrees tilt)
    setTilt({
      x: xOffset * 12,
      y: yOffset * -12, // inverted for natural tilt direction
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{
        opacity: 0,
        transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
      }}
      className={cn(
        "fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden transition-colors duration-1000 select-none",
        isLightMode
          ? "bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50/40"
          : "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-950 via-slate-950 to-zinc-950"
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* 2D Floating Particle Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" />

      {/* Atmospheric Ambient Glowing Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={{
            x: [0, 40, -20, 0],
            y: [0, -40, 20, 0],
            scale: [1, 1.15, 0.9, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={cn(
            "absolute w-[450px] h-[450px] rounded-full blur-[120px] top-1/4 left-1/4 opacity-40 mix-blend-screen",
            isLightMode ? "bg-sky-200/50" : "bg-blue-950/45"
          )}
        />
        <motion.div
          animate={{
            x: [0, -30, 45, 0],
            y: [0, 50, -30, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={cn(
            "absolute w-[400px] h-[400px] rounded-full blur-[140px] bottom-1/4 right-1/4 opacity-35 mix-blend-screen",
            isLightMode ? "bg-purple-200/40" : "bg-purple-950/40"
          )}
        />
      </div>

      {/* Main Container */}
      <div
        className="relative z-20 flex flex-col items-center justify-center px-6 text-center"
        style={{ perspective: "1000px" }}
      >
        {/* Logo Wrapper with Floating + 3D Tilt */}
        <motion.div
          animate={{
            y: [-6, 6, -6],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative mb-12 cursor-grab active:cursor-grabbing"
        >
          {/* Subtle Glow Burst on Completion */}
          <AnimatePresence>
            {isCompleted && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 2.4, opacity: [0, 0.85, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.1, ease: "easeOut" }}
                className={cn(
                  "absolute inset-0 m-auto w-40 h-40 rounded-full blur-2xl pointer-events-none -z-10",
                  isLightMode
                    ? "bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400"
                    : "bg-gradient-to-r from-cyan-400 via-purple-600 to-blue-500"
                )}
              />
            )}
          </AnimatePresence>

          {/* Glowing Shadow Background Layer (Dynamic Glow) */}
          <motion.div
            animate={{
              opacity: isCompleted ? 0.3 : [0.6, 0.85, 0.6],
              scale: isCompleted ? 0.9 : [1, 1.05, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className={cn(
              "absolute inset-0 rounded-3xl blur-[40px] -z-10 scale-95 transition-all duration-500",
              isLightMode
                ? "bg-gradient-to-r from-indigo-500/10 to-sky-500/15"
                : "bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20"
            )}
          />

          {/* Tilting Logo Frame */}
          <motion.div
            style={{
              rotateX: tilt.y,
              rotateY: tilt.x,
              transformStyle: "preserve-3d",
            }}
            animate={{
              rotateX: tilt.y,
              rotateY: tilt.x,
            }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className={cn(
              "relative rounded-3xl p-6 transition-all duration-500",
              isLightMode
                ? "bg-white/30 border border-white/60 shadow-lg shadow-indigo-900/5 backdrop-blur-md"
                : "bg-black/20 border border-white/[0.04] shadow-2xl shadow-black/40 backdrop-blur-md"
            )}
          >
            {/* The Logo Image */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, filter: "blur(10px)" }}
              animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              style={{ transform: "translateZ(30px)" }} // pop effect
              className="relative w-48 sm:w-60 md:w-72 h-auto aspect-[1600/759]"
            >
              <Image
                src="/logo.png"
                alt="Yugantar 2026 Logo"
                fill
                priority
                className={cn(
                  "object-contain select-none pointer-events-none transition-all duration-1000",
                  isLightMode ? "brightness-95 contrast-105" : "brightness-105"
                )}
              />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Loading/Welcome Message */}
        <div className="h-10 flex items-center justify-center overflow-hidden mb-6">
          <AnimatePresence mode="wait">
            {!isCompleted ? (
              <motion.p
                key="loading-text"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15, filter: "blur(6px)" }}
                transition={{ duration: 0.45, ease: "easeInOut" }}
                className={cn(
                  "text-sm sm:text-base font-medium tracking-[0.15em] font-display flex items-center",
                  isLightMode ? "text-slate-600" : "text-slate-300"
                )}
                style={{ fontFamily: "var(--font-sora), sans-serif" }}
              >
                {typedText}
                <span
                  className={cn(
                    "inline-block w-[2px] h-[1.1em] ml-1 bg-current transition-opacity duration-300",
                    isLightMode ? "text-indigo-600" : "text-cyan-400",
                    "animate-[blink_0.9s_infinite_step-end]"
                  )}
                  style={{ animation: "blink 0.9s infinite step-end" }}
                />
              </motion.p>
            ) : (
              <motion.p
                key="welcome-text"
                initial={{ opacity: 0, y: 15, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={cn(
                  "text-sm sm:text-base md:text-lg font-bold tracking-[0.25em] uppercase bg-clip-text text-transparent",
                  isLightMode
                    ? "bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600"
                    : "bg-gradient-to-r from-cyan-400 via-purple-400 to-blue-400"
                )}
                style={{ fontFamily: "var(--font-sora), sans-serif" }}
              >
                Welcome to Yugantar 2026
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Progress Bar Container */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col items-center gap-3 w-64 sm:w-72"
        >
          {/* Outer Border Track */}
          <div
            className={cn(
              "relative w-full h-[6px] rounded-full overflow-hidden transition-all duration-500",
              isLightMode
                ? "bg-slate-200 border border-slate-300/30"
                : "bg-white/[0.04] border border-white/[0.03]"
            )}
          >
            {/* Filled Progress Bar with Shine Sweep */}
            <motion.div
              style={{ width: `${progress}%` }}
              className={cn(
                "h-full rounded-full transition-all duration-100 ease-out relative overflow-hidden",
                isLightMode
                  ? "bg-gradient-to-r from-sky-400 via-indigo-500 to-violet-500 shadow-[0_0_8px_rgba(99,102,241,0.25)]"
                  : "bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]"
              )}
            >
              {/* Moving Shine Effect */}
              <div
                className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                style={{
                  animation: "shine-sweep 2.2s infinite linear",
                }}
              />
            </motion.div>
          </div>

          {/* Smooth Percentage Text */}
          <span
            className={cn(
              "text-xs font-semibold tabular-nums tracking-wider",
              isLightMode ? "text-slate-500" : "text-slate-400"
            )}
            style={{ fontFamily: "var(--font-sora), sans-serif" }}
          >
            {progress}%
          </span>
        </motion.div>
      </div>

      {/* Inject Cursor Blink and Shine Keyframes */}
      <style jsx global>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes shine-sweep {
          0% { transform: translateX(-150%) skewX(-15deg); }
          100% { transform: translateX(250%) skewX(-15deg); }
        }
      `}</style>
    </motion.div>
  );
}
