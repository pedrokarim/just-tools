"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useQueryState } from "nuqs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dice1,
  Dice6,
  Grid3X3,
  Calculator,
  Copy,
  RefreshCw,
  Star,
  Zap,
  Target,
  BarChart3,
  Sparkles,
  Crown,
  Flower,
  Feather,
  Clock,
  Wine,
} from "lucide-react";
import { toast } from "sonner";
import {
  generateGenshinArtefact,
  generateMultipleGenshinArtefacts,
  generateGenshinArtefactWithSet,
  calculateGenshinArtefactProbability,
  formatGenshinArtefactShort,
  getGenshinGenerationStats,
  type GenshinArtefact,
  type GenshinArtefactGenerationOptions,
} from "@/lib/artefact-generator/genshin-api";
import Image from "next/image";

const typeIcons = {
  Fleur: Flower,
  Plume: Feather,
  Sablier: Clock,
  Coupe: Wine,
  Couronne: Crown,
};

// Types d'artefacts et leurs stats principales
const ARTEFACT_TYPES = [
  { id: "flower", name: "Fleur", mainStats: ["HP"] },
  { id: "plume", name: "Plume", mainStats: ["ATK"] },
  {
    id: "sands",
    name: "Sablier",
    mainStats: ["HP%", "ATK%", "DEF%", "Elemental Mastery", "Energy Recharge"],
  },
  {
    id: "goblet",
    name: "Coupe",
    mainStats: [
      "HP%",
      "ATK%",
      "DEF%",
      "Elemental Mastery",
      "Pyro DMG Bonus",
      "Hydro DMG Bonus",
      "Cryo DMG Bonus",
      "Electro DMG Bonus",
      "Anemo DMG Bonus",
      "Geo DMG Bonus",
      "Physical DMG Bonus",
    ],
  },
  {
    id: "circlet",
    name: "Couronne",
    mainStats: [
      "CRIT Rate",
      "CRIT DMG",
      "HP%",
      "ATK%",
      "DEF%",
      "Elemental Mastery",
      "Healing Bonus",
    ],
  },
];

const SUB_STATS = [
  "HP",
  "ATK",
  "DEF",
  "HP%",
  "ATK%",
  "DEF%",
  "CRIT Rate",
  "CRIT DMG",
  "Elemental Mastery",
  "Energy Recharge",
];

interface ArtefactGeneratorClientProps {
  initialArtifacts: any[];
  initialAvailableSets: string[];
}

