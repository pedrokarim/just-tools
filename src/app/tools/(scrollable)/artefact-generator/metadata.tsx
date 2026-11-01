import { Sparkles } from "lucide-react";

export const artefactGeneratorMetadata = {
  id: "artefact-generator",
  name: "Simulateur d'Artefacts Genshin",
  description:
    "Génère des artefacts avec les vraies probabilités de Genshin Impact.",
  category: "Gaming",
  status: "ready" as const,
  icon: <Sparkles aria-hidden="true" />,
  route: "/tools/artefact-generator",
  createdAt: new Date("2025-01-10"),
};
