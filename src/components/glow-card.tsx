"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ComponentProps } from "react";

interface GlowCardProps extends ComponentProps<typeof Card> {
  children: React.ReactNode;
  glowColor?: string;
}

export function GlowCard({
  children,
  className,
  glowColor = "from-blue-500/20 to-purple-500/20",
  ...props
}: GlowCardProps) {
  return (
    <div className="relative group">
      <div
        className={`absolute -inset-1 bg-gradient-to-r ${glowColor} rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      ></div>
      <Card
        className={`relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 ${
          className || ""
        }`}
        {...props}
      >
        {children}
      </Card>
    </div>
  );
}
