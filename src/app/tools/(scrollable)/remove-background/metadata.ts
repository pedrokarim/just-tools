import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Suppression d'Arrière-plan - Enlevez le fond de vos images",
  description:
    "Outil gratuit pour supprimer automatiquement l'arrière-plan de vos images grâce à l'IA, directement dans votre navigateur. Aucun upload serveur, 100% confidentiel.",
  keywords: [
    "remove background",
    "suppression arrière-plan",
    "enlever fond image",
    "détourage automatique",
    "image transparente",
    "PNG transparent",
    "IA image",
    "outil image gratuit",
  ],
  openGraph: {
    title: "Suppression d'Arrière-plan - Enlevez le fond de vos images",
    description:
      "Outil gratuit pour supprimer automatiquement l'arrière-plan de vos images avec l'IA.",
    url: "https://just-tools.ascencia.re/tools/remove-background",
    type: "website",
    images: [
      {
        url: "/og-remove-background.png",
        width: 1200,
        height: 630,
        alt: "Suppression d'Arrière-plan - Just Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Suppression d'Arrière-plan - Enlevez le fond de vos images",
    description:
      "Outil gratuit pour supprimer automatiquement l'arrière-plan de vos images avec l'IA.",
    images: ["/og-remove-background.png"],
  },
  alternates: {
    canonical: "/tools/remove-background",
  },
};
