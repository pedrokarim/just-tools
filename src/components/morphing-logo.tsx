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
      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-all duration-300 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <Image
          src="/assets/images/icon-origin.png"
          alt="Just Tools Logo"
          width={20}
          height={20}
          className="relative z-10 group-hover:rotate-12 transition-transform duration-300"
        />
      </div>
      <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
    </div>
  );
}
