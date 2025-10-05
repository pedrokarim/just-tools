"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export function AnimatedCounter({
  value,
  duration = 2000,
  className,
  prefix = "",
  suffix = "",
  decimals = 0,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (value === 0) {
      setDisplayValue(0);
      return;
    }

    setIsAnimating(true);
    const startTime = Date.now();
    const startValue = displayValue;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Fonction d'easing pour une animation plus fluide
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      const currentValue = startValue + (value - startValue) * easeOutQuart;
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  const formatValue = (val: number) => {
    if (decimals > 0) {
      return val.toFixed(decimals);
    }
    return Math.round(val).toLocaleString();
  };

  return (
    <span
      className={cn(
        "transition-all duration-300",
        isAnimating && "scale-105",
        className
      )}
    >
      {prefix}
      {formatValue(displayValue)}
      {suffix}
    </span>
  );
}

// Composant spécialisé pour les statistiques du dashboard
interface StatCounterProps {
  value: number;
  isLoading?: boolean;
  className?: string;
}

export function StatCounter({
  value,
  isLoading = false,
  className,
}: StatCounterProps) {
  if (isLoading) {
    return (
      <div
        className={cn("animate-pulse bg-muted rounded h-8 w-20", className)}
      />
    );
  }

  return (
    <AnimatedCounter
      value={value}
      duration={1500}
      className={cn("text-2xl font-bold", className)}
    />
  );
}
