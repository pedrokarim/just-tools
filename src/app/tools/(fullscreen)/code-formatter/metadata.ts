import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Formateur de Code - Formatez votre code automatiquement",
  description:
    "Outil gratuit pour formater automatiquement votre code dans différents langages. Interface simple et intuitive pour un formatage parfait.",
  keywords: [
    "formateur de code",
    "formatage code",
    "beautifier code",
    "formater javascript",
    "formater python",
    "formater html",
    "formater css",
    "outil formatage code",
    "gratuit formatage",
  ],
  openGraph: {
    title: "Formateur de Code - Formatez votre code automatiquement",
    description:
      "Outil gratuit pour formater automatiquement votre code dans différents langages.",
    url: "https://just-tools.vercel.app/tools/code-formatter",
    type: "website",
    images: [
      {
        url: "/og-code-formatter.png",
        width: 1200,
        height: 630,
        alt: "Formateur de Code - Just Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Formateur de Code - Formatez votre code automatiquement",
    description:
      "Outil gratuit pour formater automatiquement votre code dans différents langages.",
    images: ["/og-code-formatter.png"],
  },
  alternates: {
    canonical: "/tools/code-formatter",
  },
};
