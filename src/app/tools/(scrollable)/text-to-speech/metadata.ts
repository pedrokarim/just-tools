import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Synthèse Vocale - Convertissez votre texte en parole",
  description:
    "Outil gratuit de synthèse vocale avec des voix naturelles et des paramètres personnalisables. Convertissez instantanément votre texte en parole.",
  keywords: [
    "synthèse vocale",
    "text to speech",
    "tts",
    "lecteur de texte",
    "voix artificielle",
    "conversion texte parole",
    "lecture automatique",
    "outil vocal",
    "gratuit tts",
    "voix naturelles",
  ],
  openGraph: {
    title: "Synthèse Vocale - Convertissez votre texte en parole",
    description:
      "Outil gratuit de synthèse vocale avec des voix naturelles et des paramètres personnalisables.",
    url: "https://just-tools.ascencia.re/tools/text-to-speech",
    type: "website",
    images: [
      {
        url: "/og-text-to-speech.png",
        width: 1200,
        height: 630,
        alt: "Synthèse Vocale - Just Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Synthèse Vocale - Convertissez votre texte en parole",
    description:
      "Outil gratuit de synthèse vocale avec des voix naturelles et des paramètres personnalisables.",
    images: ["/og-text-to-speech.png"],
  },
  alternates: {
    canonical: "/tools/text-to-speech",
  },
};
