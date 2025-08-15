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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-6xl pt-24">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <Image
                src="/assets/images/icon-512.png"
                alt="Just Tools Logo"
                width={120}
                height={120}
                className="rounded-2xl shadow-lg"
              />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            À Propos de{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Just Tools
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Une suite d'outils de développement gratuits créée avec passion pour
            simplifier le quotidien des développeurs et améliorer leur
            productivité.
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 mb-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Notre Mission
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                Just Tools est né d'une vision simple : créer une collection
                d'outils pratiques, gratuits et accessibles à tous les
                développeurs, quel que soit leur niveau d'expérience.
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                Nous croyons que la productivité ne devrait pas être limitée par
                des barrières financières ou techniques. C'est pourquoi nous
                développons des outils modernes, intuitifs et performants.
              </p>
              <div className="flex items-center text-blue-600 dark:text-blue-400">
                <Heart className="w-5 h-5 mr-2" />
                <span className="font-medium">
                  Développé avec passion pour la communauté
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-950/50 p-6 rounded-lg text-center">
                <Zap className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Rapide
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Performance optimisée
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-950/50 p-6 rounded-lg text-center">
                <Shield className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Sécurisé
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Données locales
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-950/50 p-6 rounded-lg text-center">
                <Code className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Moderne
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Technologies récentes
                </p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-950/50 p-6 rounded-lg text-center">
                <Users className="w-8 h-8 text-orange-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Communautaire
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Open source
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Créateur Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Le Créateur
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Ahmed Karim (PedroKarim)
              </h3>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
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
                  className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Globe className="w-5 h-5 mr-2" />
                  Ascencia
                </a>
                <a
                  href="https://github.com/pedrokarim"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Github className="w-5 h-5 mr-2" />
                  GitHub
                </a>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 p-8 rounded-xl">
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Compétences & Technologies
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Next.js 15
                  </span>
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">
                    TypeScript
                  </span>
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">
                    React 19
                  </span>
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Tailwind CSS
                  </span>
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Node.js
                  </span>
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">
                    PostgreSQL
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Just Tools en Chiffres
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">10</div>
              <div className="text-gray-600 dark:text-gray-400">
                Outils Disponibles
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">100%</div>
              <div className="text-gray-600 dark:text-gray-400">Gratuit</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">MIT</div>
              <div className="text-gray-600 dark:text-gray-400">
                Licence Open Source
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">
                24/7
              </div>
              <div className="text-gray-600 dark:text-gray-400">Disponible</div>
            </div>
          </div>
        </div>

        {/* Technologies Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Technologies Utilisées
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Frontend
              </h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li>• Next.js 15 avec App Router</li>
                <li>• React 19 et TypeScript</li>
                <li>• Tailwind CSS 4</li>
                <li>• shadcn/ui pour les composants</li>
                <li>• Framer Motion pour les animations</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Backend & Outils
              </h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li>• API Routes Next.js</li>
                <li>• Service Worker pour PWA</li>
                <li>• Jotai & Zustand pour l'état</li>
                <li>• Lucide React pour les icônes</li>
                <li>• Sonner pour les notifications</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
