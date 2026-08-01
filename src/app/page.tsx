"use client";

import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Zap,
  Sparkles,
  CheckCircle,
  Github } from "lucide-react";
import { tools } from "@/lib/tools-metadata";
import { PROJECT_CONFIG } from "@/lib/constants";
import { ContributionModal } from "@/components/contribution-modal";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import { OtherProjects } from "@/components/other-projects";
import {
  ToolsSection,
  ToolsSectionFallback } from "@/components/tools-section";

const features = [
  {
    icon: <Zap className="w-6 h-6" aria-hidden="true" />,
    title: "Rapide & Efficace",
    description:
      "Outils optimisés pour une productivité maximale, directement dans votre navigateur.",
  },
  {
    icon: <Sparkles className="w-6 h-6" aria-hidden="true" />,
    title: "Interface Moderne",
    description:
      "Design épuré et intuitif pour une expérience fluide sur tous les appareils.",
  },
  {
    icon: <CheckCircle className="w-6 h-6" aria-hidden="true" />,
    title: "Gratuit & Open Source",
    description:
      "Accès libre à tous les outils, sans limitation ni inscription requise.",
  },
];

export default function Home() {
  const [showContributionModal, setShowContributionModal] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-foreground focus:ring-[3px] focus:ring-ring/50"
      >
        Aller au contenu principal
      </a>

      <Navbar />

      <main id="contenu">
        {/* Hero Section - Squarespace style dark hero */}
        <section className="relative min-h-[90vh] flex items-center bg-[#0a0a0f] overflow-hidden">
          {/* Hero image - right side, overflow */}
          <div className="absolute right-0 top-0 bottom-0 w-[55%] hidden lg:block">
            <Image
              src="/assets/images/hero-workspace.jpg"
              alt="Developer workspace"
              fill
              className="object-cover object-center"
              priority
            />
            {/* Gradient overlay from left to blend with dark bg */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f] via-[#0a0a0f]/60 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative z-10 container mx-auto px-4 lg:px-8">
            <div className="max-w-2xl pt-24 pb-20 lg:py-0">
              <p className="text-white/50 text-sm font-medium tracking-widest uppercase mb-8">
                {tools.length} outils gratuits & open source
              </p>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-[1.05] tracking-tight mb-8">
                Les outils
                <br />
                dont les devs
                <br />
                ont besoin.
              </h1>
              <p className="text-lg lg:text-xl text-white/60 max-w-lg leading-relaxed mb-10">
                Une collection d'outils de développement pour simplifier
                votre workflow quotidien.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-white text-black hover:bg-white/90 text-base px-8 h-12 font-medium"
                  asChild
                >
                  <a href="#tools">
                    Découvrir les outils
                    <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
                  </a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white text-base px-8 h-12 font-medium"
                  asChild
                >
                  <Link
                    href={PROJECT_CONFIG.project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="w-4 h-4 mr-2" aria-hidden="true" />
                    Code source
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-16">
              {features.map((feature, index) => (
                <div key={index} className="space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center text-foreground">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tools Section */}
        <section id="tools" className="py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center space-y-4 mb-14">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                  Outils disponibles
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Découvrez notre collection d'outils essentiels pour votre
                  développement
                </p>
              </div>

              <Suspense fallback={<ToolsSectionFallback />}>
                <ToolsSection />
              </Suspense>
            </div>
          </div>
        </section>

        {/* Community Section */}
        <section className="border-t border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center py-24 space-y-6">
              <h2 className="text-3xl font-bold text-foreground">
                Rejoignez la communauté
              </h2>
              <p className="text-lg text-muted-foreground">
                Contribuez au projet open source et partagez vos idées pour
                améliorer Just Tools.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  size="lg"
                  className="text-base"
                  onClick={() => setShowContributionModal(true)}
                >
                  Contribuer
                  <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base"
                  asChild
                >
                  <Link
                    href={PROJECT_CONFIG.project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Voir le code source
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Other Projects Section */}
        <OtherProjects />
      </main>

      {/* Footer */}
      <footer className="bg-background border-t border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Image
                  src="/assets/images/icon-origin.png"
                  alt="Just Tools Logo"
                  width={32}
                  height={32}
                />
                <span className="text-lg font-bold text-foreground">
                  {PROJECT_CONFIG.name}
                </span>
              </div>
              <p className="text-muted-foreground text-sm">
                Développé par {PROJECT_CONFIG.creator.alias}
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <Link
                href="/about"
                className="text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                À Propos
              </Link>
              <Link
                href="/legal/terms"
                className="text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                Conditions d'Utilisation
              </Link>
              <Link
                href="/legal/privacy"
                className="text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                Politique de Confidentialité
              </Link>
              <Link
                href={PROJECT_CONFIG.project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                Code Source
              </Link>
              <Link
                href={PROJECT_CONFIG.company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                {PROJECT_CONFIG.company.name}
              </Link>
            </div>

            <div className="border-t border-border pt-6 text-center">
              <p className="text-muted-foreground text-sm">
                &copy; {PROJECT_CONFIG.dates.copyrightYear}{" "}
                {PROJECT_CONFIG.legal.developerName} -{" "}
                {PROJECT_CONFIG.legal.companyName}. Tous droits réservés.
              </p>
              <p className="text-muted-foreground text-xs mt-2">
                {PROJECT_CONFIG.name} est un projet open source sous licence{" "}
                {PROJECT_CONFIG.project.license}.
              </p>
              <p className="text-muted-foreground text-xs mt-2">
                <span translate="no">
                  v{PROJECT_CONFIG.version}
                  {process.env.NEXT_PUBLIC_BUILD_SHA
                    ? ` · ${process.env.NEXT_PUBLIC_BUILD_SHA}`
                    : ""}
                </span>
              </p>
            </div>
          </div>
        </div>
      </footer>

      <ContributionModal
        isOpen={showContributionModal}
        onClose={() => setShowContributionModal(false)}
      />

      <PWAInstallPrompt />
    </div>
  );
}
