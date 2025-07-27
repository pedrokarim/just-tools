"use client";

import { ReactNode } from "react";

interface SlideElementProps {
  children: ReactNode;
  className?: string;
  direction?: "left" | "right" | "up" | "down";
  delay?: number;
  duration?: number;
}

export function SlideElement({
  children,
  className = "",
  direction = "up",
  delay = 0,
  duration = 0.6,
}: SlideElementProps) {
  const getTransform = () => {
    switch (direction) {
      case "left":
        return "translateX(-30px)";
      case "right":
        return "translateX(30px)";
      case "down":
        return "translateY(30px)";
      default:
        return "translateY(-30px)";
    }
  };

  return (
    <div
      className={`animate-slide-in-up ${className}`}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        transform: getTransform(),
      }}
    >
      {children}
    </div>
  );
}
