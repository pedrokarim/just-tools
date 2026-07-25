"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getToolMetadataByPathname } from "@/lib/tools-metadata";

export function DynamicToolHeader() {
  const pathname = usePathname();
  const toolMetadata = getToolMetadataByPathname(pathname);

  if (!toolMetadata) {
    return (
      <header className="border-b border-border bg-background flex-shrink-0">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/" className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Retour</span>
                </Link>
              </Button>
              <div className="h-6 w-px bg-border" />
              <h1 className="text-xl font-semibold text-foreground">
                Outils de Développement
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Just Tools</span>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b border-border bg-background flex-shrink-0">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          {/* min-w-0 en cascade : sans lui, le `truncate` de la description ne
              peut pas s'appliquer et le header déborde sur petit écran. */}
          <div className="flex min-w-0 items-center space-x-4">
            <Button variant="ghost" size="sm" asChild className="flex-shrink-0">
              <Link href="/" className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Retour</span>
              </Link>
            </Button>
            <div className="h-6 w-px flex-shrink-0 bg-border" />

            <div className="flex min-w-0 items-center space-x-3">
              <div
                className={`w-8 h-8 flex-shrink-0 ${toolMetadata.iconBg} ${toolMetadata.iconColor} rounded-lg flex items-center justify-center`}
              >
                {toolMetadata.icon}
              </div>

              <div className="flex min-w-0 flex-col">
                <h1 className="truncate text-lg font-semibold text-foreground">
                  {toolMetadata.name}
                </h1>
                <p className="max-w-md truncate text-sm text-muted-foreground">
                  {toolMetadata.description}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-shrink-0 items-center space-x-2">
            <span className="text-sm text-muted-foreground">Just Tools</span>
          </div>
        </div>
      </div>
    </header>
  );
}
