"use client";

import { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { JustToolsLockup } from "@/components/brand/just-tools-lockup";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { ToolSearchButton } from "@/components/site/tool-search";
import { cn } from "@/lib/utils";
import { PROJECT_CONFIG } from "@/lib/constants";

const LINKS = [
  { href: "/tools", label: "Outils" },
  { href: "/about", label: "À propos" },
  { href: "/contact", label: "Contact" },
];

/**
 * L'en-tête des pages publiques, sur le modèle de `PublicShell` d'Ascencia ID.
 *
 * Le menu mobile est un `<details>` natif : il s'ouvre sans JavaScript, au clavier
 * comme au doigt, et le navigateur annonce son état. Le seul script le referme
 * quand on suit un de ses liens.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const menu = useRef<HTMLDetailsElement>(null);

  const linkClass = (href: string) =>
    cn(
      "hover:text-fg rounded-sm text-sm font-medium transition-colors duration-(--animate-duration-fast)",
      pathname.startsWith(href) ? "text-fg" : "text-fg-muted"
    );

  return (
    <header className="border-border bg-bg/80 sticky top-0 z-(--z-sticky) border-b backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-6 px-5 lg:px-8">
        <Link
          href="/"
          aria-label="Just Tools, accueil"
          className="rounded-sm"
        >
          <JustToolsLockup />
        </Link>

        <nav
          aria-label="Navigation principale"
          className="flex items-center gap-6 max-md:hidden"
        >
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass(link.href)}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ms-auto flex min-w-0 items-center gap-2.5">
          <ToolSearchButton className="w-56 max-lg:hidden" />
          <ThemeToggle className="max-md:hidden" />

          <details
            ref={menu}
            className="group md:hidden"
            onClick={(event) => {
              if ((event.target as HTMLElement).closest("a") && menu.current) {
                menu.current.open = false;
              }
            }}
          >
            <summary
              aria-label="Menu"
              className="text-fg-muted hover:bg-surface hover:text-fg rounded-field flex size-11 cursor-pointer list-none items-center justify-center [&::-webkit-details-marker]:hidden"
            >
              <Menu size={18} className="group-open:hidden" aria-hidden="true" />
              <X
                size={18}
                className="hidden group-open:block"
                aria-hidden="true"
              />
            </summary>
            <div className="border-border bg-elevated shadow-pop asc-animate-step-in absolute inset-x-0 top-full flex flex-col gap-3 border-b p-4">
              <ToolSearchButton />
              <nav aria-label="Navigation mobile" className="flex flex-col">
                {LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-fg hover:bg-surface flex min-h-11 items-center rounded-md px-3 text-sm font-medium"
                  >
                    {link.label}
                  </Link>
                ))}
                <a
                  href={PROJECT_CONFIG.project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-fg hover:bg-surface flex min-h-11 items-center rounded-md px-3 text-sm font-medium"
                >
                  Code source
                </a>
              </nav>
              <ThemeToggle className="self-start" />
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
