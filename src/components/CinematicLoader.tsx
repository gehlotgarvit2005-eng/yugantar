"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CinematicLoaderProps {
  onComplete: () => void;
}

export function CinematicLoader({ onComplete }: CinematicLoaderProps) {
  const [phase, setPhase] = useState<"particle" | "pulse" | "letters" | "aurora" | "exit">("particle");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  // Phase progression
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(setTimeout(() => setPhase("pulse"), 600));
    timers.push(setTimeout(() => setPhase("letters"), 1400));
    timers.push(setTimeout(() => setPhase("aurora"), 2600));
    timers.push(setTimeout(() => {
      setPhase("exit");
      setTimeout(onComplete, 800);
    }, 3600));

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  // Canvas particle animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: { x: number; y: number; size: number; alpha: number; speed: number; angle: number }[] = [];
    let expansion = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const render = () => {
      const currentPhase = phaseRef.current;
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Expansion ring
      if (currentPhase === "particle" || currentPhase === "pulse") {
        expansion += currentPhase === "pulse" ? 3 : 0.5;
        const maxRadius = Math.min(canvas.width, canvas.height) * 0.45;

        const ringGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(expansion, maxRadius));
        ringGrad.addColorStop(0, "rgba(255, 59, 48, 0)");
        ringGrad.addColorStop(0.4, "rgba(255, 59, 48, 0.08)");
        ringGrad.addColorStop(0.7, `rgba(255, 179, 71, ${Math.max(0, 0.12 - expansion / 2000)})`);
        ringGrad.addColorStop(1, "rgba(255, 59, 48, 0)");

        ctx.fillStyle = ringGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, Math.min(expansion, maxRadius), 0, Math.PI * 2);
        ctx.fill();

        const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 40);
        coreGrad.addColorStop(0, `rgba(255, 59, 48, ${Math.max(0, 0.6 - expansion / 300)})`);
        coreGrad.addColorStop(0.5, `rgba(255, 106, 61, ${Math.max(0, 0.3 - expansion / 500)})`);
        coreGrad.addColorStop(1, "rgba(255, 179, 71, 0)");
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 40, 0, Math.PI * 2);
        ctx.fill();
      }

      // Floating particles
      if (currentPhase === "letters" || currentPhase === "aurora") {
        if (particles.length < 60) {
          const angle = Math.random() * Math.PI * 2;
          particles.push({
            x: cx,
            y: cy,
            size: 0.5 + Math.random() * 2,
            alpha: 0.1 + Math.random() * 0.4,
            speed: 0.2 + Math.random() * 0.6,
            angle: angle,
          });
        }

        particles = particles.filter(p => {
          p.x += Math.cos(p.angle) * p.speed;
          p.y += Math.sin(p.angle) * p.speed - 0.1;
          p.alpha *= 0.997;

          if (p.alpha > 0.01) {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
            grad.addColorStop(0, `rgba(255, ${155 + Math.random() * 50}, ${50 + Math.random() * 50}, ${p.alpha * 0.5})`);
            grad.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = `rgba(255, ${180 + Math.random() * 50}, ${80}, 0.8)`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            return true;
          }
          return false;
        });
      }

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  const showLoader = phase !== "exit";

  return (
    <AnimatePresence>
      {showLoader && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-bg-deep flex items-center justify-center overflow-hidden"
          exit={{ opacity: 0, transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] } }}
        >
          {/* Canvas for particle effects */}
          <canvas ref={canvasRef} className="absolute inset-0" />

          {/* Aurora background layers */}
          {phase === "aurora" && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/8 blur-[200px]"
                style={{ animation: "aurora-shimmer 18s ease-in-out infinite" }}
              />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[150px]"
                style={{ animation: "aurora-shimmer-2 22s ease-in-out infinite" }}
              />
            </>
          )}

          {/* Sound-wave style pulse rings behind text */}
          {(phase === "letters" || phase === "aurora") && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full border border-primary/10"
                  style={{
                    width: 300 + i * 60,
                    height: 300 + i * 60,
                  }}
                  initial={{ scale: 0.5, opacity: 0.6 }}
                  animate={{
                    scale: [0.5, 1.5, 0.5],
                    opacity: [0.6, 0, 0.6],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.5,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          )}

          {/* Center YUGANTAR text with letter-by-letter reveal + camera zoom */}
          <motion.div
            className="relative z-10 text-center"
            initial={{ scale: 0.8 }}
            animate={{
              scale: phase === "letters" || phase === "aurora" ? 1 : 0.8,
            }}
            transition={{
              duration: 1.2,
              delay: 0.8,
              ease: [0.25, 0.1, 0.25, 1],
            }}
          >
            <motion.h1
              className="text-6xl sm:text-8xl md:text-9xl font-bold tracking-[-0.06em] leading-none"
              style={{ perspective: "800px" }}
            >
              {"YUGANTAR".split("").map((letter, i) => (
                <motion.span
                  key={i}
                  className="inline-block"
                  initial={{
                    opacity: 0,
                    y: 40,
                    rotateX: 45,
                    filter: "blur(10px)",
                  }}
                  animate={
                    phase === "letters" || phase === "aurora"
                      ? {
                          opacity: 1,
                          y: 0,
                          rotateX: 0,
                          filter: "blur(0px)",
                        }
                      : {}
                  }
                  transition={{
                    duration: 0.7,
                    delay: 0.05 * i,
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                  style={{
                    background: "linear-gradient(135deg, #FF3B30 0%, #FF6A3D 40%, #FFB347 70%, #FF3B30 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    textShadow: "0 0 40px rgba(255,59,48,0.3), 0 0 80px rgba(255,179,71,0.15)",
                  }}
                >
                  {letter === " " ? "\u00A0" : letter}
                </motion.span>
              ))}
            </motion.h1>

            {/* Light sweep effect */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)",
                filter: "blur(20px)",
              }}
              initial={{ left: "-100%", right: "100%" }}
              animate={{
                left: ["-100%", "200%"],
              }}
              transition={{
                duration: 2.5,
                delay: 1.2,
                ease: "easeInOut",
                repeat: 0,
              }}
            />

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
              animate={
                phase === "aurora"
                  ? { opacity: 1, y: 0, filter: "blur(0px)" }
                  : {}
              }
              transition={{ duration: 0.8, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="mt-6 text-lg sm:text-xl text-text-tertiary/70 font-light tracking-[0.2em] uppercase"
            >
              Where Ideas Become Movements
            </motion.p>
          </motion.div>

          {/* Bottom progress bar */}
          <motion.div
            className="absolute bottom-10 left-1/2 -translate-x-1/2 w-24 h-[2px] bg-white/[0.04] rounded-full overflow-hidden"
          >
            <motion.div
              className="h-full bg-gradient-to-r from-primary via-secondary to-accent rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 3.6, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
