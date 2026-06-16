"use client";

import { useEffect, useRef } from "react";

interface ParticleFieldProps {
  count?: number;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  life: number;
  maxLife: number;
  driftX: number;
  glowSize: number;
  color: string;
  colorRgb: string;
  depth: number; // 0.2 - 1.0, closer = more mouse influence
}

const COLORS = [
  { color: "rgba(255, 59, 48, {alpha})", rgb: "255, 59, 48" },   // Red
  { color: "rgba(255, 106, 61, {alpha})", rgb: "255, 106, 61" },  // Orange
  { color: "rgba(255, 179, 71, {alpha})", rgb: "255, 179, 71" },  // Gold
  { color: "rgba(255, 255, 255, {alpha})", rgb: "255, 255, 255" }, // White
];

export function ParticleField({
  count = 200,
  className = "",
}: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);
  const dimRef = useRef({ w: 800, h: 600 });
  const mouseRef = useRef({ x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 });

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

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX / window.innerWidth;
      mouseRef.current.targetY = e.clientY / window.innerHeight;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Initialize particles
    const createParticle = (w: number, h: number): Particle => {
      const colorObj = COLORS[Math.floor(Math.random() * COLORS.length)];
      const depth = 0.3 + Math.random() * 0.7;
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        size: 1 + Math.random() * 4,
        speedX: (Math.random() - 0.5) * 0.2,
        speedY: -(0.1 + Math.random() * 0.3),
        opacity: 0.15 + Math.random() * 0.35,
        life: Math.random() * 300,
        maxLife: 300 + Math.random() * 500,
        driftX: (Math.random() - 0.5) * 0.25 * depth,
        glowSize: 2 + Math.random() * 6,
        color: colorObj.color,
        colorRgb: colorObj.rgb,
        depth,
      };
    };

    particlesRef.current = Array.from({ length: count }, () =>
      createParticle(dimRef.current.w, dimRef.current.h),
    );

    const render = () => {
      const { w, h } = dimRef.current;
      const dpr = window.devicePixelRatio || 1;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Clear with dark trail
      ctx.fillStyle = "rgba(5, 5, 5, 0.12)";
      ctx.fillRect(0, 0, w, h);

      // Smooth mouse interpolation for spring-like feel
      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Mouse offset (centered, range -1 to 1)
      const mouseOffsetX = (mouse.x - 0.5) * 2;
      const mouseOffsetY = (mouse.y - 0.5) * 2;

      const particles = particlesRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life++;

        if (p.life > p.maxLife) {
          particles[i] = createParticle(w, h);
          continue;
        }

        // Base movement
        p.x += p.speedX + p.driftX;
        p.y += p.speedY;

        // Mouse influence — particles with higher depth react more
        const mouseInfluence = p.depth * 2.0;
        p.x += mouseOffsetX * 0.3 * p.depth;
        p.y += mouseOffsetY * 0.3 * p.depth;

        // Wrap horizontally
        if (p.x < -50) p.x = w + 50;
        if (p.x > w + 50) p.x = -50;
        if (p.y < -50) p.y = h + 50;
        if (p.y > h + 50) p.y = -50;

        // Fade in/out
        const fadeIn = Math.min(p.life / 80, 1);
        const fadeOut = Math.max(1 - (p.life - p.maxLife + 80) / 80, 0);
        const alpha = p.opacity * Math.min(fadeIn, fadeOut);

        // Scale by depth — closer particles appear larger
        const depthScale = 0.6 + p.depth * 0.6;
        const displaySize = p.size * depthScale;
        const displayGlow = p.glowSize * depthScale;

        // Draw glow
        const colorStr = p.color.replace("{alpha}", String(alpha * 0.4));
        const gradient = ctx.createRadialGradient(
          p.x, p.y, 0,
          p.x, p.y, displayGlow * 2
        );
        gradient.addColorStop(0, `rgba(${p.colorRgb}, ${alpha * 0.3})`);
        gradient.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, displayGlow * 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw core
        ctx.fillStyle = p.color.replace("{alpha}", String(alpha));
        ctx.beginPath();
        ctx.arc(p.x, p.y, displaySize, 0, Math.PI * 2);
        ctx.fill();

        // Draw bright center for larger particles
        if (displaySize > 2.5) {
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.3})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, displaySize * 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animRef.current);
    };
  }, [count]);

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none absolute inset-0 ${className}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
