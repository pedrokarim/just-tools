import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import { ThemeProvider } from "next-themes";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import Script from "next/script";
import { PROJECT_CONFIG } from "@/lib/constants";
import { getToolsCount } from "@/lib/tools-metadata";
import { NuqsAdapter } from "nuqs/adapters/next/app";

// Import d'initialisation Prisma (s'exécute automatiquement côté serveur)
import "@/lib/prisma";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = PROJECT_CONFIG.baseUrl;
const siteName = PROJECT_CONFIG.name;
const siteDescription = PROJECT_CONFIG.description;
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
        width: 512,
        height: 512,
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
    google: "i_GLyVEAubN9keZoMX6Kk8-T8XyldPJ8zXc1atDYv-k",
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
  datePublished: "2025-08-15",
  dateModified: "2025-08-15",
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
        <meta name="theme-color" content="#2563eb" />
        <meta name="msapplication-TileColor" content="#2563eb" />
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
          <NuqsAdapter>
            <Providers>{children}</Providers>
            <AnalyticsTracker />
            <Toaster richColors position="top-right" />
          </NuqsAdapter>
        </ThemeProvider>

        {/* Script pour enregistrer le service worker (production uniquement) */}
        <Script
          id="service-worker"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if('serviceWorker' in navigator && window.location.hostname !== 'localhost'){
                window.addEventListener('load', function(){
                  let hasRefreshed = false;

                  navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' })
                    .then(function(registration){
                      console.log('Service Worker enregistré avec succès:', registration);

                      const checkForUpdate = function() {
                        registration.update().catch(function(error){
                          console.log('Vérification de mise à jour SW échouée:', error);
                        });
                      };

                      setInterval(function(){
                        checkForUpdate();
                      }, 5 * 60 * 1000);

                      document.addEventListener('visibilitychange', function(){
                        if (document.visibilityState === 'visible') {
                          checkForUpdate();
                        }
                      });

                      window.addEventListener('online', function(){
                        checkForUpdate();
                      });

                      navigator.serviceWorker.addEventListener('controllerchange', function(){
                        if (hasRefreshed) return;
                        hasRefreshed = true;
                        window.location.reload();
                      });

                      const activateWaitingWorker = function(){
                        if (registration.waiting) {
                          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                        }
                      };

                      registration.addEventListener('updatefound', function(){
                        console.log('Nouvelle version du Service Worker trouvée');
                        const newWorker = registration.installing;

                        if (newWorker) {
                          newWorker.addEventListener('statechange', function(){
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                              console.log('Nouvelle version installée, activation...');
                              activateWaitingWorker();
                            }
                          });
                        }
                      });

                      activateWaitingWorker();
                      checkForUpdate();
                    })
                    .catch(function(error){
                      console.log('Échec de l\\'enregistrement du Service Worker:', error);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
