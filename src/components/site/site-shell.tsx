import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

/** La coquille des pages publiques : en-tête, contenu, pied. */
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#contenu"
        className="focus:bg-elevated focus:text-fg focus:shadow-pop focus:rounded-field sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-(--z-toast) focus:px-4 focus:py-2.5 focus:text-sm"
      >
        Aller au contenu principal
      </a>
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}

/**
 * La colonne de lecture des pages de texte, reprise de `PublicDocument`.
 *
 * Elle porte seule la contrainte de largeur : deux contraintes superposées ne se
 * complètent pas, l'une annule le centrage de l'autre.
 */
export function ReadingColumn({
  title,
  lead,
  updatedAt,
  children,
}: {
  title: ReactNode;
  lead?: ReactNode;
  /** Date de dernière mise à jour, déjà formatée. */
  updatedAt?: string;
  children: ReactNode;
}) {
  return (
    <main
      id="contenu"
      className="mx-auto w-full max-w-3xl flex-1 px-5 py-12 md:py-16 lg:px-8"
    >
      <header className="mb-10 flex flex-col gap-4">
        <h1 className="text-fg text-3xl leading-tight font-bold tracking-[-0.035em] text-balance md:text-4xl">
          {title}
        </h1>
        {lead && (
          <p className="text-fg-muted text-lg leading-relaxed text-pretty">
            {lead}
          </p>
        )}
        {updatedAt && (
          <p className="text-fg-subtle text-sm">
            Dernière mise à jour&nbsp;: {updatedAt}
          </p>
        )}
      </header>

      {children}
    </main>
  );
}

/** Une section de texte. Le titre porte l'ancre : une section doit pouvoir se citer. */
export function ReadingSection({
  id,
  title,
  children,
}: {
  id: string;
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="mb-10 scroll-mt-24">
      <h2 className="text-fg mb-3 text-xl font-semibold tracking-[-0.025em]">
        <a href={`#${id}`} className="hover:text-link rounded-sm">
          {title}
        </a>
      </h2>
      <div className="text-fg-muted flex flex-col gap-3 text-[0.9375rem] leading-relaxed [&_a]:text-link [&_a]:underline-offset-4 [&_a:hover]:underline [&_li]:ms-5 [&_strong]:text-fg [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:space-y-1.5">
        {children}
      </div>
    </section>
  );
}
