import Link from "next/link";
import { AscenciaLockup } from "@/components/brand/ascencia-mark";
import { PROJECT_CONFIG } from "@/lib/constants";

/** La signature des pages légales : qui s'engage, et l'autre texte à consulter. */
export function LegalSignature({
  sibling,
}: {
  sibling: { href: string; label: string };
}) {
  return (
    <footer className="border-border flex flex-wrap items-center gap-x-6 gap-y-3 border-t pt-8">
      <a
        href={PROJECT_CONFIG.company.website}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Ascencia, le site"
        className="rounded-sm"
      >
        <AscenciaLockup size={26} />
      </a>
      <Link
        href={sibling.href}
        className="text-link rounded-sm text-sm font-medium underline-offset-4 hover:underline sm:ms-auto"
      >
        {sibling.label}
      </Link>
    </footer>
  );
}
