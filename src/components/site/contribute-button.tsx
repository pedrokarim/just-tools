"use client";

import { useState, type ComponentProps } from "react";
import { ContributionModal } from "@/components/contribution-modal";
import { Button } from "@/components/ui/button";

/** Le bouton « Contribuer » et sa fenêtre : la seule interactivité de l'accueil. */
export function ContributeButton(props: ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button {...props} onClick={() => setOpen(true)} />
      <ContributionModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
