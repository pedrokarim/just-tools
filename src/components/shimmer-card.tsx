"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ComponentProps } from "react";

interface ShimmerCardProps extends ComponentProps<typeof Card> {
  children: React.ReactNode;
}

export function ShimmerCard({
  children,
  className,
  ...props
}: ShimmerCardProps) {
  return (
    <div className="relative group">
      <Card
        className={`relative overflow-hidden ${className || ""}`}
        {...props}
      >
        {children}
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
      </Card>
    </div>
  );
}
