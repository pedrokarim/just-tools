import type { ReactNode } from "react";
import { AscenciaMark } from "@/components/brand/ascencia-mark";
import { JustToolsMark } from "@/components/brand/just-tools-lockup";

/**
 * L'écran d'authentification, repris d'`AuthCard` et `AuthPage` d'Ascencia ID :
 * le relief en fond, une carte qui se détache, et le logo de l'application en
 * tête. Ascencia ID reste discret, en pied : c'est lui qui authentifie, il le dit
 * sans voler la marque de Just Tools.
 *
 * Il sert aussi à l'accès refusé : les deux écrans sont les deux issues de la même
 * porte, et cette page doit rester lisible sans JavaScript.
 */
export function AuthScreen({
  title,
  subtitle,
  children,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="asc-summit bg-bg-page flex min-h-dvh items-center justify-center overflow-hidden p-4">
      <section className="asc-animate-rise rounded-card border-border bg-elevated shadow-card relative w-full max-w-[400px] overflow-hidden border">
        <header className="asc-contours-tight border-border relative flex flex-col items-center gap-3.5 border-b px-7 pt-8 pb-6 text-center">
          <JustToolsMark size={52} title="" />
          <div className="flex min-w-0 flex-col gap-1 [overflow-wrap:anywhere]">
            <h1 className="font-display text-fg text-[1.1875rem] leading-snug font-semibold tracking-[-0.025em]">
              {title}
            </h1>
            {subtitle && (
              <p className="text-fg-muted text-[0.8125rem] leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        </header>

        <div className="flex flex-col gap-4 px-7 py-6">{children}</div>

        <footer className="border-border text-fg-muted flex items-center justify-center gap-2 border-t bg-[color-mix(in_srgb,var(--asc-primary)_4%,var(--asc-surface))] px-6 py-3 text-[0.6875rem]">
          <AscenciaMark size={14} title={null} />
          <span>
            Sécurisé par{" "}
            <b translate="no" className="text-fg font-semibold">
              Ascencia&nbsp;ID
            </b>
          </span>
        </footer>
      </section>
    </main>
  );
}

/** Un bandeau d'état dans la carte. Le ton accompagne le texte, il ne le remplace pas. */
export function AuthNotice({
  tone,
  children,
}: {
  tone: "danger" | "warning";
  children: ReactNode;
}) {
  return (
    <div
      role="alert"
      className={
        tone === "danger"
          ? "rounded-field border-danger/25 bg-danger-soft text-danger-soft-fg border px-3.5 py-2.5 text-sm leading-relaxed"
          : "rounded-field border-warning/30 bg-warning-soft text-warning-soft-fg border px-3.5 py-2.5 text-sm leading-relaxed"
      }
    >
      {children}
    </div>
  );
}
