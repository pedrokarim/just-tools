import { Metadata } from "next";
import { Github, Globe } from "lucide-react";
import { AscenciaLockup } from "@/components/brand/ascencia-mark";
import {
  ReadingColumn,
  ReadingSection,
  SiteShell,
} from "@/components/site/site-shell";
import { Button } from "@/components/ui/button";
import { PROJECT_CONFIG } from "@/lib/constants";
import { tools } from "@/lib/tools-metadata";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "L'histoire de Just Tools, suite d'outils de développement gratuits et open source créée par Ahmed Karim pour Ascencia, et les technologies qui la font tourner.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <SiteShell>
      <ReadingColumn
        title="À propos de Just Tools"
        lead={`${tools.length} outils de développement gratuits, créés pour simplifier le quotidien de celles et ceux qui écrivent du code.`}
      >
        <ReadingSection id="mission" title="Pourquoi Just Tools">
          <p>
            Just Tools est né d&apos;une idée simple&nbsp;: réunir au même
            endroit les petits outils dont on a besoin tous les jours, gratuits
            et accessibles à tous les développeurs, quel que soit leur niveau.
          </p>
          <p>
            La productivité ne devrait pas dépendre d&apos;une barrière
            financière ou technique. Il n&apos;y a donc ni compte à créer, ni
            abonnement, ni limite d&apos;usage, et tes fichiers sont traités
            dans ton navigateur plutôt que sur un serveur.
          </p>
        </ReadingSection>

        <ReadingSection id="createur" title="Qui est derrière">
          <p>
            Just Tools est créé par {PROJECT_CONFIG.creator.name} (
            {PROJECT_CONFIG.creator.alias}), développeur et entrepreneur, pour
            répondre aux besoins quotidiens de la communauté des développeurs.
            Le projet est open source sous licence{" "}
            {PROJECT_CONFIG.project.license}&nbsp;: tu peux lire le code, le
            réutiliser et y contribuer.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <Button asChild variant="secondary">
              <a
                href={PROJECT_CONFIG.creator.github}
                target="_blank"
                rel="noopener noreferrer"
                className="!text-fg !no-underline"
              >
                <Github aria-hidden="true" />
                GitHub
              </a>
            </Button>
            <Button asChild variant="secondary">
              <a
                href={PROJECT_CONFIG.company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="!text-fg !no-underline"
              >
                <Globe aria-hidden="true" />
                Ascencia
              </a>
            </Button>
          </div>
        </ReadingSection>

        <ReadingSection id="technologies" title="Comment c'est construit">
          <p>
            Le site repose sur Next.js 15, React 19 et TypeScript, avec Tailwind
            CSS 4 et des composants Radix. Il s&apos;installe comme une
            application grâce à son service worker, et les outils
            s&apos;exécutent côté navigateur.
          </p>
          <p>
            Son identité visuelle est celle d&apos;Ascencia ID&nbsp;: mêmes
            couleurs, mêmes typographies, mêmes règles d&apos;interface que le
            reste de l&apos;écosystème.
          </p>
        </ReadingSection>

        <section
          aria-label="Ascencia"
          className="border-border flex flex-wrap items-center gap-x-5 gap-y-3 border-t pt-8"
        >
          <a
            href={PROJECT_CONFIG.company.website}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Ascencia, le site"
            className="rounded-sm"
          >
            <AscenciaLockup size={26} />
          </a>
          <p className="text-fg-muted min-w-0 flex-1 basis-64 text-sm leading-relaxed">
            Just Tools est un projet de l&apos;écosystème Ascencia, aux côtés de
            ses autres services et de son compte unique.
          </p>
        </section>
      </ReadingColumn>
    </SiteShell>
  );
}
