"use client";

import { ReactNode } from "react";

interface FadeElementProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

export function FadeElement({
  children,
  className = "",
  delay = 0,
  duration = 0.6,
}: FadeElementProps) {
  return (
    <div
      className={`animate-fade-in-up ${className}`}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    >
      {children}
    </div>
  );
}
