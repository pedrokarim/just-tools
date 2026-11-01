import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { ECOSYSTEM_HUB, OTHER_PROJECTS } from "@/lib/other-projects";

/**
 * Les autres projets de l'écosystème.
 *
 * Même facture que le registre des outils : la section se lit comme une suite de
 * la page, pas comme un encart publicitaire greffé. Les logos sont hébergés par
 * chaque projet ; les domaines sont autorisés dans `next.config.ts`.
 */
export function OtherProjects() {
  return (
    <section
      id="autres-projets"
      aria-labelledby="autres-projets-titre"
      className="border-border border-t py-14 md:py-16"
    >
      <div className="mx-auto w-full max-w-6xl px-5 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-2">
          <h2
            id="autres-projets-titre"
            className="text-fg text-2xl font-bold tracking-[-0.03em] md:text-3xl"
          >
            Dans le même écosystème
          </h2>
          <a
            href={ECOSYSTEM_HUB.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-link inline-flex items-center gap-1 rounded-sm text-sm font-medium underline-offset-4 hover:underline"
          >
            {ECOSYSTEM_HUB.name}
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </div>

        <ul className="grid min-w-0 gap-x-8 gap-y-1 md:grid-cols-2 lg:grid-cols-3">
          {OTHER_PROJECTS.map((project) => (
            <li key={project.id} className="min-w-0">
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group hover:bg-surface -mx-2.5 flex items-start gap-3.5 rounded-lg px-2.5 py-3 transition-colors duration-(--animate-duration-fast)"
              >
                <span className="bg-surface border-border flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border">
                  {/* Demandé en 80 px pour un affichage à 40 : les écrans à
                      haute densité restent nets. */}
                  <Image
                    src={project.logo}
                    alt=""
                    width={80}
                    height={80}
                    loading="lazy"
                    className="size-10 object-contain"
                    unoptimized={project.logo.endsWith(".svg")}
                  />
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-fg flex items-center gap-1.5 text-sm font-semibold">
                    <span className="min-w-0 truncate">{project.name}</span>
                    <span className="text-fg-subtle shrink-0 text-xs font-normal">
                      {project.isNew ? "Nouveau" : project.tag}
                    </span>
                    <span className="sr-only">(nouvel onglet)</span>
                  </span>
                  <span className="text-fg-muted text-[0.8125rem] leading-snug">
                    {project.description}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
