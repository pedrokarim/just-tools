import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  // Pipeline CSS explicitement vide : `test.css: false` désactive le traitement
  // des styles mais Vite charge quand même postcss.config.mjs, dont le plugin
  // Tailwind v4 n'est pas exploitable ici (« Invalid PostCSS Plugin »).
  css: { postcss: { plugins: [] } },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    globals: true,
    css: false,
    include: ["tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    "process.env.NODE_ENV": '"test"',
  },
  optimizeDeps: {
    exclude: ["@tailwindcss/postcss"],
  },
});
