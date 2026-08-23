import type { NextConfig } from "next";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getVersionInfo } = require("./scripts/version");

const versionInfo = getVersionInfo();

const nextConfig: NextConfig = {
  /*
   * Les paquets Ascencia sont publiés en TypeScript source, sans étape de
   * compilation : c'est le choix du monorepo qui les produit. Next doit donc
   * les transpiler comme du code local, sans quoi le build échoue sur la
   * première annotation de type.
   *
   * **Toute la chaîne doit y figurer, pas seulement ce qu'on importe.**
   * `id-rbac` n'est jamais importé ici — c'est une dépendance de `id-core` et
   * de `id-server` — et l'oublier faisait échouer le build sur un
   * `Unexpected token` dans son `index.ts`. Le typecheck, lui, passait au
   * vert : il lit le TypeScript, c'est le bundler qui ne sait pas quoi en
   * faire.
   */
  transpilePackages: [
    "@ascencia/id-rbac",
    "@ascencia/id-core",
    "@ascencia/id-server",
  ],
  // Configuration pour Docker
  output: "standalone",

  // Un bun.lock traîne dans le dossier parent, ce qui faisait déduire à Next
  // une racine de workspace au-dessus du projet. En sortie `standalone`, c'est
  // cette racine qui détermine les fichiers embarqués dans l'image.
  outputFileTracingRoot: __dirname,

  // Configuration webpack pour les bases de données
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclure les modules de base de données natifs pour éviter les erreurs de build
      config.externals = [...config.externals, "bun:sqlite", "pg-native"];
    }
    return config;
  },

  // Pas de clé `eslint` ici : cette version de Next ne la reconnaît plus (elle
  // provoquait « Unrecognized key(s) in object: 'eslint' ») et ne lance plus
  // ESLint pendant le build. Le lint se lance à part, via `bun run lint`.
  typescript: {
    // Le typecheck passe (0 erreur) : on le laisse bloquer le build plutôt que
    // de le masquer. C'est ce masquage qui avait laissé une erreur survivre
    // dans halftone-store.ts sans que rien ne la signale.
    ignoreBuildErrors: false,
  },

  // Configuration du port depuis les variables d'environnement
  env: {
    PORT: process.env.PORT || "3000",
    // Toujours dérivée de package.json, jamais de .env : un
    // NEXT_PUBLIC_VERSION écrit à la main y était resté figé à 1.0.0 pendant
    // que le projet passait en 2.2.1. Pour forcer une version en CI, utiliser
    // APP_VERSION (voir scripts/version.js).
    NEXT_PUBLIC_VERSION: versionInfo.version,
    NEXT_PUBLIC_BUILD_SHA: versionInfo.shortSha || "",
  },

  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
      {
        source: "/manifest.json",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache",
          },
        ],
      },
      {
        source: "/version.json",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
        ],
      },
      {
        source: "/tools/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, s-maxage=86400",
          },
        ],
      },
    ];
  },

  // Optimisations pour les images
  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Logos des autres projets de l'écosystème, servis par chaque projet
    // (section « Nos autres projets » de l'accueil).
    remotePatterns: [
      { protocol: "https", hostname: "ascencia.re" },
      { protocol: "https", hostname: "*.ascencia.re" },
    ],
  },

  // Compression gzip
  compress: true,

  // Optimisations de performance
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
    // Optimisations pour réduire l'utilisation mémoire
    memoryBasedWorkersCount: true,
  },

  // Plus besoin d'externaliser genshin-db (supprimé du projet)

  // Redirection pour SEO
  async redirects() {
    return [
      {
        source: "/base64",
        destination: "/tools/base64-converter",
        permanent: true,
      },
      {
        source: "/password",
        destination: "/tools/password-generator",
        permanent: true,
      },
      {
        source: "/json",
        destination: "/tools/json-validator",
        permanent: true,
      },
      {
        source: "/markdown",
        destination: "/tools/markdown-editor",
        permanent: true,
      },
      {
        source: "/palette",
        destination: "/tools/color-palette",
        permanent: true,
      },
      {
        source: "/code",
        destination: "/tools/code-formatter",
        permanent: true,
      },
      {
        source: "/pattern",
        destination: "/tools/pattern-editor",
        permanent: true,
      },
      {
        source: "/halftone",
        destination: "/tools/halftone",
        permanent: true,
      },
      {
        source: "/colors",
        destination: "/tools/color-extractor",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
