import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuration pour Docker
  output: "standalone",

  // Configuration webpack pour les bases de données
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclure les modules de base de données natifs pour éviter les erreurs de build
      config.externals = [...config.externals, "bun:sqlite", "pg-native"];
    }
    return config;
  },

  // Désactivation du linting et de la validation pour accélérer le build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Configuration du port depuis les variables d'environnement
  env: {
    PORT: process.env.PORT || "3000",
  },

  async headers() {
    return [
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
  },

  // Compression gzip
  compress: true,

  // Optimisations de performance
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
    // Optimisations pour réduire l'utilisation mémoire
    memoryBasedWorkersCount: true,
  },

  // Éviter de charger genshin-db au build (nouvelle syntaxe Next.js 15.6+)
  serverExternalPackages: ["genshin-db"],

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
