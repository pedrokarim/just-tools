import type { ReactNode } from "react";
import { metadata as textToSpeechMetadata } from "./metadata";

/**
 * La page étant un composant client, elle ne peut pas exporter `metadata` :
 * ce layout s'en charge. Le titre compte au-delà du référencement — c'est aussi
 * le titre de la fenêtre applicative Edge, que le client `tts-hotkey` cherche
 * pour la mettre au premier plan.
 */
export const metadata = textToSpeechMetadata;

export default function TextToSpeechLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
