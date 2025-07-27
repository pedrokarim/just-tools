"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ComponentProps } from "react";

interface GradientBorderCardProps extends ComponentProps<typeof Card> {
  children: React.ReactNode;
  gradientColors?: string;
}

export function GradientBorderCard({
  children,
  className,
  gradientColors = "from-blue-500 via-purple-500 to-pink-500",
  ...props
}: GradientBorderCardProps) {
  return (
    <div className="relative group">
      <div
        className={`absolute -inset-0.5 bg-gradient-to-r ${gradientColors} rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300 animate-pulse`}
      ></div>
      <Card
        className={`relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 ${
          className || ""
        }`}
        {...props}
      >
        {children}
      </Card>
    </div>
  );
}
