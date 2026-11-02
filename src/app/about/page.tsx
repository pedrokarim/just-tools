import { Metadata } from "next";
import Link from "next/link";
import { Github, Globe, Mail } from "lucide-react";
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
            abonnement, ni limite d&apos;usage, ni publicité. Just Tools est
            édité par {PROJECT_CONFIG.company.name} et ne vend rien.
          </p>
        </ReadingSection>

        <ReadingSection id="traitement" title="Où tournent les outils">
          <p>
            Dans ton navigateur&nbsp;: ce que tu écris ou importes depuis ton
            appareil y est traité, et n&apos;est pas envoyé à nos serveurs. Il y
            a quatre cas où le réseau entre en jeu&nbsp;:
          </p>
          <ul>
            <li>
              <strong>Import par adresse&nbsp;:</strong> notre serveur va
              chercher l&apos;image pour toi, car les navigateurs bloquent
              souvent cet accès direct. Il ne l&apos;enregistre pas.
            </li>
            <li>
              <strong>Traduction de la synthèse vocale&nbsp;:</strong> ton texte
              part chez LibreTranslate ou MyMemory, seulement quand tu demandes
              une traduction.
            </li>
            <li>
              <strong>Suppression de fond et lecture du texte d&apos;une
              image&nbsp;:</strong> le navigateur télécharge d&apos;abord un
              modèle depuis un service tiers (IMG.LY, jsDelivr). Ton image, elle,
              ne quitte pas ton appareil.
            </li>
            <li>
              <strong>Générateur d&apos;artefacts&nbsp;:</strong> les sets
              viennent de notre base de données, le tirage se fait dans ton
              navigateur.
            </li>
          </ul>
          <p>
            Le site mesure aussi sa fréquentation, sans le contenu que tu
            traites&nbsp;: le détail est dans la{" "}
            <Link href="/legal/privacy">politique de confidentialité</Link>.
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
                href={PROJECT_CONFIG.project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="!text-fg !no-underline"
              >
                <Github aria-hidden="true" />
                Code source
              </a>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/contact" className="!text-fg !no-underline">
                <Mail aria-hidden="true" />
                Contact
              </Link>
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
