import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ToolIcon } from "@/components/site/tool-icon";
import { getToolGroups } from "@/lib/tools-metadata";

/**
 * Le registre des outils : une ligne par outil, rangés par catégorie.
 *
 * Une liste plutôt qu'une grille de cartes identiques : une carte promet un objet
 * autonome, alors qu'on vient ici comparer des noms pour en choisir un, et une
 * liste se parcourt d'un seul coup d'œil. Rendu côté serveur, sans filtre à
 * manipuler : les douze outils tiennent à l'écran et chaque lien est dans le HTML.
 */
export function ToolRegistry({
  headingLevel = "h3",
}: {
  /** Le niveau des titres de catégorie, selon la page qui accueille le registre. */
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;

  return (
    <div className="divide-border border-border divide-y border-y">
      {getToolGroups().map(({ category, items }) => (
        <section
          key={category}
          aria-label={category}
          className="grid gap-x-10 gap-y-3 py-7 md:grid-cols-[9rem_minmax(0,1fr)]"
        >
          <Heading className="text-fg text-[0.9375rem] font-semibold tracking-tight md:sticky md:top-24 md:self-start md:pt-3">
            {category}
          </Heading>

          <ul className="grid min-w-0 gap-x-8 gap-y-1 lg:grid-cols-2">
            {items.map((tool) => (
              <li key={tool.id} className="min-w-0">
                <Link
                  href={tool.route}
                  className="group hover:bg-surface -mx-2.5 flex min-h-[4.25rem] items-center gap-3.5 rounded-lg px-2.5 py-2.5 transition-colors duration-(--animate-duration-fast)"
                >
                  <ToolIcon icon={tool.icon} />
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-fg text-sm font-semibold">
                      {tool.name}
                    </span>
                    <span className="text-fg-muted text-[0.8125rem] leading-snug">
                      {tool.description}
                    </span>
                  </span>
                  <ArrowRight
                    size={15}
                    aria-hidden="true"
                    className="text-fg-subtle -translate-x-1 shrink-0 opacity-0 transition-[opacity,translate] duration-(--animate-duration-fast) ease-(--ease-rise) group-hover:translate-x-0 group-hover:opacity-100 max-sm:hidden"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
