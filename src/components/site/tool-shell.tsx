"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  Info,
  LayoutGrid,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";
import { JustToolsLockup, JustToolsMark } from "@/components/brand/just-tools-lockup";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { ToolIcon } from "@/components/site/tool-icon";
import { ToolSearchButton, useToolSearch } from "@/components/site/tool-search";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getToolGroups,
  getToolMetadataByPathname,
} from "@/lib/tools-metadata";
import { RAIL_KEY } from "@/lib/tool-rail";

function ToolNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Outils" className="flex flex-col gap-4">
      {getToolGroups().map(({ category, items }) => (
        <div key={category} className="flex flex-col gap-0.5">
          <p className="text-fg-subtle mb-0.5 px-3 text-xs font-medium in-data-[rail=collapsed]:lg:hidden">
            {category}
          </p>
          {items.map((tool) => {
            const active = pathname === tool.route;
            return (
              <Link
                key={tool.id}
                href={tool.route}
                title={tool.name}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "pointer-coarse:min-h-11 flex min-h-9 items-center gap-3 rounded-md px-3 py-1 text-sm transition-colors duration-(--animate-duration-fast) [&_svg]:size-4 [&_svg]:shrink-0",
                  "in-data-[rail=collapsed]:lg:justify-center in-data-[rail=collapsed]:lg:px-0",
                  active
                    ? "bg-primary-soft text-primary-soft-fg font-medium"
                    : "text-fg-muted hover:bg-bg hover:text-fg"
                )}
              >
                {tool.icon}
                <span className="min-w-0 truncate in-data-[rail=collapsed]:lg:sr-only">
                  {tool.shortName ?? tool.name}
                </span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function setRail(collapsed: boolean) {
  const root = document.documentElement;
  if (collapsed) root.dataset.rail = "collapsed";
  else delete root.dataset.rail;
  try {
    localStorage.setItem(RAIL_KEY, collapsed ? "collapsed" : "expanded");
  } catch {
    // Stockage indisponible : le réglage vaut pour cette page, c'est suffisant.
  }
}

/**
 * Le rail : tous les outils, à un clic, depuis n'importe lequel.
 *
 * Collé au bord de la fenêtre, comme la console d'Ascencia ID : c'est une barre
 * latérale, pas un élément de page. Il se réduit à ses icônes pour rendre la place
 * aux éditeurs plein écran, et ce réglage suit l'utilisateur d'un outil à l'autre.
 */
function ToolRail() {
  const openSearch = useToolSearch();

  return (
    <aside className="border-border bg-surface sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-e transition-[width] duration-(--animate-duration-step) ease-(--ease-rise) in-data-[rail=collapsed]:w-16 lg:flex">
      <div className="border-border flex h-16 shrink-0 items-center gap-2 border-b px-4 in-data-[rail=collapsed]:justify-center in-data-[rail=collapsed]:px-0">
        <Link
          href="/"
          aria-label="Just Tools, accueil"
          className="min-w-0 flex-1 rounded-sm in-data-[rail=collapsed]:hidden"
        >
          <JustToolsLockup size={26} />
        </Link>
        <Link
          href="/"
          aria-label="Just Tools, accueil"
          className="hidden rounded-sm in-data-[rail=collapsed]:block"
        >
          <JustToolsMark size={26} title="" />
        </Link>
      </div>

      <div className="border-border border-b p-3 in-data-[rail=collapsed]:hidden">
        <ToolSearchButton />
      </div>
      <button
        type="button"
        onClick={openSearch}
        aria-label="Chercher un outil"
        title="Chercher un outil"
        className="border-border text-fg-muted hover:text-fg hidden h-12 shrink-0 cursor-pointer items-center justify-center border-b in-data-[rail=collapsed]:flex"
      >
        <LayoutGrid size={16} aria-hidden="true" />
      </button>

      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-3 in-data-[rail=collapsed]:px-2">
        <ToolNav />
      </div>

      <div className="border-border flex items-center justify-between gap-2 border-t p-3 in-data-[rail=collapsed]:justify-center">
        <ThemeToggle className="in-data-[rail=collapsed]:hidden" />
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Réduire la liste des outils"
          title="Réduire la liste des outils"
          className="in-data-[rail=collapsed]:hidden"
          onClick={() => setRail(true)}
        >
          <PanelLeftClose aria-hidden="true" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Déployer la liste des outils"
          title="Déployer la liste des outils"
          className="hidden in-data-[rail=collapsed]:inline-flex"
          onClick={() => setRail(false)}
        >
          <PanelLeftOpen aria-hidden="true" />
        </Button>
      </div>
    </aside>
  );
}

/** La navigation sous 1024 px : un `<details>` natif, comme l'en-tête du site. */
function MobileToolMenu() {
  const menu = useRef<HTMLDetailsElement>(null);

  return (
    <details
      ref={menu}
      className="group lg:hidden"
      onClick={(event) => {
        if ((event.target as HTMLElement).closest("a") && menu.current) {
          menu.current.open = false;
        }
      }}
    >
      <summary
        aria-label="Tous les outils"
        className="text-fg-muted hover:bg-surface hover:text-fg rounded-field flex size-11 cursor-pointer list-none items-center justify-center [&::-webkit-details-marker]:hidden"
      >
        <Menu size={18} className="group-open:hidden" aria-hidden="true" />
        <X size={18} className="hidden group-open:block" aria-hidden="true" />
      </summary>
      <div className="border-border bg-elevated shadow-pop asc-animate-step-in absolute inset-x-0 top-full z-(--z-overlay) flex max-h-[calc(100dvh-4rem)] flex-col gap-4 overflow-y-auto border-b p-4">
        <ToolSearchButton />
        <ToolNav />
        <div className="border-border flex items-center justify-between gap-3 border-t pt-3">
          <Link
            href="/"
            className="text-fg-muted hover:text-fg rounded-sm text-sm font-medium"
          >
            Accueil
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </details>
  );
}

/**
 * L'en-tête d'un outil. Sa fiche est dans un `<details>` natif : présente dans le
 * HTML servi, lisible sans JavaScript, et repliée pour laisser la place à l'outil.
 */
function ToolHeader() {
  const pathname = usePathname();
  const tool = getToolMetadataByPathname(pathname);
  const about = useRef<HTMLDetailsElement>(null);

  // La fiche se referme quand on change d'outil : elle ne décrit plus la page.
  useEffect(() => {
    if (about.current) about.current.open = false;
  }, [pathname]);

  return (
    <header className="border-border bg-bg/80 sticky top-0 z-(--z-sticky) flex h-16 shrink-0 items-center gap-3 border-b px-3 backdrop-blur-md sm:px-5 lg:px-6">
      <MobileToolMenu />

      <Link
        href="/tools"
        aria-label="Tous les outils"
        className="text-fg-muted hover:bg-surface hover:text-fg rounded-field flex size-11 shrink-0 items-center justify-center max-lg:hidden"
      >
        <ArrowLeft size={16} aria-hidden="true" />
      </Link>

      {tool ? (
        <>
          <ToolIcon icon={tool.icon} className="max-sm:hidden" />
          <div className="flex min-w-0 flex-1 flex-col">
            <h1 className="text-fg truncate text-base leading-snug font-semibold tracking-tight">
              {tool.name}
            </h1>
            <p className="text-fg-muted truncate text-[0.8125rem] leading-snug max-sm:hidden">
              {tool.description}
            </p>
          </div>

          <details ref={about} className="group shrink-0">
            <summary
              aria-label={`À propos de ${tool.name}`}
              title="À propos de cet outil"
              className="text-fg-muted hover:bg-surface hover:text-fg group-open:bg-surface group-open:text-fg rounded-field flex size-11 cursor-pointer list-none items-center justify-center [&::-webkit-details-marker]:hidden"
            >
              <Info size={16} aria-hidden="true" />
            </summary>
            <div className="border-border bg-elevated shadow-pop asc-animate-step-in rounded-card absolute top-[calc(100%+0.5rem)] right-3 z-(--z-overlay) w-[min(26rem,calc(100vw-1.5rem))] border p-5 sm:right-5 lg:right-6">
              <h2 className="text-fg mb-2 text-sm font-semibold tracking-tight">
                À propos de cet outil
              </h2>
              <p className="text-fg-muted text-sm leading-relaxed">
                {tool.about}
              </p>
            </div>
          </details>
        </>
      ) : (
        <h1 className="text-fg min-w-0 flex-1 truncate text-base font-semibold tracking-tight">
          Outils
        </h1>
      )}
    </header>
  );
}

/**
 * La coquille des outils, sur le modèle de `ConsoleShell` d'Ascencia ID : le rail
 * se colle au bord de la fenêtre, et rien n'y contraint la largeur. C'est le
 * contenu qui décide de la sienne (`ToolPage`).
 *
 * `fullscreen` donne à l'outil la hauteur exacte de la fenêtre, pour les éditeurs
 * qui gèrent leurs propres zones de défilement ; sinon la page défile normalement.
 */
export function ToolShell({
  children,
  fullscreen = false,
}: {
  children: ReactNode;
  fullscreen?: boolean;
}) {
  return (
    <div className={cn("flex w-full", fullscreen ? "h-dvh" : "min-h-dvh")}>
      <a
        href="#contenu"
        className="focus:bg-elevated focus:text-fg focus:shadow-pop focus:rounded-field sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-(--z-toast) focus:px-4 focus:py-2.5 focus:text-sm"
      >
        Aller au contenu principal
      </a>
      <ToolRail />
      <div className="relative flex min-w-0 flex-1 flex-col">
        <ToolHeader />
        <main
          id="contenu"
          className={cn("min-w-0 flex-1", fullscreen && "min-h-0 overflow-hidden")}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

/**
 * La largeur et le rythme d'un outil à page défilante. Aligné à gauche, comme la
 * console : le regard part du rail et doit tomber sur le contenu, pas le chercher
 * au centre.
 */
export function ToolPage({
  children,
  className,
  wide = false,
}: {
  children: ReactNode;
  className?: string;
  /** Pour les outils qui exploitent toute la largeur : canevas, comparaisons. */
  wide?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-6 px-4 py-6 sm:px-5 lg:px-8 lg:py-8",
        wide ? "max-w-[100rem]" : "max-w-5xl",
        className
      )}
    >
      {children}
    </div>
  );
}