export default function ArtefactGeneratorClient({
  initialArtifacts,
  initialAvailableSets,
}: ArtefactGeneratorClientProps) {
  const [artefacts, setArtefacts] = useState<GenshinArtefact[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [availableSets, setAvailableSets] =
    useState<string[]>(initialAvailableSets);
  const [selectedSet, setSelectedSet] = useState<string>("all");
  const [allArtifacts, setAllArtifacts] = useState<any[]>(initialArtifacts);
  const [isLoadingSets, setIsLoadingSets] = useState(false);

  // Search params avec nuqs pour chaque tab
  const [activeTab, setActiveTab] = useQueryState("tab", {
    defaultValue: "generator",
  });
  const [searchQuery, setSearchQuery] = useQueryState("search", {
    defaultValue: "",
  });
  const [selectedType, setSelectedType] = useQueryState("type", {
    defaultValue: "all",
  });
  const [sortBy, setSortBy] = useQueryState("sort", { defaultValue: "name" });

  // État pour le calculateur de probabilités
  const [calculatorType, setCalculatorType] = useState("");
  const [calculatorMainStat, setCalculatorMainStat] = useState("");
  const [calculatorSubStats, setCalculatorSubStats] = useState<string[]>([]);
  const [probability, setProbability] = useState<number | null>(null);

  const generateSingleArtefact = useCallback(async () => {
    setIsGenerating(true);
    try {
      // Simulation d'un délai pour l'effet visuel
      await new Promise((resolve) => setTimeout(resolve, 300));

      console.log(`🔍 selectedSet:`, selectedSet);
      const newArtefact = await generateGenshinArtefactWithSet(
        {
          setName: selectedSet === "all" ? undefined : selectedSet,
        },
        initialArtifacts
      );

      console.log(`🎯 Artefact généré:`, {
        type: newArtefact.type,
        setName: newArtefact.setName,
        imageUrl: newArtefact.imageUrl,
        hasImage: !!newArtefact.imageUrl,
      });

      setArtefacts([newArtefact]);
      toast.success("Artefact généré !");
    } catch (error) {
      toast.error("Erreur lors de la génération");
    } finally {
      setIsGenerating(false);
    }
  }, [selectedSet]);

  const generateMultiple = useCallback(
    async (count: 10 | 50) => {
      setIsGenerating(true);
      try {
        // Simulation d'un délai pour l'effet visuel
        await new Promise((resolve) => setTimeout(resolve, 500));

        const newArtefacts: GenshinArtefact[] = [];
        for (let i = 0; i < count; i++) {
          const artefact = await generateGenshinArtefactWithSet(
            {
              setName: selectedSet === "all" ? undefined : selectedSet,
            },
            initialArtifacts
          );
          newArtefacts.push(artefact);
        }

        setArtefacts(newArtefacts);
        toast.success(`${count} artefacts générés !`);
      } catch (error) {
        toast.error("Erreur lors de la génération");
      } finally {
        setIsGenerating(false);
      }
    },
    [selectedSet]
  );

  const copyArtefact = (artefact: GenshinArtefact) => {
    const text = formatGenshinArtefactShort(artefact);
    navigator.clipboard.writeText(text);
    toast.success("Artefact copié !");
  };

  const copyAllArtefacts = () => {
    if (artefacts.length === 0) return;
    const text = artefacts.map(formatGenshinArtefactShort).join("\n");
    navigator.clipboard.writeText(text);
    toast.success("Tous les artefacts copiés !");
  };

  const calculateProbability = () => {
    if (
      !calculatorType ||
      !calculatorMainStat ||
      calculatorSubStats.length === 0
    ) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    const prob = calculateGenshinArtefactProbability(
      calculatorType,
      calculatorMainStat,
      calculatorSubStats
    );
    setProbability(prob);
  };

  const toggleSubStat = (subStat: string) => {
    setCalculatorSubStats((prev) =>
      prev.includes(subStat)
        ? prev.filter((s) => s !== subStat)
        : [...prev, subStat]
    );
  };

  const stats =
    artefacts.length > 0 ? getGenshinGenerationStats(artefacts) : null;

  // Filtrer et trier les artefacts pour la galerie
  const filteredArtifacts = React.useMemo(() => {
    const filtered = allArtifacts
      .filter((artifact) => {
        // Filtre par recherche
        if (
          searchQuery &&
          !artifact.name.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "name":
            return a.name.localeCompare(b.name);
          case "rarity":
            return (b.details?.rarity || 0) - (a.details?.rarity || 0);
          default:
            return 0;
        }
      });

    return filtered;
  }, [allArtifacts, searchQuery, sortBy]);

  return (
    <div className="bg-gradient-to-br from-slate-50 via-purple-50 to-pink-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      <div className="container mx-auto px-4 space-y-8">
        {/* En-tête */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Simulateur d'Artefacts Genshin
            </h1>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Générez des artefacts aléatoires avec les vraies probabilités du jeu
            Genshin Impact
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger
              value="generator"
              className="flex items-center space-x-2"
            >
              <Dice1 className="h-4 w-4" />
              <span>Générateur</span>
            </TabsTrigger>
            <TabsTrigger
              value="calculator"
              className="flex items-center space-x-2"
            >
              <Calculator className="h-4 w-4" />
              <span>Calculateur</span>
            </TabsTrigger>
            <TabsTrigger
              value="gallery"
              className="flex items-center space-x-2"
            >
              <Grid3X3 className="h-4 w-4" />
              <span>Galerie</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generator" className="space-y-6">
            {/* Sélection du set d'artefacts */}
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5" />
                  <span>Sélection du Set d'Artefacts</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Set d'artefacts (optionnel)</Label>
                    <Select
                      value={selectedSet}
                      onValueChange={setSelectedSet}
                      disabled={isLoadingSets}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isLoadingSets
                              ? "Chargement..."
                              : "Tous les sets (aléatoire)"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          Tous les sets (aléatoire)
                        </SelectItem>
                        {availableSets.map((set) => (
                          <SelectItem key={set} value={set}>
                            {set}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isLoadingSets && (
                      <p className="text-xs text-slate-500">
                        Chargement des sets d'artefacts...
                      </p>
                    )}
                    {!isLoadingSets && availableSets.length > 0 && (
                      <p className="text-xs text-slate-500">
                        {availableSets.length} sets d'artefacts disponibles
                      </p>
                    )}
                  </div>
                  {selectedSet && selectedSet !== "all" && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        <strong>Set sélectionné :</strong> {selectedSet}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Tous les artefacts générés appartiendront à ce set
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Boutons de génération */}
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Génération d'Artefacts</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button
                    onClick={generateSingleArtefact}
                    disabled={isGenerating}
                    size="lg"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Dice1 className="h-5 w-5 mr-2" />
                    Générer 1 Artefact
                  </Button>
                  <Button
                    onClick={() => generateMultiple(10)}
                    disabled={isGenerating}
                    size="lg"
                    variant="outline"
                  >
                    <Dice6 className="h-5 w-5 mr-2" />
                    Générer x10
                  </Button>
                  <Button
                    onClick={() => generateMultiple(50)}
                    disabled={isGenerating}
                    size="lg"
                    variant="outline"
                  >
                    <Grid3X3 className="h-5 w-5 mr-2" />
                    Générer x50
                  </Button>
                </div>
                {isGenerating && (
                  <div className="flex items-center justify-center mt-4">
                    <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                    <span>Génération en cours...</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Statistiques */}
            {stats && (
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Statistiques de Génération</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Statistiques générales */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {stats.total}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-300">
                          Total
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {stats.fourSubStats}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-300">
                          4 Sous-stats
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {stats.threeSubStats}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-300">
                          3 Sous-stats
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {((stats.fourSubStats / stats.total) * 100).toFixed(
                            1
                          )}
                          %
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-300">
                          % 4 Stats
                        </div>
                      </div>
                    </div>

                    {/* Statistiques par set */}
                    {Object.keys(stats.bySet).length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3">
                          Répartition par Set
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {Object.entries(stats.bySet).map(
                            ([setName, count]) => (
                              <div
                                key={setName}
                                className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-700 rounded"
                              >
                                <span className="text-sm font-medium">
                                  {setName}
                                </span>
                                <Badge variant="outline">{count}</Badge>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Liste des artefacts générés */}
            {artefacts.length > 0 && (
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Star className="h-5 w-5" />
                      <span>Artefacts Générés ({artefacts.length})</span>
                    </CardTitle>
                    <Button
                      onClick={copyAllArtefacts}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copier tout
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {artefacts.map((artefact, index) => {
                      const TypeIcon =
                        typeIcons[artefact.type as keyof typeof typeIcons] ||
                        Star;
                      return (
                        <div
                          key={artefact.id}
                          className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 rounded-lg border p-4 hover:shadow-lg transition-shadow"
                        >
                          <div className="space-y-3">
                            {/* Image et nom de l'artefact */}
                            <div className="text-center">
                              <div className="relative w-20 h-20 mx-auto mb-2">
                                {artefact.imageUrl ? (
                                  <Image
                                    src={artefact.imageUrl}
                                    alt={`${artefact.setName} ${artefact.type}`}
                                    fill
                                    className="object-contain rounded-lg"
                                    unoptimized
                                    onError={(e) => {
                                      console.warn(
                                        `Erreur de chargement de l'image: ${artefact.imageUrl}`
                                      );
                                      // Fallback vers l'icône générique
                                      e.currentTarget.style.display = "none";
                                      const fallback = e.currentTarget
                                        .nextElementSibling as HTMLElement;
                                      if (fallback)
                                        fallback.style.display = "flex";
                                    }}
                                  />
                                ) : null}
                                {/* Fallback avec icône générique */}
                                <div
                                  className={`w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center ${
                                    artefact.imageUrl ? "hidden" : "flex"
                                  }`}
                                >
                                  <TypeIcon className="h-10 w-10 text-white" />
                                </div>
                                {/* Overlay pour la rareté 5 étoiles */}
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-bold text-white">
                                    5
                                  </span>
                                </div>
                                {/* Badge pour indiquer si c'est une vraie image */}
                                {artefact.imageUrl && (
                                  <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                    <span className="text-xs text-white">
                                      ✓
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="space-y-1">
                                <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200">
                                  {artefact.type}
                                </h3>
                                {artefact.setName && (
                                  <Badge variant="outline" className="text-xs">
                                    {artefact.setName}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Stat principale */}
                            <div className="text-center">
                              <Badge variant="secondary" className="text-sm">
                                {artefact.mainStat}
                              </Badge>
                            </div>

                            {/* Sous-stats */}
                            <div className="space-y-2">
                              <div className="flex flex-wrap gap-1 justify-center">
                                {artefact.subStats.map((stat, i) => (
                                  <Badge
                                    key={i}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {stat}
                                  </Badge>
                                ))}
                              </div>
                              <div className="text-center">
                                <Badge
                                  variant={
                                    artefact.subStats.length === 4
                                      ? "default"
                                      : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {artefact.subStats.length} sous-stats
                                </Badge>
                              </div>
                            </div>

                            {/* Bouton de copie */}
                            <div className="text-center">
                              <Button
                                onClick={() => copyArtefact(artefact)}
                                variant="ghost"
                                size="sm"
                                className="w-full"
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                Copier
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="calculator" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Calculateur de Probabilités</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Type d'artefact */}
                  <div className="space-y-2">
                    <Label>Type d'artefact</Label>
                    <Select
                      value={calculatorType}
                      onValueChange={setCalculatorType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un type" />
                      </SelectTrigger>
                      <SelectContent>
                        {ARTEFACT_TYPES.map((type) => (
                          <SelectItem key={type.id} value={type.name}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Stat principale */}
                  <div className="space-y-2">
                    <Label>Stat principale</Label>
                    <Select
                      value={calculatorMainStat}
                      onValueChange={setCalculatorMainStat}
                      disabled={!calculatorType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une stat" />
                      </SelectTrigger>
                      <SelectContent>
                        {calculatorType &&
                          ARTEFACT_TYPES.find(
                            (t) => t.name === calculatorType
                          )?.mainStats.map((stat) => (
                            <SelectItem key={stat} value={stat}>
                              {stat}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Sous-stats */}
                <div className="space-y-3">
                  <Label>Sous-stats souhaitées</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {SUB_STATS.filter(
                      (stat) => stat !== calculatorMainStat
                    ).map((stat) => (
                      <div key={stat} className="flex items-center space-x-2">
                        <Checkbox
                          id={stat}
                          checked={calculatorSubStats.includes(stat)}
                          onCheckedChange={() => toggleSubStat(stat)}
                        />
                        <Label htmlFor={stat} className="text-sm">
                          {stat}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={calculateProbability}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculer la Probabilité
                </Button>

                {probability !== null && (
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {(probability * 100).toFixed(6)}%
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                        Probabilité d'obtenir cet artefact
                      </div>
                      <div className="text-xs text-slate-500 mt-2">
                        1 chance sur{" "}
                        {Math.round(1 / probability).toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gallery" className="space-y-6">
            {/* Galerie de tous les artefacts */}
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Grid3X3 className="h-5 w-5" />
                    <span>Galerie des Artefacts</span>
                  </div>
                  {allArtifacts.length > 0 && (
                    <Badge variant="outline" className="text-sm">
                      {allArtifacts.length} sets disponibles
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Filtres et recherche */}
                  {allArtifacts.length > 0 && (
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <Input
                          placeholder="Rechercher un set d'artefacts..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-full sm:w-48">
                          <SelectValue placeholder="Trier par" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="name">Nom (A-Z)</SelectItem>
                          <SelectItem value="rarity">Rareté</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {filteredArtifacts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredArtifacts.map((artifactSet, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 rounded-lg p-4 border"
                        >
                          <div className="space-y-4">
                            {/* Nom du set */}
                            <div className="text-center">
                              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">
                                {artifactSet.name}
                              </h3>
                              {artifactSet.description && (
                                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                                  {artifactSet.description}
                                </p>
                              )}
                            </div>

                            {/* Images des 5 artefacts */}
                            <div className="grid grid-cols-5 gap-2">
                              {[
                                "flower",
                                "plume",
                                "sands",
                                "goblet",
                                "circlet",
                              ].map((type, typeIndex) => {
                                const typeNames = {
                                  flower: "Fleur",
                                  plume: "Plume",
                                  sands: "Sablier",
                                  goblet: "Coupe",
                                  circlet: "Couronne",
                                };

                                const imageUrl = artifactSet.images?.[type];

                                return (
                                  <div key={type} className="text-center">
                                    <div className="relative w-12 h-12 mx-auto mb-1">
                                      {imageUrl ? (
                                        <Image
                                          src={imageUrl}
                                          alt={`${artifactSet.name} ${
                                            typeNames[
                                              type as keyof typeof typeNames
                                            ]
                                          }`}
                                          fill
                                          className="object-contain rounded"
                                          unoptimized
                                        />
                                      ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 rounded flex items-center justify-center">
                                          <span className="text-white text-xs font-bold">
                                            {typeNames[
                                              type as keyof typeof typeNames
                                            ].charAt(0)}
                                          </span>
                                        </div>
                                      )}
                                      {/* Badge de rareté */}
                                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                                        <span className="text-xs font-bold text-white">
                                          5
                                        </span>
                                      </div>
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-slate-300">
                                      {
                                        typeNames[
                                          type as keyof typeof typeNames
                                        ]
                                      }
                                    </p>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Stats principales possibles */}
                            <div className="space-y-2">
                              <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                                Stats principales possibles :
                              </h4>
                              <div className="flex flex-wrap gap-1">
                                {ARTEFACT_TYPES.map((type) => (
                                  <div key={type.id} className="text-xs">
                                    <span className="font-medium text-slate-600 dark:text-slate-400">
                                      {type.name}:
                                    </span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {type.mainStats
                                        .slice(0, 3)
                                        .map((stat) => (
                                          <Badge
                                            key={stat}
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            {stat}
                                          </Badge>
                                        ))}
                                      {type.mainStats.length > 3 && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          +{type.mainStats.length - 3}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : allArtifacts.length > 0 ? (
                    <div className="text-center py-8">
                      <p className="text-slate-600 dark:text-slate-300">
                        Aucun set trouvé avec les filtres actuels
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                        Essayez de modifier votre recherche ou vos filtres
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-slate-600 dark:text-slate-300">
                        Aucun artefact chargé
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Informations sur les probabilités */}
        <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Probabilités du Jeu</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Nombre de sous-stats</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>3 sous-stats</span>
                    <Badge variant="outline">75%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>4 sous-stats</span>
                    <Badge variant="default">25%</Badge>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Types d'artefacts</h4>
                <div className="space-y-1 text-sm">
                  {ARTEFACT_TYPES.map((type) => (
                    <div key={type.id} className="flex justify-between">
                      <span>{type.name}</span>
                      <span className="text-slate-500">20%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
