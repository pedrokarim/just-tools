import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Validateur JSON - Validez et formatez vos fichiers JSON",
  description:
    "Outil gratuit pour valider et formater vos fichiers JSON. Interface simple et intuitive pour vérifier la syntaxe et améliorer la lisibilité.",
  keywords: [
    "validateur json",
    "formateur json",
    "validation json",
    "formatage json",
    "syntaxe json",
    "outil json",
    "gratuit json",
    "beautifier json",
  ],
  openGraph: {
    title: "Validateur JSON - Validez et formatez vos fichiers JSON",
    description: "Outil gratuit pour valider et formater vos fichiers JSON.",
    url: "https://just-tools.vercel.app/tools/json-validator",
    type: "website",
    images: [
      {
        url: "/og-json-validator.png",
        width: 1200,
        height: 630,
        alt: "Validateur JSON - Just Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Validateur JSON - Validez et formatez vos fichiers JSON",
    description: "Outil gratuit pour valider et formater vos fichiers JSON.",
    images: ["/og-json-validator.png"],
  },
  alternates: {
    canonical: "/tools/json-validator",
  },
};
