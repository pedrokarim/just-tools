"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

/**
 * Un chiffre qui signale son propre changement.
 *
 * Il arrive à sa vraie valeur et ne compte qu'ensuite, quand elle bouge : un
 * compteur qui démarre de zéro à chaque ouverture de page ne dit rien, il fait
 * attendre. `tabular-nums` fixe la largeur : le texte voisin ne tremble pas.
 */
export function AnimatedCounter({
  value,
  duration = 600,
  className,
  prefix = "",
  suffix = "",
  decimals = 0,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(value);

  // L'animation a besoin de sa valeur de départ, mais elle met `displayValue`
  // à jour à chaque image : en faire une dépendance de l'effet relancerait
  // l'animation en boucle. On la suit donc dans une ref, qu'on lit sans
  // s'y abonner.
  const displayValueRef = useRef(displayValue);
  useEffect(() => {
    displayValueRef.current = displayValue;
  }, [displayValue]);

  useEffect(() => {
    const startValue = displayValueRef.current;
    if (startValue === value) return;

    // `tokens.css` neutralise les animations CSS, pas celle-ci : elle tourne en
    // JavaScript et doit lire la préférence elle-même.
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Sans animation, la valeur s'applique à la première image.
    const length = value === 0 || reducedMotion ? 0 : duration;
    const startTime = Date.now();
    let frame = 0;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = length > 0 ? Math.min(elapsed / length, 1) : 1;

      // Fonction d'easing pour une animation plus fluide
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      setDisplayValue(startValue + (value - startValue) * easeOutQuart);

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  const formatted = displayValue.toLocaleString("fr-FR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span className={cn("tabular-nums", className)}>
      {prefix}
      {formatted}
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
    return <Skeleton className={cn("h-8 w-20", className)} />;
  }

  return (
    <AnimatedCounter
      value={value}
      className={cn("font-display text-2xl font-bold", className)}
    />
  );
}
