import Link from "next/link";
import { AscenciaLockup } from "@/components/brand/ascencia-mark";
import { JustToolsLockup } from "@/components/brand/just-tools-lockup";
import { PROJECT_CONFIG } from "@/lib/constants";

const LINKS = [
  { href: "/tools", label: "Outils" },
  { href: "/about", label: "À propos" },
  { href: "/contact", label: "Contact" },
  { href: "/legal/privacy", label: "Confidentialité" },
  { href: "/legal/terms", label: "Conditions" },
];

const linkClass =
  "text-fg-muted hover:text-fg rounded-sm underline-offset-4 hover:underline";

/**
 * Le pied de page : le logo du site d'un côté, et sur la ligne de copyright celui
 * d'Ascencia ID, qui dit de qui il vient.
 */
export function SiteFooter() {
  return (
    <footer className="border-border bg-elevated/60 mt-auto border-t text-[0.8125rem]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-5 py-7 lg:px-8">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link href="/" aria-label="Just Tools, accueil" className="rounded-sm">
            <JustToolsLockup size={22} />
          </Link>

          <nav
            aria-label="Pied de page"
            className="flex flex-wrap items-center gap-x-5 gap-y-2 sm:ms-auto"
          >
            {LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={linkClass}>
                {link.label}
              </Link>
            ))}
            <a
              href={PROJECT_CONFIG.project.github}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              Code source
            </a>
          </nav>
        </div>

        <div className="border-border text-fg-muted flex flex-wrap items-center gap-x-4 gap-y-3 border-t pt-5">
          <a
            href={PROJECT_CONFIG.company.website}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Ascencia, le site"
            className="rounded-sm"
          >
            <AscenciaLockup />
          </a>
          <p>
            &copy;&nbsp;{PROJECT_CONFIG.dates.copyrightYear}{" "}
            {PROJECT_CONFIG.legal.developerName}, {PROJECT_CONFIG.legal.companyName}.
            Open source sous licence {PROJECT_CONFIG.project.license}.
          </p>
          <p translate="no" className="text-fg-subtle font-mono text-xs sm:ms-auto">
            v{PROJECT_CONFIG.version}
            {process.env.NEXT_PUBLIC_BUILD_SHA
              ? ` ${process.env.NEXT_PUBLIC_BUILD_SHA}`
              : ""}
          </p>
        </div>
      </div>
    </footer>
  );
}
