"use client";

import { ReactNode } from "react";

interface ZoomElementProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  scale?: number;
}

export function ZoomElement({
  children,
  className = "",
  delay = 0,
  duration = 0.6,
  scale = 1.1,
}: ZoomElementProps) {
  return (
    <div
      className={`transition-transform duration-300 ease-in-out hover:scale-${Math.round(
        scale * 100
      )} ${className}`}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    >
      {children}
    </div>
  );
}
