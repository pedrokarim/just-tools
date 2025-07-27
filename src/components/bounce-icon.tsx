"use client";

import { useState } from "react";

interface BounceIconProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function BounceIcon({
  children,
  className = "",
  onClick,
}: BounceIconProps) {
  const [isBouncing, setIsBouncing] = useState(false);

  const handleClick = () => {
    setIsBouncing(true);
    setTimeout(() => setIsBouncing(false), 300);
    onClick?.();
  };

  return (
    <div
      className={`cursor-pointer transition-transform duration-300 ${
        isBouncing ? "animate-bounce" : ""
      } ${className}`}
      onClick={handleClick}
    >
      {children}
    </div>
  );
}
