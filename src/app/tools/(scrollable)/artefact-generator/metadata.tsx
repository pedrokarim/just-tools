import { Sparkles } from "lucide-react";

export const artefactGeneratorMetadata = {
  id: "artefact-generator",
  name: "Simulateur d'Artefacts Genshin",
  description:
    "Générez des artefacts aléatoires avec les vraies probabilités du jeu Genshin Impact",
  category: "Gaming",
  status: "ready" as const,
  icon: <Sparkles className="w-6 h-6" />,
  color: "from-purple-500 to-pink-500",
  gradient: "bg-gradient-to-br from-purple-500 to-pink-500",
  route: "/tools/artefact-generator",
  headerGradient: "from-purple-600 to-pink-600",
  headerIconBg: "bg-gradient-to-br from-purple-500 to-pink-500",
  createdAt: new Date("2025-01-10"),
};
