"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";
import { FloatingParticles } from "@/components/floating-particles";
import { ScrollProgress } from "@/components/scroll-progress";
import { TypingEffect } from "@/components/typing-effect";
import { Confetti } from "@/components/confetti";
import { RippleButton } from "@/components/ripple-button";
import { GlowCard } from "@/components/glow-card";
import { ParallaxSection } from "@/components/parallax-section";
import { MagneticButton } from "@/components/magnetic-button";
import { TiltCard } from "@/components/tilt-card";
import { ShimmerCard } from "@/components/shimmer-card";
import { BounceIcon } from "@/components/bounce-icon";
import { WaveButton } from "@/components/wave-button";
import { GradientBorderCard } from "@/components/gradient-border-card";
import { FloatingElement } from "@/components/floating-element";
import { PulseElement } from "@/components/pulse-element";
import { SlideElement } from "@/components/slide-element";
import { ScaleElement } from "@/components/scale-element";
import { RotateElement } from "@/components/rotate-element";
import { FadeElement } from "@/components/fade-element";
import { BounceElement } from "@/components/bounce-element";
import { GlowElement } from "@/components/glow-element";
import { ShimmerElement } from "@/components/shimmer-element";
import { MorphingElement } from "@/components/morphing-element";
import { WobbleElement } from "@/components/wobble-element";
import Link from "next/link";
import {
  ArrowRight,
  Zap,
  Palette,
  Search,
  RefreshCw,
  Lock,
  FileText,
  Grid3X3,
  Star,
  Users,
  Code,
  Sparkles,
  CheckCircle,
  Play,
  Image,
} from "lucide-react";

interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  status: "coming-soon" | "in-progress" | "ready";
  icon: React.ReactNode;
  color: string;
  gradient: string;
}

const tools: Tool[] = [
  {
    id: "code-formatter",
    name: "Formateur de Code",
    description:
      "Formate automatiquement votre code dans différents langages avec une précision parfaite",
    category: "Développement",
    status: "ready",
    icon: <Code className="w-6 h-6" />,
    color: "from-blue-500 to-cyan-500",
    gradient: "bg-gradient-to-br from-blue-500 to-cyan-500",
  },
  {
    id: "color-palette",
    name: "Générateur de Palette",
    description:
      "Créez des palettes de couleurs harmonieuses pour vos projets créatifs",
    category: "Design",
    status: "ready",
    icon: <Palette className="w-6 h-6" />,
    color: "from-purple-500 to-pink-500",
    gradient: "bg-gradient-to-br from-purple-500 to-pink-500",
  },
  {
    id: "json-validator",
    name: "Validateur JSON",
    description:
      "Validez et formatez vos fichiers JSON avec une interface intuitive",
    category: "Développement",
    status: "ready",
    icon: <Search className="w-6 h-6" />,
    color: "from-green-500 to-emerald-500",
    gradient: "bg-gradient-to-br from-green-500 to-emerald-500",
  },
  {
    id: "base64-converter",
    name: "Convertisseur Base64",
    description: "Encodez et décodez du texte en Base64 instantanément",
    category: "Utilitaires",
    status: "ready",
    icon: <RefreshCw className="w-6 h-6" />,
    color: "from-orange-500 to-red-500",
    gradient: "bg-gradient-to-br from-orange-500 to-red-500",
  },
  {
    id: "password-generator",
    name: "Générateur de Mots de Passe",
    description: "Générez des mots de passe sécurisés et personnalisables",
    category: "Sécurité",
    status: "ready",
    icon: <Lock className="w-6 h-6" />,
    color: "from-indigo-500 to-purple-500",
    gradient: "bg-gradient-to-br from-indigo-500 to-purple-500",
  },
  {
    id: "markdown-editor",
    name: "Éditeur Markdown",
    description: "Éditez et prévisualisez du contenu Markdown en temps réel",
    category: "Édition",
    status: "ready",
    icon: <FileText className="w-6 h-6" />,
    color: "from-teal-500 to-cyan-500",
    gradient: "bg-gradient-to-br from-teal-500 to-cyan-500",
  },
  {
    id: "pattern-editor",
    name: "Éditeur de Motifs",
    description:
      "Créez des motifs répétitifs avec une grille interactive avancée",
    category: "Design",
    status: "ready",
    icon: <Grid3X3 className="w-6 h-6" />,
    color: "from-rose-500 to-pink-500",
    gradient: "bg-gradient-to-br from-rose-500 to-pink-500",
  },
  {
    id: "halftone",
    name: "Effet de Trame",
    description:
      "Ajoutez un effet de trame halftone par-dessus vos images avec des paramètres personnalisables",
    category: "Design",
    status: "ready",
    icon: <Image className="w-6 h-6" />,
    color: "from-violet-500 to-purple-500",
    gradient: "bg-gradient-to-br from-violet-500 to-purple-500",
  },
];

const categories = [
  "Tous",
  "Développement",
  "Design",
  "Utilitaires",
  "Sécurité",
  "Édition",
];

const features = [
  {
    icon: <Zap className="w-8 h-8" />,
    title: "Rapide & Efficace",
    description: "Outils optimisés pour une productivité maximale",
    gradient: "from-yellow-400 to-orange-500",
  },
  {
    icon: <Sparkles className="w-8 h-8" />,
    title: "Interface Moderne",
    description: "Design épuré et intuitif pour une expérience fluide",
    gradient: "from-purple-400 to-pink-500",
  },
  {
    icon: <CheckCircle className="w-8 h-8" />,
    title: "Gratuit & Open Source",
    description: "Accès libre à tous les outils sans limitation",
    gradient: "from-green-400 to-blue-500",
  },
];

