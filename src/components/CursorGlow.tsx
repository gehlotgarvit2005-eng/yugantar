"use client";

import { useEffect, useRef } from "react";

export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(() => {
          if (glow) {
            glow.style.transform = `translate(${mouseRef.current.x - 150}px, ${mouseRef.current.y - 150}px)`;
          }
          rafRef.current = null;
        });
      }
    };

    const handleMouseLeave = () => {
      if (glow) glow.style.opacity = "0";
    };

    const handleMouseEnter = () => {
      if (glow) glow.style.opacity = "1";
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={glowRef}
      className="pointer-events-none fixed left-0 top-0 z-[9999] h-[300px] w-[300px] opacity-0 transition-opacity duration-500"
      style={{
        background:
          "radial-gradient(circle, rgba(255,59,48,0.06) 0%, rgba(255,106,61,0.03) 40%, transparent 70%)",
        borderRadius: "50%",
        filter: "blur(20px)",
        willChange: "transform",
      }}
      aria-hidden="true"
    />
  );
}
