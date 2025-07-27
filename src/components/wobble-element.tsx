"use client";

import { ReactNode } from "react";

interface WobbleElementProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

export function WobbleElement({
  children,
  className = "",
  delay = 0,
  duration = 1,
}: WobbleElementProps) {
  return (
    <div
      className={`animate-pulse ${className}`}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        transform: "rotate(0deg)",
        transition: "all 0.1s ease-in-out",
      }}
    >
      {children}
    </div>
  );
}
