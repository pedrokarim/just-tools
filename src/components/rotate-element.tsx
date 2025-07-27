"use client";

import { ReactNode } from "react";

interface RotateElementProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  angle?: number;
}

export function RotateElement({
  children,
  className = "",
  delay = 0,
  duration = 0.6,
  angle = 360,
}: RotateElementProps) {
  return (
    <div
      className={`animate-spin ${className}`}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        transform: `rotate(${angle}deg)`,
      }}
    >
      {children}
    </div>
  );
}
