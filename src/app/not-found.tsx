import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/site/site-shell";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page introuvable",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <SiteShell>
      <main
        id="contenu"
        className="asc-summit relative flex flex-1 items-center justify-center overflow-hidden px-5 py-20"
      >
        <span aria-hidden="true" className="asc-ember-glow" />
        <div className="flex max-w-md flex-col items-center gap-5 text-center">
          <h1 className="text-fg text-3xl font-bold tracking-[-0.035em] md:text-4xl">
            Cette page n&apos;existe pas
          </h1>
          <p className="text-fg-muted leading-relaxed text-pretty">
            L&apos;adresse est peut-être incomplète, ou l&apos;outil a changé de
            nom. Tous les outils restent à un clic.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-1">
            <Button asChild>
              <Link href="/tools">Voir tous les outils</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/">Accueil</Link>
            </Button>
          </div>
        </div>
      </main>
    </SiteShell>
  );
}
