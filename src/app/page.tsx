import Link from "next/link";
import { ArrowRight, Github } from "lucide-react";
import { JustToolsMark } from "@/components/brand/just-tools-lockup";
import { OtherProjects } from "@/components/other-projects";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import { ContributeButton } from "@/components/site/contribute-button";
import { SiteShell } from "@/components/site/site-shell";
import { ToolRegistry } from "@/components/site/tool-registry";
import { Button } from "@/components/ui/button";
import { PROJECT_CONFIG } from "@/lib/constants";
import { tools } from "@/lib/tools-metadata";

const PRINCIPLES = [
  {
    title: "Rien à installer, rien à créer",
    text: "Pas de compte ni d'abonnement. Tu ouvres la page et l'outil est là, sur ton ordinateur comme sur ton téléphone.",
  },
  {
    title: "Tes fichiers restent chez toi",
    text: "Ce que tu écris ou importes depuis ton appareil est traité dans ton navigateur. Le réseau n'entre en jeu que pour une image importée par son adresse ou une traduction que tu demandes.",
  },
  {
    title: "Ouvert, et installable",
    text: "Le code est public sous licence MIT. Le site s'installe comme une application, pour retrouver tes outils en un clic.",
  },
];

/**
 * L'accueil. Un établi plutôt qu'une vitrine : les outils arrivent dès le premier
 * écran, parce que c'est pour eux qu'on vient.
 *
 * La page entière est rendue côté serveur : le titre, le registre et chaque lien
 * sont dans le HTML, pour un moteur de recherche comme pour un agent.
 *
 * Le mouvement se limite à l'arrivée : les courbes de niveau apparaissent, la
 * braise monte, le texte suit. Un seul moment, puis plus rien ne bouge.
 */
export default function Home() {
  return (
    <SiteShell>
      <main id="contenu" className="flex-1">
        <section className="asc-summit jt-summit relative overflow-hidden px-5 pt-16 pb-20 md:pt-24 md:pb-28 lg:px-8">
          <span aria-hidden="true" className="asc-ember-glow jt-glow" />

          <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
            <div className="jt-rise">
              <JustToolsMark size={64} title="" />
            </div>

            <h1
              className="jt-rise text-fg text-[clamp(2.375rem,6.4vw,3.875rem)] leading-[1.04] font-bold tracking-[-0.04em] text-balance"
              style={{ "--jt-step": 1 } as React.CSSProperties}
            >
              Les outils dont les devs ont besoin
            </h1>

            <p
              className="jt-rise text-fg-muted max-w-[46ch] text-[clamp(1rem,2vw,1.1875rem)] leading-relaxed text-pretty"
              style={{ "--jt-step": 2 } as React.CSSProperties}
            >
              {tools.length} outils qui tournent dans ton navigateur&nbsp;:
              gratuits, sans compte et open source.
            </p>

            <div
              className="jt-rise flex flex-col items-center gap-3 pt-1 sm:flex-row"
              style={{ "--jt-step": 3 } as React.CSSProperties}
            >
              <Button asChild size="lg" className="min-w-52">
                <a href="#outils">
                  Parcourir les outils
                  <ArrowRight aria-hidden="true" />
                </a>
              </Button>
              <Button asChild size="lg" variant="ghost">
                <a
                  href={PROJECT_CONFIG.project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github aria-hidden="true" />
                  Code source
                </a>
              </Button>
            </div>
          </div>
        </section>

        <section
          id="outils"
          aria-labelledby="outils-titre"
          className="mx-auto w-full max-w-6xl scroll-mt-20 px-5 py-14 md:py-16 lg:px-8"
        >
          <h2
            id="outils-titre"
            className="text-fg mb-8 text-2xl font-bold tracking-[-0.03em] md:text-3xl"
          >
            Tous les outils
          </h2>
          <ToolRegistry />
        </section>

        <section
          aria-labelledby="principes-titre"
          className="mx-auto w-full max-w-6xl px-5 pb-16 lg:px-8"
        >
          <h2
            id="principes-titre"
            className="text-fg mb-8 text-2xl font-bold tracking-[-0.03em] md:text-3xl"
          >
            Comment c&apos;est fait
          </h2>
          <div className="grid gap-x-10 gap-y-8 md:grid-cols-3">
            {PRINCIPLES.map((principle) => (
              <div key={principle.title}>
                <h3 className="text-fg mb-2 text-[0.9375rem] font-semibold tracking-tight">
                  {principle.title}
                </h3>
                <p className="text-fg-muted text-sm leading-relaxed">
                  {principle.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <OtherProjects />

        <section
          aria-labelledby="contribuer-titre"
          className="border-border bg-surface asc-contours-tight border-t py-14"
        >
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-10 gap-y-5 px-5 lg:px-8">
            <div className="max-w-xl">
              <h2
                id="contribuer-titre"
                className="text-fg mb-2 text-2xl font-bold tracking-[-0.03em]"
              >
                Il te manque un outil&nbsp;?
              </h2>
              <p className="text-fg-muted text-[0.9375rem] leading-relaxed">
                Signale un problème, propose une idée ou écris le code toi-même.
                Tout se passe en public, sur GitHub.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <ContributeButton>Contribuer</ContributeButton>
              <Button asChild variant="secondary">
                <Link href="/contact">Nous écrire</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <PWAInstallPrompt />
    </SiteShell>
  );
}
