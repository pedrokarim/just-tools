import { Metadata } from "next";
import Image from "next/image";
import {
  Github,
  Globe,
  Heart,
  Code,
  Users,
  Zap,
  Shield,
  Star,
} from "lucide-react";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "À Propos - Just Tools",
  description:
    "Découvrez l'histoire et la mission de Just Tools - Suite d'outils de développement gratuits créée par Ahmed Karim pour Ascencia",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-6xl pt-24">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <Image
              src="/assets/images/icon-512.png"
              alt="Just Tools Logo"
              width={120}
              height={120}
              className="rounded-2xl"
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            À Propos de Just Tools
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Une suite d'outils de développement gratuits créée avec passion pour
            simplifier le quotidien des développeurs et améliorer leur
            productivité.
          </p>
        </div>

        {/* Mission Section */}
        <div className="border border-border bg-card rounded-xl p-8 mb-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Notre Mission
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Just Tools est né d'une vision simple : créer une collection
                d'outils pratiques, gratuits et accessibles à tous les
                développeurs, quel que soit leur niveau d'expérience.
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                Nous croyons que la productivité ne devrait pas être limitée par
                des barrières financières ou techniques. C'est pourquoi nous
                développons des outils modernes, intuitifs et performants.
              </p>
              <div className="flex items-center text-primary">
                <Heart className="w-5 h-5 mr-2" />
                <span className="font-medium">
                  Développé avec passion pour la communauté
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-secondary p-6 rounded-lg text-center">
                <Zap className="w-8 h-8 text-foreground mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Rapide</h3>
                <p className="text-sm text-muted-foreground">
                  Performance optimisée
                </p>
              </div>
              <div className="bg-secondary p-6 rounded-lg text-center">
                <Shield className="w-8 h-8 text-foreground mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Sécurisé</h3>
                <p className="text-sm text-muted-foreground">Données locales</p>
              </div>
              <div className="bg-secondary p-6 rounded-lg text-center">
                <Code className="w-8 h-8 text-foreground mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Moderne</h3>
                <p className="text-sm text-muted-foreground">
                  Technologies récentes
                </p>
              </div>
              <div className="bg-secondary p-6 rounded-lg text-center">
                <Users className="w-8 h-8 text-foreground mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-2">
                  Communautaire
                </h3>
                <p className="text-sm text-muted-foreground">Open source</p>
              </div>
            </div>
          </div>
        </div>

        {/* Creator Section */}
        <div className="border border-border bg-card rounded-xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            Le Créateur
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Ahmed Karim (PedroKarim)
              </h3>
              <p className="text-lg text-muted-foreground mb-6">
                Développeur passionné et entrepreneur, Ahmed Karim a créé Just
                Tools pour répondre aux besoins quotidiens de la communauté des
                développeurs. Avec une expertise en développement web moderne et
                une vision centrée sur l'expérience utilisateur, il s'efforce de
                créer des outils qui font vraiment la différence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <a
                  href="https://ascencia.re"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Globe className="w-5 h-5 mr-2" />
                  Ascencia
                </a>
                <a
                  href="https://github.com/pedrokarim"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center px-6 py-3 border border-border text-foreground rounded-lg hover:bg-secondary transition-colors"
                >
                  <Github className="w-5 h-5 mr-2" />
                  GitHub
                </a>
              </div>
            </div>
            <div className="bg-secondary p-8 rounded-xl">
              <h4 className="text-xl font-semibold text-foreground mb-4">
                Compétences & Technologies
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {[
                  "Next.js 15",
                  "TypeScript",
                  "React 19",
                  "Tailwind CSS",
                  "Node.js",
                  "PostgreSQL",
                ].map((tech) => (
                  <div key={tech} className="flex items-center">
                    <Star className="w-4 h-4 text-muted-foreground mr-2" />
                    <span className="text-muted-foreground">{tech}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="border border-border bg-card rounded-xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            Just Tools en Chiffres
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground mb-2">10</div>
              <div className="text-muted-foreground">Outils Disponibles</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground mb-2">
                100%
              </div>
              <div className="text-muted-foreground">Gratuit</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground mb-2">MIT</div>
              <div className="text-muted-foreground">Licence Open Source</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground mb-2">
                24/7
              </div>
              <div className="text-muted-foreground">Disponible</div>
            </div>
          </div>
        </div>

        {/* Technologies Section */}
        <div className="border border-border bg-card rounded-xl p-8">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            Technologies Utilisées
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Frontend
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>Next.js 15 avec App Router</li>
                <li>React 19 et TypeScript</li>
                <li>Tailwind CSS 4</li>
                <li>shadcn/ui pour les composants</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Backend & Outils
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>API Routes Next.js</li>
                <li>Service Worker pour PWA</li>
                <li>Jotai & Zustand pour l'état</li>
                <li>Lucide React pour les icônes</li>
                <li>Sonner pour les notifications</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
