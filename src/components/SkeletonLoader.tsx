"use client";

import { cn } from "@/lib/utils";

interface SkeletonLoaderProps {
  className?: string;
  variant?: "card" | "text" | "avatar" | "image" | "custom";
  count?: number;
}

export function SkeletonLoader({
  className,
  variant = "text",
  count = 1,
}: SkeletonLoaderProps) {
  if (variant === "card") {
    return (
      <div className={cn("glass-card p-6 space-y-4", className)}>
        <div className="flex items-center justify-between">
          <div className="skeleton h-5 w-20" />
          <div className="skeleton h-5 w-12" />
        </div>
        <div className="space-y-2">
          <div className="skeleton h-3 w-full" />
          <div className="skeleton h-3 w-3/4" />
          <div className="skeleton h-3 w-1/2" />
        </div>
        <div className="flex items-center gap-2 pt-3 border-t border-white/5">
          <div className="skeleton h-8 w-8 rounded-full" />
          <div className="space-y-1.5 flex-1">
            <div className="skeleton h-3 w-24" />
            <div className="skeleton h-2 w-16" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "avatar") {
    return (
      <div className={cn("skeleton rounded-full", className)} />
    );
  }

  if (variant === "image") {
    return (
      <div className={cn("skeleton aspect-video rounded-lg", className)} />
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="skeleton h-3"
          style={{ width: `${70 + Math.random() * 30}%` }}
        />
      ))}
    </div>
  );
}
