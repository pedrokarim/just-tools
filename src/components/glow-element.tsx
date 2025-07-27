"use client";

import { ReactNode } from "react";

interface GlowElementProps {
  children: ReactNode;
  className?: string;
  color?: string;
  intensity?: number;
}

export function GlowElement({
  children,
  className = "",
  color = "blue",
  intensity = 0.5,
}: GlowElementProps) {
  const getGlowColor = () => {
    switch (color) {
      case "blue":
        return "rgba(59, 130, 246, 0.5)";
      case "purple":
        return "rgba(139, 92, 246, 0.5)";
      case "pink":
        return "rgba(236, 72, 153, 0.5)";
      case "green":
        return "rgba(34, 197, 94, 0.5)";
      default:
        return "rgba(59, 130, 246, 0.5)";
    }
  };

  return (
    <div
      className={`animate-pulse-glow ${className}`}
      style={{
        boxShadow: `0 0 20px ${getGlowColor()}`,
        filter: `brightness(${1 + intensity})`,
      }}
    >
      {children}
    </div>
  );
}
