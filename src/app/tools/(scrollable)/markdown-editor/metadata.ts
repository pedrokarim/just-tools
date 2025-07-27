import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Éditeur Markdown - Éditez et prévisualisez du Markdown",
  description:
    "Outil gratuit pour éditer et prévisualiser du Markdown en temps réel. Interface intuitive avec syntax highlighting et prévisualisation instantanée.",
  keywords: [
    "éditeur markdown",
    "prévisualisation markdown",
    "éditeur md",
    "markdown editor",
    "syntaxe markdown",
    "outil markdown",
    "gratuit markdown",
    "prévisualiseur md",
  ],
  openGraph: {
    title: "Éditeur Markdown - Éditez et prévisualisez du Markdown",
    description:
      "Outil gratuit pour éditer et prévisualiser du Markdown en temps réel.",
    url: "https://just-tools.vercel.app/tools/markdown-editor",
    type: "website",
    images: [
      {
        url: "/og-markdown-editor.png",
        width: 1200,
        height: 630,
        alt: "Éditeur Markdown - Just Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Éditeur Markdown - Éditez et prévisualisez du Markdown",
    description:
      "Outil gratuit pour éditer et prévisualiser du Markdown en temps réel.",
    images: ["/og-markdown-editor.png"],
  },
  alternates: {
    canonical: "/tools/markdown-editor",
  },
};
