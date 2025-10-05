"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { AnimatedCounter } from "./animated-counter";

interface LoadingCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  isLoading?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function LoadingCard({
  title,
  description,
  icon,
  isLoading = false,
  children,
  className,
}: LoadingCardProps) {
  return (
    <Card className={cn("relative", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

// Composant spécialisé pour les statistiques avec compteur animé
interface StatCardProps {
  title: string;
  value: number;
  description?: string;
  icon?: React.ReactNode;
  isLoading?: boolean;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon,
  isLoading = false,
  prefix = "",
  suffix = "",
  decimals = 0,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("relative", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        ) : (
          <div className="space-y-1">
            <div className="text-2xl font-bold">
              {prefix}
              <AnimatedCounter
                value={value}
                duration={1500}
                decimals={decimals}
              />
              {suffix}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
