"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ComponentProps } from "react";

interface WaveButtonProps extends ComponentProps<typeof Button> {
  children: React.ReactNode;
}

export function WaveButton({ children, className, ...props }: WaveButtonProps) {
  const [waves, setWaves] = useState<
    Array<{ id: number; x: number; y: number }>
  >([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const newWave = {
        id: Date.now(),
        x,
        y,
      };

      setWaves((prev) => [...prev, newWave]);

      setTimeout(() => {
        setWaves((prev) => prev.filter((wave) => wave.id !== newWave.id));
      }, 1000);
    }
  };

  return (
    <Button
      ref={buttonRef}
      className={`relative overflow-hidden ${className || ""}`}
      onClick={handleClick}
      {...props}
    >
      {children}
      {waves.map((wave) => (
        <span
          key={wave.id}
          className="absolute rounded-full bg-white/30 animate-ping"
          style={{
            left: wave.x - 20,
            top: wave.y - 20,
            width: 40,
            height: 40,
            animationDuration: "1s",
          }}
        />
      ))}
    </Button>
  );
}
