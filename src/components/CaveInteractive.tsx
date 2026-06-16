"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Particle System ────────────────────────────────────────────────────────

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  swayPhase: number;
  swaySpeed: number;
  swayAmp: number;
  opacity: number;
  opacityPeak: number;
  life: number;
  maxLife: number;
  hue: number;
  saturation: number;
  lightness: number;
}

type ZoneType = "fire" | "night" | "sun";

// ─── Zone Config ────────────────────────────────────────────────────────────

interface ZoneConfig {
  type: ZoneType;
  label: string;
  icon: string;
  description: string;
  particleHues: [number, number];
  particleSat: number;
  particleLight: number;
  accentClass: string;
  glow: string;
  ringClass: string;
  indicatorColor: string;
}

const ZONES: ZoneConfig[] = [
  {
    type: "fire",
    label: "Gold",
    icon: "✦",
    description: "Warm as fortune, bright as ambition — the mark of lasting value.",
    particleHues: [10, 20],
    particleSat: 85,
    particleLight: 55,
    accentClass: "text-primary",
    glow: "rgba(255, 59, 48, 0.25)",
    ringClass: "ring-primary/30 bg-primary/10 hover:bg-primary/20",
    indicatorColor: "#FF3B30",
  },
  {
    type: "night",
    label: "Platinum",
    icon: "◇",
    description: "Cool as precision, rare as vision — the signature of distinction.",
    particleHues: [200, 220],
    particleSat: 30,
    particleLight: 60,
    accentClass: "text-secondary",
    glow: "rgba(255, 106, 61, 0.25)",
    ringClass: "ring-secondary/30 bg-secondary/10 hover:bg-secondary/20",
    indicatorColor: "#FF6A3D",
  },
  {
    type: "sun",
    label: "Champagne",
    icon: "✦",
    description: "Light as celebration, warm as welcome — the essence of elegance.",
    particleHues: [38, 45],
    particleSat: 60,
    particleLight: 65,
    accentClass: "text-accent",
    glow: "rgba(255, 179, 71, 0.25)",
    ringClass: "ring-accent/30 bg-accent/10 hover:bg-accent/20",
    indicatorColor: "#FFB347",
  },
];

// ─── Messages ───────────────────────────────────────────────────────────────

const MESSAGES: Record<string, string> = {
  "": "The atrium is still. Touch the orbs to awaken the elements.",
  fire: "Gold radiates. Warmth fills the chamber.",
  night: "Platinum shimmers. Elegance dances in the light.",
  sun: "Champagne glows. The essence of refinement.",
  "fire,night": "Gold and platinum intertwine. The mark of true distinction.",
  "fire,sun": "Gold meets champagne. A celebration of brilliance.",
  "night,sun": "Platinum and champagne. The balance of cool and warm.",
  "fire,night,sun":
    "The triad awakens. Gold, Platinum, and Champagne as one. The era turns.",
};

function getMessage(zones: ZoneType[]): string {
  const key = [...zones].sort().join(",");
  return MESSAGES[key] ?? MESSAGES[""];
}

// ─── Component ──────────────────────────────────────────────────────────────

