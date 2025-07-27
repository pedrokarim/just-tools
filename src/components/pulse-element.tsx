"use client";

import { ReactNode } from "react";

interface PulseElementProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

export function PulseElement({
  children,
  className = "",
  delay = 0,
  duration = 2,
}: PulseElementProps) {
  return (
    <div
      className={`animate-pulse ${className}`}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    >
      {children}
    </div>
  );
}
