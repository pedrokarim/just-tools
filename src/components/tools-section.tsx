"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useQueryState, parseAsString } from "nuqs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { tools, categories, type ToolMetadata } from "@/lib/tools-metadata";

/**
 * Section « Outils disponibles » de l'accueil.
 *
 * Le filtre vit dans l'URL (`?categorie=`) pour rester partageable et suivre le
 * retour arrière du navigateur. nuqs s'appuyant sur `useSearchParams()`, Next
 * exige une frontière Suspense au-dessus, sans quoi la page entière bascule en
 * rendu client (`missing-suspense-with-csr-bailout`).
 *
 * D'où la découpe : `ToolsSectionFallback` est prérendu statiquement avec la
 * liste complète, donc tous les liens vers les outils sont dans le HTML servi —
 * ce qui compte pour le référencement. `ToolsSection` prend le relais à
 * l'hydratation et applique le filtre.
 */

function ToolsGrid({ items }: { items: ToolMetadata[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((tool) => (
        <Link
          key={tool.id}
          href={`/tools/${tool.id}`}
          className="group block border border-border bg-card rounded-xl p-6 transition-shadow duration-200 hover:shadow-md"
        >
          <div className="flex items-start justify-between mb-4">
            <div
              className={`w-10 h-10 rounded-lg ${tool.iconBg} ${tool.iconColor} flex items-center justify-center`}
              aria-hidden="true"
            >
              {tool.icon}
            </div>
            <Badge variant="secondary" className="text-xs">
              {tool.category}
            </Badge>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-200">
            {tool.name}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            {tool.description}
          </p>
          <span className="text-sm font-medium text-primary inline-flex items-center">
            Utiliser
            <ArrowRight
              className="w-3.5 h-3.5 ml-1 transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </span>
        </Link>
      ))}
    </div>
  );
}

function FilterBar({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect?: (category: string) => void;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-14">
      {categories.map((category) => (
        <Button
          key={category}
          variant={selected === category ? "default" : "ghost"}
          size="sm"
          aria-pressed={selected === category}
          onClick={onSelect ? () => onSelect(category) : undefined}
        >
          {category}
        </Button>
      ))}
    </div>
  );
}

/** Rendu statique : barre de filtres inerte et liste complète. */
export function ToolsSectionFallback() {
  return (
    <>
      <FilterBar selected="Tous" />
      <ToolsGrid items={tools} />
    </>
  );
}

export function ToolsSection() {
  const [selectedCategory, setSelectedCategory] = useQueryState(
    "categorie",
    parseAsString.withDefault("Tous")
  );

  const filteredTools =
    selectedCategory === "Tous"
      ? tools
      : tools.filter((tool) => tool.category === selectedCategory);

  return (
    <>
      <FilterBar
        selected={selectedCategory}
        // `null` retire le paramètre plutôt que d'écrire `?categorie=Tous`.
        onSelect={(category) =>
          setSelectedCategory(category === "Tous" ? null : category)
        }
      />
      <ToolsGrid items={filteredTools} />
    </>
  );
}
