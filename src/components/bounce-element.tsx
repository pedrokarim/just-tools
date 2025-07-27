"use client";

import { ReactNode } from "react";

interface BounceElementProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

export function BounceElement({
  children,
  className = "",
  delay = 0,
  duration = 1,
}: BounceElementProps) {
  return (
    <div
      className={`animate-bounce ${className}`}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    >
      {children}
    </div>
  );
}
