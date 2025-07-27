"use client";

import { ReactNode } from "react";

interface ShimmerElementProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

export function ShimmerElement({
  children,
  className = "",
  delay = 0,
  duration = 2,
}: ShimmerElementProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {children}
      <div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
        style={{
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`,
          animationName: "shimmer",
          animationIterationCount: "infinite",
        }}
      />
    </div>
  );
}
