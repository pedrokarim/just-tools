import { DynamicToolHeader } from "@/components/dynamic-tool-header";

export default function FullscreenToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      {/* Header dynamique avec navigation */}
      <DynamicToolHeader />

      {/* Contenu principal - hauteur fixe pour les outils plein écran */}
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
