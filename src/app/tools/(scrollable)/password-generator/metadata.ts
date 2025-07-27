import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Générateur de Mots de Passe - Créez des mots de passe sécurisés",
  description:
    "Outil gratuit pour générer des mots de passe sécurisés et aléatoires. Interface intuitive avec options personnalisables pour tous vos besoins.",
  keywords: [
    "générateur mots de passe",
    "mots de passe sécurisés",
    "générateur mdp",
    "password generator",
    "sécurité mots de passe",
    "outil sécurité",
    "gratuit mdp",
    "générateur aléatoire",
  ],
  openGraph: {
    title: "Générateur de Mots de Passe - Créez des mots de passe sécurisés",
    description:
      "Outil gratuit pour générer des mots de passe sécurisés et aléatoires.",
    url: "https://just-tools.vercel.app/tools/password-generator",
    type: "website",
    images: [
      {
        url: "/og-password-generator.png",
        width: 1200,
        height: 630,
        alt: "Générateur de Mots de Passe - Just Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Générateur de Mots de Passe - Créez des mots de passe sécurisés",
    description:
      "Outil gratuit pour générer des mots de passe sécurisés et aléatoires.",
    images: ["/og-password-generator.png"],
  },
  alternates: {
    canonical: "/tools/password-generator",
  },
};
