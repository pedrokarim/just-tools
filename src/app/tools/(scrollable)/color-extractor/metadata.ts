import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Extracteur de Couleurs - Extrayez les couleurs dominantes d'une image",
  description:
    "Outil gratuit pour extraire les couleurs dominantes d'une image. Uploadez une image ou utilisez une URL pour obtenir une palette de couleurs harmonieuses.",
  keywords: [
    "extracteur de couleurs",
    "couleurs dominantes",
    "palette image",
    "extraction couleurs",
    "dominantes couleurs",
    "color extractor",
    "outil couleurs",
    "gratuit couleurs",
    "palette dominantes",
  ],
  openGraph: {
    title:
      "Extracteur de Couleurs - Extrayez les couleurs dominantes d'une image",
    description:
      "Outil gratuit pour extraire les couleurs dominantes d'une image.",
    url: "https://just-tools.vercel.app/tools/color-extractor",
    type: "website",
    images: [
      {
        url: "/og-color-extractor.png",
        width: 1200,
        height: 630,
        alt: "Extracteur de Couleurs - Just Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Extracteur de Couleurs - Extrayez les couleurs dominantes d'une image",
    description:
      "Outil gratuit pour extraire les couleurs dominantes d'une image.",
    images: ["/og-color-extractor.png"],
  },
  alternates: {
    canonical: "/tools/color-extractor",
  },
};
