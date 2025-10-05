import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2, RefreshCw, Zap } from "lucide-react";

import { cn } from "@/lib/utils";

const loadingVariants = cva(
  "flex flex-col items-center justify-center gap-3 text-center",
  {
    variants: {
      size: {
        sm: "py-4 px-6",
        md: "py-8 px-12",
        lg: "py-12 px-16",
        xl: "py-16 px-20",
      },
      variant: {
        default: "text-muted-foreground",
        primary: "text-primary",
        secondary: "text-secondary-foreground",
        muted: "text-muted-foreground/70",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
);

const iconVariants = cva("animate-spin", {
  variants: {
    size: {
      sm: "h-4 w-4",
      md: "h-6 w-6",
      lg: "h-8 w-8",
      xl: "h-12 w-12",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const textVariants = cva("font-medium", {
  variants: {
    size: {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
      xl: "text-xl",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const subtextVariants = cva("text-muted-foreground/80", {
  variants: {
    size: {
      sm: "text-xs",
      md: "text-sm",
      lg: "text-base",
      xl: "text-lg",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export interface LoadingProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof loadingVariants> {
  message?: string;
  submessage?: string;
  icon?: "spinner" | "refresh" | "zap" | "custom";
  customIcon?: React.ReactNode;
  showIcon?: boolean;
  centered?: boolean;
  fullScreen?: boolean;
}

function Loading({
  className,
  size,
  variant,
  message = "Chargement...",
  submessage,
  icon = "spinner",
  customIcon,
  showIcon = true,
  centered = true,
  fullScreen = false,
  ...props
}: LoadingProps) {
  const getIcon = () => {
    if (!showIcon) return null;

    if (customIcon) return customIcon;

    const iconProps = {
      className: cn(iconVariants({ size })),
    };

    switch (icon) {
      case "refresh":
        return <RefreshCw {...iconProps} />;
      case "zap":
        return <Zap {...iconProps} />;
      case "spinner":
      default:
        return <Loader2 {...iconProps} />;
    }
  };

  const containerClasses = cn(
    loadingVariants({ size, variant, className }),
    centered && "mx-auto",
    fullScreen && "min-h-screen w-full"
  );

  return (
    <div className={containerClasses} {...props}>
      {getIcon()}
      <div className="space-y-1">
        {message && <div className={cn(textVariants({ size }))}>{message}</div>}
        {submessage && (
          <div className={cn(subtextVariants({ size }))}>{submessage}</div>
        )}
      </div>
    </div>
  );
}

// Composant spécialisé pour les pages admin
export interface AdminLoadingProps
  extends Omit<LoadingProps, "size" | "variant"> {
  mode?: "compact" | "full";
}

function AdminLoading({
  mode = "full",
  message = "Chargement des données...",
  submessage = "Veuillez patienter",
  ...props
}: AdminLoadingProps) {
  return (
    <Loading
      size={mode === "compact" ? "sm" : "lg"}
      variant="primary"
      message={message}
      submessage={submessage}
      icon="spinner"
      {...props}
    />
  );
}

// Composant pour les overlays de chargement
export interface LoadingOverlayProps extends LoadingProps {
  overlay?: boolean;
  blur?: boolean;
}

function LoadingOverlay({
  overlay = true,
  blur = true,
  className,
  ...props
}: LoadingOverlayProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 z-50 flex items-center justify-center",
        overlay && "bg-background/80 backdrop-blur-sm",
        blur && "backdrop-blur-sm",
        className
      )}
    >
      <Loading {...props} />
    </div>
  );
}

// Composant pour les boutons de chargement
export interface LoadingButtonProps extends React.ComponentProps<"button"> {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

function LoadingButton({
  loading = false,
  loadingText = "Chargement...",
  children,
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
        "bg-primary text-primary-foreground hover:bg-primary/90",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {loading ? loadingText : children}
    </button>
  );
}

export {
  Loading,
  AdminLoading,
  LoadingOverlay,
  LoadingButton,
  loadingVariants,
  iconVariants,
  textVariants,
  subtextVariants,
};
