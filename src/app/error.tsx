"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Une erreur de rendu. Sans en-tête ni pied : la coquille est peut-être justement
 * ce qui a échoué, et cet écran doit s'afficher quoi qu'il arrive.
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh items-center justify-center px-5 py-20">
      <div className="flex max-w-md flex-col items-center gap-5 text-center">
        <h1 className="text-fg text-3xl font-bold tracking-[-0.035em]">
          Quelque chose s&apos;est mal passé
        </h1>
        <p className="text-fg-muted leading-relaxed text-pretty">
          La page n&apos;a pas pu s&apos;afficher. Réessaie, et si le problème
          revient, signale-le depuis la page Contact.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-1">
          <Button onClick={reset}>
            <RefreshCw aria-hidden="true" />
            Réessayer
          </Button>
          <Button asChild variant="ghost">
            <Link href="/">Accueil</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