export function CaveInteractive() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const dimRef = useRef({ w: 800, h: 600 });
  const zonesRef = useRef<Set<ZoneType>>(new Set());
  const [activeZones, setActiveZones] = useState<Set<ZoneType>>(new Set());
  const [interacted, setInteracted] = useState(false);

  // ── Particle Initialization ──────────────────────────────────────────────

  const createParticle = useCallback(
    (w: number, h: number, zones: Set<ZoneType>): Particle => {
      const zoneArray = Array.from(zones);
      let hue: number, sat: number, light: number;

      if (zoneArray.length > 0) {
        const zone = zoneArray[Math.floor(Math.random() * zoneArray.length)];
        const cfg = ZONES.find((z) => z.type === zone)!;
        hue = cfg.particleHues[0] + Math.random() * (cfg.particleHues[1] - cfg.particleHues[0]);
        sat = cfg.particleSat;
        light = cfg.particleLight;
      } else {
        // Warm ember default
        hue = 10 + Math.random() * 15;
        sat = 80;
        light = 55;
      }

      const maxLife = 250 + Math.random() * 350;
      return {
        x: Math.random() * w,
        y: h + Math.random() * 80,
        size: 1.5 + Math.random() * 3,
        speedX: (Math.random() - 0.5) * 0.2,
        speedY: -(0.2 + Math.random() * 0.6),
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 0.008 + Math.random() * 0.015,
        swayAmp: 30 + Math.random() * 60,
        opacity: 0,
        opacityPeak: 0.3 + Math.random() * 0.4,
        life: 0,
        maxLife,
        hue,
        saturation: sat,
        lightness: light,
      };
    },
    [],
  );

  // ── Canvas Render Loop ───────────────────────────────────────────────────

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(dpr, dpr);
      dimRef.current = { w: rect.width, h: rect.height };
    };

    resize();
    window.addEventListener("resize", resize);

    // Seed initial particles
    const { w, h } = dimRef.current;
    particlesRef.current = Array.from({ length: 50 }, () =>
      createParticle(w, h, zonesRef.current),
    );

    const render = () => {
      const { w, h } = dimRef.current;
      const zones = zonesRef.current;
      const dpr = window.devicePixelRatio || 1;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // ── Clear with faint trail ──
      ctx.fillStyle = "rgba(5, 5, 5, 0.3)";
      ctx.fillRect(0, 0, w, h);

      // ── Update & draw particles ──
      const particles = particlesRef.current;
      const mx = mouseRef.current.x * w;
      const my = mouseRef.current.y * h;
      const torchRadius = Math.min(w, h) * 0.4;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;

        if (p.life > p.maxLife || p.y < -50) {
          Object.assign(p, createParticle(w, h, zones));
          continue;
        }

        // Sway motion
        const sway = Math.sin(p.life * p.swaySpeed + p.swayPhase) * p.swayAmp * 0.01;
        p.x += p.speedX + sway;
        p.y += p.speedY;

        // Fade in / out
        const fadeIn = Math.min(p.life / 60, 1);
        const fadeOut = Math.max(1 - (p.life - p.maxLife + 60) / 60, 0);
        p.opacity = p.opacityPeak * Math.min(fadeIn, fadeOut);

        // Distance from mouse (for torch dimming)
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const torchFactor = Math.min(dist / torchRadius, 1);

        // Glow size
        const glowSize = p.size * 3;

        ctx.save();
        ctx.globalAlpha = p.opacity * (1 - torchFactor * 0.6);

        // Glow
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowSize);
        glow.addColorStop(0, `hsla(${p.hue}, ${p.saturation}%, ${p.lightness}%, 0.3)`);
        glow.addColorStop(1, `hsla(${p.hue}, ${p.saturation}%, ${p.lightness}%, 0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowSize, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = `hsla(${p.hue}, ${p.saturation}%, ${Math.min(p.lightness + 20, 100)}%, 0.8)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // ── Ambient zone glow ──
      if (zones.size > 0) {
        for (const zoneType of zones) {
          const cfg = ZONES.find((z) => z.type === zoneType)!;
          const [hueLow, hueHigh] = cfg.particleHues;
          const midHue = (hueLow + hueHigh) / 2;
          const ambGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.5);
          ambGrad.addColorStop(0, `hsla(${midHue}, ${cfg.particleSat}%, ${cfg.particleLight}%, 0.03)`);
          ambGrad.addColorStop(1, "hsla(0, 0%, 0%, 0)");
          ctx.fillStyle = ambGrad;
          ctx.fillRect(0, 0, w, h);
        }
      }

      // ── Torch vignette ──
      const vignette = ctx.createRadialGradient(mx, my, torchRadius * 0.15, mx, my, torchRadius);
      vignette.addColorStop(0, "rgba(0,0,0,0)");
      vignette.addColorStop(0.5, "rgba(0,0,0,0.25)");
      vignette.addColorStop(1, "rgba(0,0,0,0.7)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);

      // ── Warm torch tint near cursor ──
      const warmGlow = ctx.createRadialGradient(mx, my, 0, mx, my, torchRadius * 0.3);
      warmGlow.addColorStop(0, "rgba(255, 150, 50, 0.04)");
      warmGlow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = warmGlow;
      ctx.fillRect(0, 0, w, h);

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, [createParticle]);

  // ── Event Handlers ───────────────────────────────────────────────────────

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      mouseRef.current = { x, y };
    },
    [],
  );

  const toggleZone = useCallback((type: ZoneType) => {
    setInteracted(true);
    const next = new Set(zonesRef.current);
    if (next.has(type)) next.delete(type);
    else next.add(type);
    zonesRef.current = next;
    setActiveZones(next);
  }, []);

  // ── Derived ──────────────────────────────────────────────────────────────

  const activeArray = Array.from(activeZones);
  const message = getMessage(activeArray);

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div
      ref={containerRef}
      className="relative h-[70vh] w-full overflow-hidden bg-bg-deep"
      onPointerMove={handlePointerMove}
    >
      {/* Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Central Message */}
      <div className="absolute inset-x-0 top-[15%] z-20 flex justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={message}
            initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
            animate={{ opacity: interacted ? 1 : 0.6, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-lg text-center"
          >
            <p className="text-base leading-relaxed text-text-tertiary/90 sm:text-lg">
              {message}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Zone Orbs */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="absolute inset-x-0 bottom-[12%] z-20 flex items-center justify-center gap-6 px-6 sm:gap-12"
      >
        {ZONES.map((zone, i) => {
          const isActive = activeZones.has(zone.type);
          return (
            <motion.button
              key={zone.type}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 + i * 0.15, type: "spring", stiffness: 200, damping: 15 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleZone(zone.type)}
              className={`group relative flex flex-col items-center gap-2 transition-opacity duration-500 ${
                isActive ? "" : "opacity-60 hover:opacity-90"
              }`}
              aria-label={`Activate ${zone.label}`}
            >
              {/* Orb glow ring */}
              <motion.span
                animate={{
                  scale: isActive ? 1 : 0.9,
                  boxShadow: isActive
                    ? `0 0 30px ${zone.glow}`
                    : "0 0 0px rgba(0,0,0,0)",
                }}
                transition={{ duration: 0.4 }}
                className={`flex h-16 w-16 items-center justify-center rounded-full text-2xl ring-2 transition-colors duration-500 sm:h-20 sm:w-20 sm:text-3xl ${
                  isActive ? zone.ringClass : ""
                }`}
                style={{
                  borderRadius: "50%",
                  borderColor: isActive ? undefined : "rgba(255,255,255,0.06)",
                  backgroundColor: isActive ? undefined : "rgba(255,255,255,0.03)",
                }}
              >
                <motion.span
                  animate={{ rotate: isActive ? [0, -10, 10, -5, 5, 0] : 0 }}
                  transition={{ duration: 0.6 }}
                  className="inline-block"
                >
                  {zone.icon}
                </motion.span>
              </motion.span>

              {/* Label */}
              <span
                className={`text-xs font-semibold uppercase tracking-widest transition-colors duration-500 sm:text-sm ${
                  isActive ? zone.accentClass : "text-text-muted"
                }`}
              >
                {zone.label}
              </span>

              {/* Active indicator bar */}
              <motion.span
                animate={{
                  opacity: isActive ? 1 : 0,
                  scaleX: isActive ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
                className="h-0.5 w-8 rounded-full origin-center"
                style={{
                  backgroundColor: isActive ? zone.indicatorColor : "transparent",
                }}
              />
            </motion.button>
          );
        })}
      </motion.div>

      {/* Bottom fade for depth */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24" style={{ background: "linear-gradient(to top, rgba(5,5,5,0.6), transparent)" }} />
    </div>
  );
}
