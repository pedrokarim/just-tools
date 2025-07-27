"use client";

import { ReactNode } from "react";

interface MorphingElementProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

export function MorphingElement({
  children,
  className = "",
  delay = 0,
  duration = 2,
}: MorphingElementProps) {
  return (
    <div
      className={`animate-pulse ${className}`}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        transform: "scale(1)",
        transition: "all 0.3s ease-in-out",
      }}
    >
      {children}
    </div>
  );
}
