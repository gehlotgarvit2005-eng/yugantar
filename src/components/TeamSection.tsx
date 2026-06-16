"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface TeamMember {
  name: string;
  role: string;
  image: string;
  color: string;
  objectPosition?: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "RAKESH SOLANKI",
    role: "Creative Lead",
    image: "/rakesh.jpg.jpg",
    color: "#FF3B30", // Red/Orange
  },
  {
    name: "SOURABH SINGH TAK",
    role: "Growth Lead",
    image: "/sourabh.jpg.jpeg",
    color: "#00F2FE", // Cyan
  },
  {
    name: "GARVIT GEHLOT",
    role: "Vision Lead",
    image: "/garvit.jpg 2.jpeg",
    color: "#BD10E0", // Purple
    objectPosition: "top",
  },
  {
    name: "NARAYAN SHARMA",
    role: "Tech Lead",
    image: "/narayan.jpg.jpeg",
    color: "#39FF14", // Lime
  },
  {
    name: "JIYA PUROHIT",
    role: "Content Manager",
    image: "/jiya.jpg.jpeg",
    color: "#FFD700", // Yellow
  },
  {
    name: "JAHANVI SHEKHAWAT",
    role: "Event Manager",
    image: "/Jahanvi.jpg.jpeg",
    color: "#FF007F", // Pink
  },
  {
    name: "MAHI GOSWAMI",
    role: "Growth & Marketing Lead",
    image: "/mahi.jpg.jpeg",
    color: "#FF5E3A", // Orange-Red
  },
  {
    name: "LAKSHYA TAK",
    role: "Creative Content Director",
    image: "/lakshaya.jpg.jpeg",
    color: "#8A2BE2", // Violet
  },
];

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

export function TeamSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Canvas slow moving particles
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

    const particleCount = 40;
    const particles: Array<{
      x: number;
      y: number;
      radius: number;
      color: string;
      vx: number;
      vy: number;
    }> = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.5,
        color: i % 2 === 0 ? "rgba(0, 242, 254, 0.25)" : "rgba(189, 16, 224, 0.25)",
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.05 * (1 - dist / 150)})`;
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

  if (!isMounted) return null;

  return (
    <section className="relative py-24 overflow-hidden bg-black/40 border-t border-b border-white/[0.04] w-full flex flex-col items-center">
      {/* Background neon ambient highlights */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-secondary/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Particle Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl px-6 flex flex-col items-center">
        {/* Heading Section */}
        <div className="text-center mb-16 max-w-2xl">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 0.8, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-xs uppercase tracking-widest text-secondary font-semibold block mb-3"
          >
            Behind the Curtain
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 uppercase bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent"
          >
            THE MINDS BEHIND YUGANTAR
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm text-text-tertiary leading-relaxed"
          >
            Meet the visionaries, creators, and innovators driving the future of YUGANTAR 2026.
          </motion.p>
        </div>

        {/* Staggered Grid of Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full"
        >
          {teamMembers.map((member) => (
            <motion.div key={member.name} variants={cardVariants} className="h-full">
              <TeamCard member={member} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Individual 3D Parallax Team Card Component ────────────────────────

function TeamCard({ member }: { member: typeof teamMembers[0] }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    card.style.setProperty("--rx", `${-y / 10}deg`);
    card.style.setProperty("--ry", `${x / 10}deg`);
    card.style.setProperty("--scale", "1.03");
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    card.style.setProperty("--rx", "0deg");
    card.style.setProperty("--ry", "0deg");
    card.style.setProperty("--scale", "1");
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex flex-col items-center justify-center p-8 rounded-3xl border border-white/[0.06] bg-neutral-900/10 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-300 cursor-default group h-full"
      style={{
        transform: "perspective(1000px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) scale(var(--scale, 1))",
        transformStyle: "preserve-3d",
      }}
    >
      {/* Background radial glow overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-3xl"
        style={{
          background: `radial-gradient(350px circle at 50% 50%, ${member.color}15, transparent 65%)`,
        }}
      />
      {/* Neon border highlight outline */}
      <div className="absolute -inset-px rounded-3xl bg-gradient-to-r from-white/5 to-white/5 opacity-40 group-hover:from-white/10 group-hover:to-white/10 transition-colors pointer-events-none" />

      {/* Rounded Portrait Frame */}
      <div
        className="relative mb-6 w-32 h-32 rounded-full overflow-hidden border-2 border-white/[0.08] shadow-[0_0_20px_rgba(0,0,0,0.4)] group-hover:scale-105 transition-transform duration-300 flex-shrink-0"
        style={{
          boxShadow: `0 0 20px ${member.color}25`,
        }}
      >
        <Image
          src={member.image}
          alt={member.name}
          fill
          sizes="(max-width: 768px) 128px, 128px"
          priority
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          style={{ objectPosition: member.objectPosition || "center" }}
        />
        {/* Pulsing overlay ring */}
        <div
          className="absolute inset-0 rounded-full border border-white/20 pointer-events-none animate-ring-pulse"
          style={{
            borderColor: `${member.color}40`,
          }}
        />
      </div>

      {/* Profile texts with 3D offset */}
      <div className="text-center relative z-10 space-y-1" style={{ transform: "translateZ(25px)" }}>
        <h4 className="text-sm font-extrabold text-white tracking-wider uppercase group-hover:text-primary transition-colors duration-300 leading-snug">
          {member.name}
        </h4>
        <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-widest leading-none">
          {member.role}
        </p>
      </div>

      {/* Global pulse CSS animations */}
      <style jsx global>{`
        @keyframes ring-pulse {
          0%, 100% { opacity: 0.4; box-shadow: inset 0 0 5px currentColor; }
          50% { opacity: 0.8; box-shadow: inset 0 0 15px currentColor; }
        }
        .animate-ring-pulse {
          animation: ring-pulse 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
