import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import { ThemeProvider } from "next-themes";
import Script from "next/script";
import { getToolsCount } from "@/lib/tools-metadata";

// Fonction pour enregistrer le service worker
function registerServiceWorker() {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker enregistré avec succès:", registration);
        })
        .catch((error) => {
          console.log("Échec de l'enregistrement du Service Worker:", error);
        });
    });
  }
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Fonction pour obtenir l'URL de base avec fallback
function getBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_FALLBACK_URL ||
    "https://just-tools.ascencia.re"
  );
}

// Fonction pour obtenir le nom du site avec fallback
function getSiteName(): string {
  return process.env.NEXT_PUBLIC_SITE_NAME || "Just Tools";
}

// Fonction pour obtenir la description du site avec fallback
function getSiteDescription(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
    "Suite d'outils de développement gratuits"
  );
}

const baseUrl = getBaseUrl();
const siteName = getSiteName();
const siteDescription = getSiteDescription();
const toolsCount = getToolsCount();

export const metadata: Metadata = {
  title: {
    default: `${siteName} - ${siteDescription}`,
    template: `%s | ${siteName}`,
  },
  description: `Collection d'outils de développement pratiques et créatifs pour simplifier votre workflow quotidien. ${toolsCount} outils gratuits pour les développeurs.`,
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
    "extracteur de couleurs",
    "synthèse vocale",
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
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: baseUrl,
    title: `${siteName} - ${siteDescription}`,
    description: `Collection d'outils de développement pratiques et créatifs pour simplifier votre workflow quotidien. ${toolsCount} outils gratuits pour les développeurs.`,
    siteName: siteName,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${siteName} - Outils de développement`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} - ${siteDescription}`,
    description: `Collection d'outils de développement pratiques et créatifs pour simplifier votre workflow quotidien. ${toolsCount} outils gratuits pour les développeurs.`,
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
  name: siteName,
  description:
    "Collection d'outils de développement pratiques et créatifs pour simplifier votre workflow quotidien",
  url: baseUrl,
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
    "Extracteur de Couleurs",
    "Synthèse Vocale",
  ],
  screenshot: `${baseUrl}/assets/images/icon-512.png`,
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
        <link
          rel="icon"
          href="/assets/images/icon-192.png"
          type="image/png"
          sizes="192x192"
        />
        <link
          rel="icon"
          href="/assets/images/icon-512.png"
          type="image/png"
          sizes="512x512"
        />
        <link rel="apple-touch-icon" href="/assets/images/icon-192.png" />
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

        {/* Script pour enregistrer le service worker */}
        <Script
          id="service-worker"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html:
              "if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').then(function(registration){console.log('Service Worker enregistré avec succès:',registration);}).catch(function(error){console.log('Échec de l\\'enregistrement du Service Worker:',error);});});}",
          }}
        />
      </body>
    </html>
  );
}
