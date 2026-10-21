import type { ReactNode } from "react";
import { metadata as toolMetadata } from "./metadata";

/**
 * La page étant un composant client, elle ne peut pas exporter `metadata` :
 * ce layout s'en charge. Sans lui, la page héritait du titre et du
 * `canonical: "/"` de l'accueil, et se déclarait ainsi doublon de l'accueil.
 */
export const metadata = toolMetadata;

export default function ToolLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
