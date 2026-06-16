"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { ParticleField } from "./ParticleField";

// Grid intersection points positioned at various percentages
const GRID_POINTS = [
  { x: "15%", y: "20%", color: "grid-pulse", delay: 0 },
  { x: "35%", y: "35%", color: "grid-pulse-orange", delay: 1.2 },
  { x: "55%", y: "25%", color: "grid-pulse-gold", delay: 2.4 },
  { x: "75%", y: "40%", color: "grid-pulse", delay: 0.8 },
  { x: "25%", y: "55%", color: "grid-pulse-orange", delay: 3.0 },
  { x: "50%", y: "60%", color: "grid-pulse-gold", delay: 1.6 },
  { x: "70%", y: "55%", color: "grid-pulse", delay: 2.0 },
  { x: "40%", y: "75%", color: "grid-pulse-orange", delay: 0.4 },
  { x: "60%", y: "80%", color: "grid-pulse-gold", delay: 2.8 },
  { x: "85%", y: "65%", color: "grid-pulse", delay: 1.0 },
  { x: "10%", y: "45%", color: "grid-pulse-orange", delay: 3.5 },
  { x: "45%", y: "15%", color: "grid-pulse-gold", delay: 0.6 },
  { x: "90%", y: "30%", color: "grid-pulse", delay: 1.8 },
  { x: "20%", y: "80%", color: "grid-pulse-orange", delay: 2.2 },
  { x: "65%", y: "10%", color: "grid-pulse-gold", delay: 3.2 },
];

// Helper: motion.div that accepts x/y as direct props
const MotionDiv = motion.div;

