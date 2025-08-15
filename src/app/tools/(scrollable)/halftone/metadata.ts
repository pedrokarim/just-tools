import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Effet de Trame - Ajoutez des effets halftone à vos images",
  description:
    "Outil gratuit pour ajouter des effets de trame halftone à vos images avec des paramètres personnalisables. Interface intuitive avec prévisualisation.",
  keywords: [
    "effet de trame",
    "halftone",
    "effet image",
    "trame halftone",
    "effet photo",
    "outil image",
    "gratuit halftone",
    "effet artistique",
  ],
  openGraph: {
    title: "Effet de Trame - Ajoutez des effets halftone à vos images",
    description:
      "Outil gratuit pour ajouter des effets de trame halftone à vos images.",
    url: "https://just-tools.ascencia.re/tools/halftone",
    type: "website",
    images: [
      {
        url: "/og-halftone.png",
        width: 1200,
        height: 630,
        alt: "Effet de Trame - Just Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Effet de Trame - Ajoutez des effets halftone à vos images",
    description:
      "Outil gratuit pour ajouter des effets de trame halftone à vos images.",
    images: ["/og-halftone.png"],
  },
  alternates: {
    canonical: "/tools/halftone",
  },
};
