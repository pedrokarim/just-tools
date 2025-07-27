import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Convertisseur Base64 - Encodez et décodez du texte",
  description:
    "Outil gratuit pour encoder et décoder du texte en Base64. Interface simple et intuitive pour convertir rapidement vos données.",
  keywords: [
    "convertisseur base64",
    "encodeur base64",
    "décodeur base64",
    "conversion base64",
    "encode base64",
    "decode base64",
    "outil base64",
    "gratuit base64",
  ],
  openGraph: {
    title: "Convertisseur Base64 - Encodez et décodez du texte",
    description:
      "Outil gratuit pour encoder et décoder du texte en Base64. Interface simple et intuitive.",
    url: "https://just-tools.vercel.app/tools/base64-converter",
    type: "website",
    images: [
      {
        url: "/og-base64.png",
        width: 1200,
        height: 630,
        alt: "Convertisseur Base64 - Just Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Convertisseur Base64 - Encodez et décodez du texte",
    description: "Outil gratuit pour encoder et décoder du texte en Base64.",
    images: ["/og-base64.png"],
  },
  alternates: {
    canonical: "/tools/base64-converter",
  },
};
