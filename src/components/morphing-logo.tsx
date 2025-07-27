"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export function MorphingLogo() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="w-12 h-12 flex items-center justify-center group-hover:scale-110 transition-all duration-300">
        <Image
          src="/assets/images/icon-origin.png"
          alt="Just Tools Logo"
          width={48}
          height={48}
          className="group-hover:rotate-12 transition-transform duration-300"
        />
      </div>
    </div>
  );
}
