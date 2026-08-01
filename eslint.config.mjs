import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      ".next/**",
      "public/sw.js",
      "scripts/sw-template.js",
      "node_modules/**",
    ],
  },
  {
    rules: {
      // Désactivée sciemment. La règle veut qu'on échappe `'` en `&apos;` dans
      // le JSX ; pensée pour l'anglais, elle se déclenche sur chaque apostrophe
      // française et représentait à elle seule 87 des 279 remontées. Le coût
      // (illisibilité du source) dépasse le bénéfice (nul au rendu).
      "react/no-unescaped-entities": "off",

      // Les paramètres inutilisés préfixés d'un `_` sont une convention
      // explicite : on garde la signature sans prétendre s'en servir.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
];

export default eslintConfig;
