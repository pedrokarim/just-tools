"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getToolMetadataByPathname } from "@/lib/tools-metadata";

export function DynamicToolHeader() {
  const pathname = usePathname();
  const toolMetadata = getToolMetadataByPathname(pathname);

  // Si on n'est pas sur une page d'outil, afficher le header par défaut
  if (!toolMetadata) {
    return (
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex-shrink-0">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/" className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Retour</span>
                </Link>
              </Button>
              <div className="h-6 w-px bg-slate-300 dark:bg-slate-600" />
              <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Outils de Développement
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Just Tools
              </span>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex-shrink-0">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/" className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Retour</span>
              </Link>
            </Button>
            <div className="h-6 w-px bg-slate-300 dark:bg-slate-600" />
            
            {/* Informations de l'outil */}
            <div className="flex items-center space-x-3">
              {/* Icône de l'outil */}
              <div className={`w-8 h-8 ${toolMetadata.headerIconBg} rounded-lg flex items-center justify-center shadow-sm`}>
                <div className="text-white">
                  {toolMetadata.icon}
                </div>
              </div>
              
              {/* Nom et description de l'outil */}
              <div className="flex flex-col">
                <h1 className={`text-lg font-semibold bg-gradient-to-r ${toolMetadata.headerGradient} bg-clip-text text-transparent`}>
                  {toolMetadata.name}
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md truncate">
                  {toolMetadata.description}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Just Tools
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
