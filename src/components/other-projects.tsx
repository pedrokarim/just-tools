import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ECOSYSTEM_HUB, OTHER_PROJECTS } from "@/lib/other-projects";

/**
 * Section de promotion croisée des autres projets de l'écosystème.
 *
 * Reprend volontairement la facture des cartes d'outils de l'accueil (même
 * bordure, même rayon, même survol) : la section doit se lire comme une suite
 * naturelle de la page, pas comme un encart publicitaire greffé.
 *
 * Les logos sont hébergés par chaque projet ; les domaines sont autorisés dans
 * `next.config.ts` (`images.remotePatterns`).
 */
export function OtherProjects() {
  return (
    <section id="autres-projets" className="border-t border-border py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 space-y-4 text-center">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">
              Nos autres projets
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Just Tools fait partie d&apos;un ensemble plus large. Voici le
              reste de ce que nous construisons.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {OTHER_PROJECTS.map((project) => (
              <a
                key={project.id}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-xl border border-border bg-card p-6 transition-shadow duration-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-muted">
                    {/* Demandé en 80 px pour un affichage à 40 : les écrans à
                        haute densité restent nets. Le logo du Portfolio n'existe
                        qu'en 50 px à la source, il plafonne donc là. */}
                    <Image
                      src={project.logo}
                      alt={`Logo ${project.name}`}
                      width={80}
                      height={80}
                      className="h-10 w-10 object-contain"
                      unoptimized={project.logo.endsWith(".svg")}
                    />
                  </div>
                  <Badge
                    variant={project.isNew ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {project.isNew ? "Nouveau" : project.tag}
                  </Badge>
                </div>

                <h3 className="mb-2 flex items-center gap-1.5 text-lg font-semibold text-foreground transition-colors duration-200 group-hover:text-primary">
                  <span className="min-w-0 truncate">{project.name}</span>
                  <ExternalLink
                    className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span className="sr-only">(nouvel onglet)</span>
                </h3>

                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                  {project.description}
                </p>

                <span className="inline-flex items-center text-sm font-medium text-primary">
                  Découvrir
                  <ArrowUpRight
                    className="ml-1 h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </span>
              </a>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href={ECOSYSTEM_HUB.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              Tous nos projets sur {ECOSYSTEM_HUB.name}
              <ArrowUpRight className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