const stats = [
  { number: "10K+", label: "Utilisateurs actifs" },
  { number: "50+", label: "Outils disponibles" },
  { number: "99.9%", label: "Disponibilité" },
  { number: "24/7", label: "Support" },
];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [mounted, setMounted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredTools =
    selectedCategory === "Tous"
      ? tools
      : tools.filter((tool) => tool.category === selectedCategory);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <ScrollProgress />
      <FloatingParticles />
      <Confetti
        isActive={showConfetti}
        onComplete={() => setShowConfetti(false)}
      />
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <ParallaxSection speed={0.3}>
          <div className="absolute top-0 left-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        </ParallaxSection>
        <ParallaxSection speed={0.2}>
          <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        </ParallaxSection>
        <ParallaxSection speed={0.4}>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </ParallaxSection>

        <div className="relative z-10 container mx-auto px-4">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <div className="space-y-4">
              <FloatingElement delay={0.5} duration={4}>
                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 px-4 py-2 text-sm font-medium animate-fade-in-up">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Nouveau : Éditeur de Motifs
                </Badge>
              </FloatingElement>
              <ScaleElement delay={0.2} duration={1} scale={0.9}>
                <h1 className="text-5xl md:text-7xl font-bold gradient-text leading-tight">
                  <TypingEffect text="Just Tools" speed={150} />
                </h1>
              </ScaleElement>
              <SlideElement direction="up" delay={0.3} duration={0.8}>
                <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
                  La suite d'outils de développement la plus complète pour
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {" "}
                    accélérer votre workflow
                  </span>
                  et transformer votre productivité
                </p>
              </SlideElement>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <RippleButton
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 text-lg px-8 py-6 animate-fade-in-up animation-delay-400 hover-lift"
                onClick={() => setShowConfetti(true)}
              >
                <Play className="w-5 h-5 mr-2" />
                Commencer Gratuitement
                <ArrowRight className="w-5 h-5 ml-2" />
              </RippleButton>
              <MagneticButton
                size="lg"
                variant="outline"
                className="border-2 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 text-lg px-8 py-6 animate-fade-in-up animation-delay-500 hover-lift"
              >
                Voir les Outils
              </MagneticButton>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="text-center space-y-2 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100 + 600}ms` }}
                >
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {stat.number}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white animate-fade-in-up">
              Pourquoi choisir Just Tools ?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
              Une suite d'outils conçue par des développeurs, pour des
              développeurs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-fade-in-up hover-lift group"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <CardHeader className="text-center pb-4">
                  <div
                    className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-all duration-300`}
                  >
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-slate-600 dark:text-slate-300 text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white animate-fade-in-up">
              Nos Outils
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
              Découvrez notre collection d'outils essentiels pour votre
              développement
            </p>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className={`transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-lg"
                    : "border-2 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                }`}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTools.map((tool, index) => (
              <TiltCard
                key={tool.id}
                className="group hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm overflow-hidden animate-fade-in-up hover-lift relative"
                style={{
                  animationDelay: `${index * 150}ms`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -skew-x-12 -translate-x-full group-hover:translate-x-full"></div>
                <div className={`h-2 ${tool.gradient}`}></div>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl ${tool.gradient} flex items-center justify-center text-white group-hover:rotate-12 transition-transform duration-300`}
                    >
                      {tool.icon}
                    </div>
                    <PulseElement delay={1} duration={3}>
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-0"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Prêt
                      </Badge>
                    </PulseElement>
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {tool.name}
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between mb-4">
                    <Badge
                      variant="outline"
                      className="text-xs border-slate-300 dark:border-slate-600"
                    >
                      {tool.category}
                    </Badge>
                  </div>
                  <Button
                    className="w-full bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600 dark:from-white dark:to-slate-200 dark:text-slate-900 dark:hover:from-slate-200 dark:hover:to-slate-300 text-white dark:text-slate-900 border-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 hover-lift"
                    asChild
                  >
                    <Link href={`/tools/${tool.id}`}>
                      Utiliser l'outil
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-2000"></div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white animate-fade-in-up">
              Prêt à transformer votre workflow ?
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
              Rejoignez des milliers de développeurs qui utilisent déjà Just
              Tools pour accélérer leur développement
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <RippleButton
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 text-lg px-8 py-6 font-semibold hover-lift"
                onClick={() => setShowConfetti(true)}
              >
                Commencer Maintenant
                <ArrowRight className="w-5 h-5 ml-2" />
              </RippleButton>
              <WaveButton
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-6 hover-lift"
              >
                En savoir plus
              </WaveButton>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <BounceIcon className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center hover:scale-110 transition-transform duration-200">
              <RotateElement delay={2} duration={3} angle={360}>
                <Sparkles className="w-5 h-5 text-white" />
              </RotateElement>
            </BounceIcon>
            <BounceElement delay={1} duration={2}>
              <GlowElement color="purple" intensity={0.3}>
                <ShimmerElement delay={0.5} duration={3}>
                  <MorphingElement delay={1} duration={2}>
                    <WobbleElement delay={1.5} duration={1}>
                      <span className="text-xl font-bold">Just Tools</span>
                    </WobbleElement>
                  </MorphingElement>
                </ShimmerElement>
              </GlowElement>
            </BounceElement>
          </div>
          <FadeElement delay={1} duration={1}>
            <p className="text-slate-400">
              Développé avec ❤️ pour la communauté des développeurs
            </p>
          </FadeElement>
        </div>
      </footer>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
