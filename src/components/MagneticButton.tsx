"use client";

import { useRef, useCallback, type MouseEvent, type ReactNode } from "react";
import { motion } from "framer-motion";

interface MagneticButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  as?: "button" | "a";
  href?: string;
  [key: string]: unknown;
}

export function MagneticButton({
  children,
  onClick,
  className = "",
  as = "button",
  href,
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const position = useRef({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.3;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
    position.current = { x, y };
    ref.current.style.transform = `translate(${x}px, ${y}px)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return;
    position.current = { x: 0, y: 0 };
    ref.current.style.transform = "translate(0px, 0px)";
  }, []);

  const Component = motion[as as keyof typeof motion] as any;
  const motionProps = as === "a" ? { href } : {};

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="inline-block"
      style={{ transition: "transform 0.2s ease-out" }}
    >
      <Component
        onClick={onClick}
        className={className}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        {...motionProps}
        {...props}
      >
        {children}
      </Component>
    </div>
  );
}
