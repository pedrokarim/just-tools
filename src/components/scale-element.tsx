"use client";

import { ReactNode } from "react";

interface ScaleElementProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  scale?: number;
}

export function ScaleElement({
  children,
  className = "",
  delay = 0,
  duration = 0.6,
  scale = 0.8,
}: ScaleElementProps) {
  return (
    <div
      className={`animate-scale-in ${className}`}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        transform: `scale(${scale})`,
      }}
    >
      {children}
    </div>
  );
}
