"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Zap,
  Sparkles,
  CheckCircle,
  Github,
} from "lucide-react";
import { tools, categories } from "@/lib/tools-metadata";
import { PROJECT_CONFIG } from "@/lib/constants";
import { ContributionModal } from "@/components/contribution-modal";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";

const features = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Rapide & Efficace",
    description:
      "Outils optimisés pour une productivité maximale, directement dans votre navigateur.",
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: "Interface Moderne",
    description:
      "Design épuré et intuitif pour une expérience fluide sur tous les appareils.",
  },
  {
    icon: <CheckCircle className="w-6 h-6" />,
    title: "Gratuit & Open Source",
    description:
      "Accès libre à tous les outils, sans limitation ni inscription requise.",
  },
];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [mounted, setMounted] = useState(false);
  const [showContributionModal, setShowContributionModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredTools =
    selectedCategory === "Tous"
      ? tools
      : tools.filter((tool) => tool.category === selectedCategory);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Badge
                variant="secondary"
                className="text-sm font-medium px-3 py-1"
              >
                {tools.length} outils disponibles
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
                Les outils dont
                <br />
                les devs ont besoin.
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                Une collection d'outils de développement gratuits et
                open source pour simplifier votre workflow quotidien.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  className="text-base px-6"
                  onClick={() => {
                    document
                      .getElementById("tools")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Découvrir les outils
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base px-6"
                  asChild
                >
                  <Link
                    href={PROJECT_CONFIG.project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="w-4 h-4 mr-2" />
                    Code source
                  </Link>
                </Button>
              </div>
            </div>
            <div className="hidden lg:block relative">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border shadow-sm">
                <Image
                  src="/assets/images/hero-workspace.jpg"
                  alt="Developer workspace"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
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
      <section id="tools" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Outils disponibles
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Découvrez notre collection d'outils essentiels pour votre
                développement
              </p>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap justify-center gap-2 mb-12">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={
                    selectedCategory === category ? "default" : "ghost"
                  }
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="rounded-full"
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map((tool) => (
                <Link
                  key={tool.id}
                  href={`/tools/${tool.id}`}
                  className="group block border border-border bg-card rounded-xl p-6 transition-shadow duration-200 hover:shadow-md"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-10 h-10 rounded-lg ${tool.iconBg} ${tool.iconColor} flex items-center justify-center`}
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
                    <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center py-20 space-y-6">
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
                <ArrowRight className="w-4 h-4 ml-2" />
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
