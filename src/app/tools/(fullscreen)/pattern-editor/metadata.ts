import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Éditeur de Motifs - Créez des motifs répétitifs interactifs",
  description:
    "Outil gratuit pour créer des motifs répétitifs interactifs. Interface plein écran avec contrôles avancés pour des designs uniques.",
  keywords: [
    "éditeur de motifs",
    "motifs répétitifs",
    "pattern editor",
    "motifs design",
    "outil motifs",
    "gratuit motifs",
    "motifs interactifs",
    "design patterns",
  ],
  openGraph: {
    title: "Éditeur de Motifs - Créez des motifs répétitifs interactifs",
    description: "Outil gratuit pour créer des motifs répétitifs interactifs.",
    url: "https://just-tools.vercel.app/tools/pattern-editor",
    type: "website",
    images: [
      {
        url: "/og-pattern-editor.png",
        width: 1200,
        height: 630,
        alt: "Éditeur de Motifs - Just Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Éditeur de Motifs - Créez des motifs répétitifs interactifs",
    description: "Outil gratuit pour créer des motifs répétitifs interactifs.",
    images: ["/og-pattern-editor.png"],
  },
  alternates: {
    canonical: "/tools/pattern-editor",
  },
};
