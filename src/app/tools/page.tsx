import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { PROJECT_CONFIG } from "@/lib/constants";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Tous nos outils",
  description:
    "Découvrez notre collection complète d'outils de développement gratuits",
};

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12 pt-24 max-w-6xl">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            {PROJECT_CONFIG.name}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {PROJECT_CONFIG.description}
          </p>
          <div className="flex items-center justify-center space-x-8 pt-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">
                {PROJECT_CONFIG.tools.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Outils disponibles
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">100%</div>
              <div className="text-sm text-muted-foreground">Gratuits</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">24/7</div>
              <div className="text-sm text-muted-foreground">Disponible</div>
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROJECT_CONFIG.tools.map((tool) => (
            <Link
              key={tool.id}
              href={tool.route}
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

        {/* Footer CTA */}
        <div className="text-center mt-16">
          <div className="border border-border bg-card rounded-xl p-8">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Besoin d'un outil spécifique ?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Nous développons constamment de nouveaux outils. N'hésitez pas à
              nous faire part de vos suggestions.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link
                  href="https://github.com/pedrokarim/just-tools/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Proposer un outil
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">Retour à l'accueil</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
