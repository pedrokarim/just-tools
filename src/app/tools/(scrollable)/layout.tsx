import { DynamicToolHeader } from "@/components/dynamic-tool-header";

export default function ScrollableToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header dynamique avec navigation */}
      <DynamicToolHeader />

      {/* Contenu principal - permet le scroll */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
