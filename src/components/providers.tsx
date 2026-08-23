"use client";

import { Provider } from "jotai";

/**
 * Le `SessionProvider` de NextAuth a disparu avec NextAuth.
 *
 * Il n'a pas de remplaçant, et c'est le but : la session est lue **côté
 * serveur**. Un contexte client qui la republierait obligerait à la garder
 * synchronisée, et surtout à la faire voyager jusqu'au navigateur — alors que
 * tout l'intérêt du montage confidentiel est qu'elle n'y aille pas.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return <Provider>{children}</Provider>;
}