export function HeroBackground() {
  const springConfig = { stiffness: 25, damping: 12 };
  const mouseX = useSpring(0.5, springConfig);
  const mouseY = useSpring(0.5, springConfig);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth);
      mouseY.set(e.clientY / window.innerHeight);
    };
    const handleScroll = () => setScrollY(window.scrollY);

    window.addEventListener("mousemove", handleMouse, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [mouseX, mouseY]);

  // Layer transforms — each moves at different intensity for parallax depth
  const auroraX = useTransform(mouseX, [0, 1], [-12, 12]);
  const auroraY = useTransform(mouseY, [0, 1], [-12, 12]);
  const gridX = useTransform(mouseX, [0, 1], [-6, 6]);
  const gridY = useTransform(mouseY, [0, 1], [-6, 6]);
  const gridOpacity = useTransform(mouseY, [0, 1], [0.12, 0.2]);
  const orb1X = useTransform(mouseX, [0, 1], [-25, 25]);
  const orb1Y = useTransform(mouseY, [0, 1], [-20, 20]);
  const orb2X = useTransform(mouseX, [0, 1], [18, -18]);
  const orb2Y = useTransform(mouseY, [0, 1], [-22, 22]);
  const orb3X = useTransform(mouseX, [0, 1], [-15, 15]);
  const orb3Y = useTransform(mouseY, [0, 1], [25, -25]);
  const orb4X = useTransform(mouseX, [0, 1], [20, -20]);
  const orb4Y = useTransform(mouseY, [0, 1], [-15, 15]);
  const rayX = useTransform(mouseX, [0, 1], [-4, 4]);

  // Scroll parallax offsets (pixels)
  const sAurora = scrollY * 0.08;
  const sGrid = scrollY * 0.04;
  const sOrbs = scrollY * 0.06;
  const sRays = scrollY * 0.02;
  const sParticles = scrollY * -0.03;

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {/* ─── LAYER 1: Deep Premium Base ─── */}
      <div className="absolute inset-0 bg-[#050505]" />
      <div
        className="absolute inset-0"
        style={{
          background: [
            "radial-gradient(ellipse at 50% 35%, rgba(255,59,48,0.08) 0%, transparent 55%)",
            "radial-gradient(ellipse at 80% 20%, rgba(255,106,61,0.05) 0%, transparent 45%)",
            "radial-gradient(ellipse at 20% 60%, rgba(255,179,71,0.03) 0%, transparent 50%)",
            "radial-gradient(ellipse at 50% 80%, rgba(139,92,246,0.02) 0%, transparent 40%)",
          ].join(","),
        }}
      />

      {/* ─── LAYER 2: Dynamic Aurora ─── */}
      <div className="absolute inset-0" style={{ transform: `translateY(${sAurora}px)` }}>
        <MotionDiv
          className="absolute inset-0 will-change-transform"
          style={{ x: auroraX, y: auroraY }}
        >
          <div className="absolute -left-[5%] -top-[8%] h-[70%] w-[55%] rounded-full bg-[#FF3B30]/12 blur-[140px] animate-aurora-slow" />
          <div className="absolute -right-[5%] top-[15%] h-[60%] w-[50%] rounded-full bg-[#FF6A3D]/9 blur-[120px] animate-aurora-slower" style={{ animationDelay: "-7s" }} />
          <div className="absolute left-[20%] top-[45%] h-[55%] w-[45%] rounded-full bg-[#7C3AED]/6 blur-[110px] animate-aurora-slowest" style={{ animationDelay: "-14s" }} />
          <div className="absolute -left-[3%] top-[35%] h-[40%] w-[35%] rounded-full bg-[#FF3B30]/6 blur-[100px] animate-aurora-slower" style={{ animationDelay: "-5s" }} />
          <div className="absolute right-[12%] top-[55%] h-[35%] w-[30%] rounded-full bg-[#FFB347]/5 blur-[90px] animate-aurora-slow" style={{ animationDelay: "-10s" }} />
          <div className="absolute left-[45%] top-[10%] h-[40%] w-[35%] rounded-full bg-[#FF6A3D]/5 blur-[100px] animate-aurora-slowest" style={{ animationDelay: "-3s" }} />
        </MotionDiv>
      </div>

      {/* ─── LAYER 3: Interactive Particle Universe ─── */}
      <div className="absolute inset-0" style={{ transform: `translateY(${sParticles}px)` }}>
        <ParticleField count={200} />
      </div>

      {/* ─── LAYER 4: Futuristic Innovation Grid ─── */}
      <div className="absolute inset-0" style={{ transform: `translateY(${sGrid}px)` }}>
        <MotionDiv
          className="absolute inset-0 will-change-transform"
          style={{ x: gridX, y: gridY, opacity: gridOpacity }}
        >
          {/* Grid lines — radial fade at edges */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: [
                "repeating-linear-gradient(0deg, rgba(255,59,48,0.05) 0px, rgba(255,59,48,0.05) 1px, transparent 1px, transparent 80px)",
                "repeating-linear-gradient(90deg, rgba(255,59,48,0.05) 0px, rgba(255,59,48,0.05) 1px, transparent 1px, transparent 80px)",
              ].join(", "),
              WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 68%)",
              maskImage: "radial-gradient(ellipse at center, black 30%, transparent 68%)",
            }}
          />
          {/* Grid secondary lines */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: [
                "repeating-linear-gradient(0deg, rgba(255,59,48,0.02) 0px, rgba(255,59,48,0.02) 1px, transparent 1px, transparent 20px)",
                "repeating-linear-gradient(90deg, rgba(255,59,48,0.02) 0px, rgba(255,59,48,0.02) 1px, transparent 1px, transparent 20px)",
              ].join(", "),
              WebkitMaskImage: "radial-gradient(ellipse at center, black 20%, transparent 65%)",
              maskImage: "radial-gradient(ellipse at center, black 20%, transparent 65%)",
            }}
          />
          {/* Glowing intersection points */}
          {GRID_POINTS.map((point, i) => (
            <div
              key={`gp-${i}`}
              className="absolute"
              style={{ left: point.x, top: point.y, transform: "translate(-50%, -50%)" }}
            >
              <div
                className={`h-[3px] w-[3px] rounded-full animate-${point.color}`}
                style={{ animationDelay: `${point.delay}s` }}
              />
            </div>
          ))}
        </MotionDiv>
      </div>

      {/* ─── LAYER 5: Glassmorphism Orbs ─── */}
      <div className="absolute inset-0" style={{ transform: `translateY(${sOrbs}px)` }}>
        {/* Orb 1 */}
        <MotionDiv
          className="absolute top-[12%] left-[6%] will-change-transform"
          style={{ x: orb1X, y: orb1Y }}
        >
          <div
            className="h-[280px] w-[280px] rounded-full animate-orb-float will-change-transform"
            style={{
              background: "rgba(255, 255, 255, 0.02)",
              backdropFilter: "blur(80px)",
              WebkitBackdropFilter: "blur(80px)",
              border: "1px solid rgba(255, 255, 255, 0.04)",
              boxShadow: "0 0 40px rgba(255,59,48,0.03), inset 0 0 40px rgba(255,255,255,0.01)",
            }}
          />
        </MotionDiv>

        {/* Orb 2 */}
        <MotionDiv
          className="absolute bottom-[18%] right-[8%] will-change-transform"
          style={{ x: orb2X, y: orb2Y }}
        >
          <div
            className="h-[220px] w-[220px] rounded-full animate-orb-float will-change-transform"
            style={{
              background: "rgba(255, 255, 255, 0.015)",
              backdropFilter: "blur(60px)",
              WebkitBackdropFilter: "blur(60px)",
              border: "1px solid rgba(255, 255, 255, 0.04)",
              boxShadow: "0 0 30px rgba(255,106,61,0.03), inset 0 0 30px rgba(255,255,255,0.01)",
              animationDuration: "10s",
              animationDelay: "-3s",
            }}
          />
        </MotionDiv>

        {/* Orb 3 */}
        <MotionDiv
          className="absolute top-[48%] left-[55%] will-change-transform"
          style={{ x: orb3X, y: orb3Y }}
        >
          <div
            className="h-[180px] w-[180px] rounded-full animate-orb-float will-change-transform"
            style={{
              background: "rgba(255, 59, 48, 0.015)",
              backdropFilter: "blur(50px)",
              WebkitBackdropFilter: "blur(50px)",
              border: "1px solid rgba(255, 59, 48, 0.05)",
              boxShadow: "0 0 25px rgba(255,179,71,0.03), inset 0 0 25px rgba(255,255,255,0.01)",
              animationDuration: "14s",
              animationDelay: "-6s",
            }}
          />
        </MotionDiv>

        {/* Orb 4 */}
        <MotionDiv
          className="absolute top-[65%] left-[12%] will-change-transform"
          style={{ x: orb4X, y: orb4Y }}
        >
          <div
            className="h-[150px] w-[150px] rounded-full animate-orb-float will-change-transform"
            style={{
              background: "rgba(139, 92, 246, 0.01)",
              backdropFilter: "blur(40px)",
              WebkitBackdropFilter: "blur(40px)",
              border: "1px solid rgba(139, 92, 246, 0.04)",
              animationDuration: "11s",
              animationDelay: "-8s",
            }}
          />
        </MotionDiv>
      </div>

      {/* ─── LAYER 6: Volumetric Light Rays ─── */}
      <div className="absolute inset-0 overflow-hidden" style={{ transform: `translateY(${sRays}px)` }}>
        <MotionDiv
          className="absolute inset-0 will-change-transform"
          style={{ x: rayX }}
        >
          <div className="absolute top-[-10%] left-[18%] h-[130%] w-[120px] animate-light-ray will-change-transform origin-top"
            style={{
              background: "linear-gradient(180deg, rgba(255,59,48,0.06) 0%, rgba(255,59,48,0.02) 30%, transparent 70%)",
              transform: "rotate(-20deg)",
              filter: "blur(40px)",
            }}
          />
          <div className="absolute top-[-10%] left-[35%] h-[130%] w-[80px] animate-light-ray-secondary will-change-transform origin-top"
            style={{
              background: "linear-gradient(180deg, rgba(255,106,61,0.04) 0%, rgba(255,106,61,0.01) 35%, transparent 65%)",
              transform: "rotate(-15deg)",
              filter: "blur(50px)",
              animationDelay: "2s",
            }}
          />
          <div className="absolute top-[-10%] left-[55%] h-[130%] w-[100px] animate-light-ray will-change-transform origin-top"
            style={{
              background: "linear-gradient(180deg, rgba(255,179,71,0.03) 0%, rgba(255,59,48,0.02) 25%, transparent 60%)",
              transform: "rotate(-25deg)",
              filter: "blur(45px)",
              animationDelay: "4s",
            }}
          />
          <div className="absolute top-[-10%] left-[70%] h-[130%] w-[60px] animate-light-ray-secondary will-change-transform origin-top"
            style={{
              background: "linear-gradient(180deg, rgba(255,59,48,0.04) 0%, transparent 60%)",
              transform: "rotate(-18deg)",
              filter: "blur(35px)",
              animationDelay: "1s",
            }}
          />
          <div className="absolute top-[-10%] left-[8%] h-[130%] w-[70px] animate-light-ray will-change-transform origin-top"
            style={{
              background: "linear-gradient(180deg, rgba(255,106,61,0.03) 0%, transparent 55%)",
              transform: "rotate(-22deg)",
              filter: "blur(30px)",
              animationDelay: "3s",
            }}
          />
          <div className="absolute top-[-10%] right-[15%] h-[130%] w-[90px] animate-light-ray-secondary will-change-transform origin-top"
            style={{
              background: "linear-gradient(180deg, rgba(255,179,71,0.02) 0%, transparent 50%)",
              transform: "rotate(15deg)",
              filter: "blur(40px)",
              animationDelay: "5s",
            }}
          />
        </MotionDiv>
      </div>

      {/* Dark vignette overlay for depth — subtle, not a black mask */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.2) 100%)",
        }}
      />
    </div>
  );
}
