import { Metadata } from "next";
import { SiteShell } from "@/components/site/site-shell";
import { ToolRegistry } from "@/components/site/tool-registry";
import { Button } from "@/components/ui/button";
import { PROJECT_CONFIG } from "@/lib/constants";
import { tools } from "@/lib/tools-metadata";

export const metadata: Metadata = {
  title: "Tous les outils",
  description: `Les ${tools.length} outils de développement de Just Tools : formateur de code, validateur JSON, générateur de mots de passe, palettes, synthèse vocale et plus, gratuits et sans compte.`,
  alternates: { canonical: "/tools" },
};

export default function ToolsPage() {
  return (
    <SiteShell>
      <main
        id="contenu"
        className="mx-auto w-full max-w-6xl flex-1 px-5 py-12 md:py-16 lg:px-8"
      >
        <header className="mb-10 flex flex-col gap-3">
          <h1 className="text-fg text-3xl leading-tight font-bold tracking-[-0.035em] md:text-4xl">
            Tous les outils
          </h1>
          <p className="text-fg-muted max-w-2xl text-lg leading-relaxed text-pretty">
            {tools.length} outils gratuits, qui tournent dans ton navigateur et
            ne demandent aucun compte.
          </p>
        </header>

        <ToolRegistry headingLevel="h2" />

        <div className="mt-10 flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
          <p className="text-fg-muted text-[0.9375rem]">
            Il te manque un outil&nbsp;? Propose-le sur GitHub.
          </p>
          <Button asChild variant="secondary">
            <a
              href={`${PROJECT_CONFIG.project.github}/issues`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Proposer un outil
            </a>
          </Button>
        </div>
      </main>
    </SiteShell>
  );
}
