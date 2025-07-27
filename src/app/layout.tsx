import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import { ThemeProvider } from "next-themes";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Just Tools - Suite d'outils de développement gratuits",
    template: "%s | Just Tools",
  },
  description:
    "Collection d'outils de développement pratiques et créatifs pour simplifier votre workflow quotidien. Convertisseur Base64, formateur de code, générateur de palette, validateur JSON, générateur de mots de passe, éditeur Markdown, éditeur de motifs et effet de trame.",
  keywords: [
    "outils de développement",
    "convertisseur base64",
    "formateur de code",
    "générateur de palette",
    "validateur json",
    "générateur de mots de passe",
    "éditeur markdown",
    "éditeur de motifs",
    "effet de trame",
    "développement web",
    "programmation",
    "utilitaires développeur",
    "outils gratuits",
    "workflow développement",
  ],
  authors: [{ name: "Ahmed Karim (PedroKarim)", url: "https://ascencia.re" }],
  creator: "Ahmed Karim (PedroKarim)",
  publisher: "Ascencia",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://just-tools.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://just-tools.vercel.app",
    title: "Just Tools - Suite d'outils de développement gratuits",
    description:
      "Collection d'outils de développement pratiques et créatifs pour simplifier votre workflow quotidien. 8 outils gratuits pour les développeurs.",
    siteName: "Just Tools",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Just Tools - Outils de développement",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Just Tools - Suite d'outils de développement gratuits",
    description:
      "Collection d'outils de développement pratiques et créatifs pour simplifier votre workflow quotidien.",
    images: ["/og-image.png"],
    creator: "@PedroKarim",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
  },
  category: "technology",
};

// Données structurées JSON-LD
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Just Tools",
  description:
    "Collection d'outils de développement pratiques et créatifs pour simplifier votre workflow quotidien",
  url: "https://just-tools.vercel.app",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web Browser",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "EUR",
  },
  author: {
    "@type": "Person",
    name: "Ahmed Karim",
    alternateName: "PedroKarim",
    url: "https://ascencia.re",
  },
  publisher: {
    "@type": "Organization",
    name: "Ascencia",
    url: "https://ascencia.re",
  },
  featureList: [
    "Convertisseur Base64",
    "Formateur de Code",
    "Générateur de Palette",
    "Validateur JSON",
    "Générateur de Mots de Passe",
    "Éditeur Markdown",
    "Éditeur de Motifs",
    "Effet de Trame",
  ],
  screenshot: "https://just-tools.vercel.app/og-image.png",
  softwareVersion: "1.0.0",
  datePublished: "2024-12-19",
  dateModified: "2024-12-19",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5"
        />

        {/* Données structurées JSON-LD */}
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>{children}</Providers>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
