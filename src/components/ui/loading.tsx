import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2, RefreshCw, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const loadingVariants = cva(
  "flex flex-col items-center justify-center gap-3 text-center",
  {
    variants: {
      size: {
        sm: "px-4 py-4",
        md: "px-6 py-8",
        lg: "px-8 py-12",
        xl: "px-8 py-16",
      },
      variant: {
        default: "text-fg-muted",
        primary: "text-link",
        secondary: "text-fg",
        muted: "text-fg-subtle",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
);

const iconVariants = cva("asc-animate-spin", {
  variants: {
    size: {
      sm: "size-4",
      md: "size-5",
      lg: "size-6",
      xl: "size-8",
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
      md: "text-sm",
      lg: "text-base",
      xl: "text-lg",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const subtextVariants = cva("text-fg-subtle", {
  variants: {
    size: {
      sm: "text-xs",
      md: "text-sm",
      lg: "text-sm",
      xl: "text-base",
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
  message = "Chargement…",
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
      "aria-hidden": true,
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
    fullScreen && "min-h-dvh w-full"
  );

  return (
    <div role="status" className={containerClasses} {...props}>
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
  message = "Chargement des données…",
  ...props
}: AdminLoadingProps) {
  return (
    <Loading
      size={mode === "compact" ? "sm" : "md"}
      message={message}
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
        "absolute inset-0 z-(--z-sticky) flex items-center justify-center",
        overlay && "bg-bg-page/80",
        blur && "backdrop-blur-[3px]",
        className
      )}
    >
      <Loading {...props} />
    </div>
  );
}

// Composant pour les boutons de chargement
export type LoadingButtonProps = React.ComponentProps<typeof Button> & {
  loading?: boolean;
  loadingText?: string;
};

/**
 * Le `Button` du système, avec son état d'attente.
 *
 * `variant` et `size` lui sont bien transmis : un `<button>` nu les recevait
 * comme de simples attributs HTML, et tout sortait en primaire.
 */
function LoadingButton({
  loading = false,
  loadingText = "Chargement…",
  children,
  disabled,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="asc-animate-spin" aria-hidden />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
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
