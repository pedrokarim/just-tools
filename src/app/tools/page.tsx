import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { PROJECT_CONFIG } from "@/lib/constants";
import { isToolNew } from "@/lib/tools-metadata";
import { CheckCircle, Sparkles, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Tous nos outils",
  description:
    "Découvrez notre collection complète d'outils de développement gratuits",
};

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Navbar />

      <div className="container mx-auto px-4 py-12 pt-24">
        {/* Header */}
        <div className="text-center space-y-6 mb-16">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {PROJECT_CONFIG.name}
            </h1>
          </div>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            {PROJECT_CONFIG.description}
          </p>
          <div className="flex items-center justify-center space-x-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {PROJECT_CONFIG.tools.length}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Outils disponibles
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                100%
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Gratuits
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                24/7
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Disponible
              </div>
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROJECT_CONFIG.tools.map((tool) => {
            const isNew = isToolNew(tool);
            return (
              <Card
                key={tool.id}
                className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm overflow-hidden"
              >
                <div className={`h-2 ${tool.gradient}`}></div>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl ${tool.gradient} flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300`}
                    >
                      {tool.icon}
                    </div>
                    <div className="flex items-center space-x-2">
                      {isNew && (
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-0"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Nouveau
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {tool.status === "ready" ? "Prêt" : "En développement"}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                    {tool.name}
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="secondary"
                      className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                    >
                      {tool.category}
                    </Badge>
                    <Link
                      href={tool.route}
                      className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-200 group/link"
                    >
                      Essayer
                      <ArrowRight className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform duration-200" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Footer CTA */}
        <div className="text-center mt-16">
          <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/50 dark:border-slate-700/50">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Besoin d'un outil spécifique ?
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-2xl mx-auto">
              Nous développons constamment de nouveaux outils pour répondre aux
              besoins des développeurs. N'hésitez pas à nous faire part de vos
              suggestions !
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="https://github.com/pedrokarim/just-tools/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 hover:scale-105 shadow-lg"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Proposer un outil
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium rounded-lg transition-all duration-200"
              >
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
