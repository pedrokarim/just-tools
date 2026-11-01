import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Sora } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";
import { ThemeProvider } from "next-themes";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import { LaunchHandler } from "@/components/launch-handler";
import { ToolSearchProvider } from "@/components/site/tool-search";
import Script from "next/script";
import { PROJECT_CONFIG } from "@/lib/constants";
import { getToolsCount, tools } from "@/lib/tools-metadata";
import { RAIL_INIT_SCRIPT } from "@/lib/tool-rail";
import { NuqsAdapter } from "nuqs/adapters/next/app";
// Réexport local : le paquet publié n'embarque pas sa directive « use client ».
// Voir le commentaire dans ce module.
import { SarutobiProvider } from "@/components/sarutobi-provider";

// Import d'initialisation Prisma (s'exécute automatiquement côté serveur)
import "@/lib/prisma";

// Les trois familles d'Ascencia ID. `next/font` les télécharge à la construction
// et les sert depuis le site : aucune requête vers Google côté visiteur.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
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
  description: `Collection d'outils de développement pratiques et créatifs pour simplifier ton quotidien. ${toolsCount} outils gratuits pour les développeurs.`,
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
    description: `Collection d'outils de développement pratiques et créatifs pour simplifier ton quotidien. ${toolsCount} outils gratuits pour les développeurs.`,
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
    description: `Collection d'outils de développement pratiques et créatifs pour simplifier ton quotidien. ${toolsCount} outils gratuits pour les développeurs.`,
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
  },
  category: "technology",
};

// Données structurées JSON-LD
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: siteName,
  description:
    "Suite d'outils de développement gratuits et open source, qui tournent dans le navigateur",
  url: baseUrl,
  inLanguage: "fr",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web Browser",
  isAccessibleForFree: true,
  license: PROJECT_CONFIG.project.licenseUrl,
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
  sameAs: [PROJECT_CONFIG.project.github],
  featureList: tools.map((tool) => tool.name),
  screenshot: `${baseUrl}/assets/images/icon-512.png`,
  softwareVersion: PROJECT_CONFIG.version,
  datePublished: "2025-08-15",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Les variables de police sont posées sur <html>, pas sur <body> : les jetons
    // `--font-*` se résolvent à la racine, et y seraient sinon indéfinis.
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${inter.variable} ${sora.variable} ${jetbrainsMono.variable}`}
    >
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
        {/* iOS ne gère pas la transparence des icônes d'écran d'accueil (elle
            devient noire) : on sert la variante pleine bord à bord. */}
        <link rel="apple-touch-icon" href="/assets/images/icon-maskable-192.png" />
        <link rel="manifest" href="/manifest.json" />
        {/* La barre du navigateur doit reprendre le fond de la page, pas la
            couleur d'accent. Les valeurs suivent `--asc-bg-page` (tokens.css).
            Le suivi se fait sur la préférence système : un thème choisi à la
            main dans l'app ne la repeint pas, ce qui demanderait du JS. */}
        <meta
          name="theme-color"
          media="(prefers-color-scheme: light)"
          content="#f7f3ec"
        />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: dark)"
          content="#0c0b0e"
        />
        <meta name="msapplication-TileColor" content="#17171a" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5"
        />

        {/* Pose l'état du rail d'outils avant le premier rendu. */}
        <script dangerouslySetInnerHTML={{ __html: RAIL_INIT_SCRIPT }} />

        {/* Données structurées JSON-LD. Une balise simple et pas `next/script` :
            celui-ci les injecte après coup, et elles restaient invisibles pour qui
            lit le HTML brut, moteurs de recherche et agents compris. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\u003c"),
          }}
        />
      </head>
      <body>
        {/* Sarutobi — Product Analytics auto-hébergé (sarutobi.ascencia.re).
            Le provider ne rend que ses enfants : il n'introduit aucune frontière
            de rendu, et les enfants restent des Server Components.
            `excludePaths` écarte le back-office, dont le trafic ne dit rien de
            l'audience. Sans `siteId`, le SDK reste inerte (cf. plus bas). */}
        <SarutobiProvider
          siteId={process.env.NEXT_PUBLIC_SARUTOBI_SITE_ID ?? ""}
          disabled={!process.env.NEXT_PUBLIC_SARUTOBI_SITE_ID}
          excludePaths={["/admin/**"]}
        >
          <ThemeProvider
            attribute="data-theme"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <NuqsAdapter>
              <Providers>
                <ToolSearchProvider>{children}</ToolSearchProvider>
              </Providers>
              <LaunchHandler />
              <AnalyticsTracker />
              <Toaster position="top-right" />
            </NuqsAdapter>
          </ThemeProvider>
        </SarutobiProvider>

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
