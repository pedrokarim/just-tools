import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Générateur de Palette - Crée des palettes de couleurs harmonieuses",
  description:
    "Outil gratuit pour créer des palettes de couleurs harmonieuses. Génère des combinaisons de couleurs parfaites pour tes projets de design.",
  keywords: [
    "générateur palette",
    "palette couleurs",
    "couleurs harmonieuses",
    "générateur couleurs",
    "palette design",
    "couleurs complémentaires",
    "outil palette",
    "gratuit palette",
  ],
  openGraph: {
    title:
      "Générateur de Palette - Crée des palettes de couleurs harmonieuses",
    description:
      "Outil gratuit pour créer des palettes de couleurs harmonieuses.",
    url: "https://just-tools.ascencia.re/tools/color-palette",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Générateur de Palette - Just Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Générateur de Palette - Crée des palettes de couleurs harmonieuses",
    description:
      "Outil gratuit pour créer des palettes de couleurs harmonieuses.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "/tools/color-palette",
  },
};
