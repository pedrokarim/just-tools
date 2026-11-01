import Image from "next/image";
import { cn } from "@/lib/utils";

/** Le logo de Just Tools. Lui seul échappe à la direction d'Ascencia ID. */
export function JustToolsMark({
  size = 28,
  title = "Just Tools",
  className,
}: {
  size?: number;
  /** Texte de remplacement ; `""` quand le nom est déjà écrit à côté. */
  title?: string;
  className?: string;
}) {
  return (
    <Image
      src="/assets/images/icon-origin.png"
      alt={title}
      width={size}
      height={size}
      className={cn("shrink-0", className)}
    />
  );
}

export function JustToolsLockup({
  size = 28,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      translate="no"
      className={cn("inline-flex min-w-0 items-center gap-2.5", className)}
    >
      <JustToolsMark size={size} title="" />
      <span className="font-display text-fg text-[1.0625rem] leading-none font-semibold tracking-[-0.03em] whitespace-nowrap">
        Just Tools
      </span>
    </span>
  );
}
