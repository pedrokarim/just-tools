"use client";

export { SarutobiProvider } from "@ascencia/sarutobi-react";

/**
 * Réexport client de `SarutobiProvider`.
 *
 * Contournement temporaire d'un défaut d'empaquetage amont : le paquet publié
 * `@ascencia/sarutobi-react@0.1.0-rc.4` ne contient pas la directive
 * `"use client"` dans son `dist`. Importé directement depuis le layout — un
 * Server Component — le provider est alors traité comme composant serveur et le
 * build échoue au prérendu sur « (0 , Q.useRef) is not a function ».
 *
 * La cause est identifiée : `packages/react/tsup.config.ts` déclare bien
 * `banner: { js: '"use client";' }`, mais `treeshake: true` le supprime de la
 * sortie. Vérifié en reconstruisant le paquet — avec `--no-treeshake` la
 * directive réapparaît.
 *
 * Ce fichier n'a plus lieu d'être dès qu'une version corrigée est publiée :
 * importer alors `SarutobiProvider` directement depuis `@ascencia/sarutobi-react`
 * dans `layout.tsx`, et supprimer ce module.
 */
