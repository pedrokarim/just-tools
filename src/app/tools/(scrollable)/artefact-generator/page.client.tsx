"use client";

import { useCallback, useMemo, useState, type CSSProperties } from "react";
import Image from "next/image";
import { useQueryState } from "nuqs";
import {
  Calculator,
  Crown,
  Dices,
  Feather,
  Flower,
  Hourglass,
  Loader2,
  Star,
  Wine,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { CopyButton } from "@/components/site/copy-button";
import { ToolPage } from "@/components/site/tool-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  calculateGenshinArtefactProbability,
  formatGenshinArtefactShort,
  generateGenshinArtefactWithSet,
  getGenshinGenerationStats,
  type GenshinArtefact,
} from "@/lib/artefact-generator/genshin-api";
import { cn } from "@/lib/utils";

// Les pièces d'artefact, leur icône et leurs stats principales
const ARTEFACT_TYPES: readonly {
  id: string;
  name: string;
  icon: LucideIcon;
  mainStats: readonly string[];
}[] = [
  { id: "flower", name: "Fleur", icon: Flower, mainStats: ["HP"] },
  { id: "plume", name: "Plume", icon: Feather, mainStats: ["ATK"] },
  {
    id: "sands",
    name: "Sablier",
    icon: Hourglass,
    mainStats: ["HP%", "ATK%", "DEF%", "Elemental Mastery", "Energy Recharge"],
  },
  {
    id: "goblet",
    name: "Coupe",
    icon: Wine,
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
    icon: Crown,
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

/** Les jeux d'artefacts servis par `page.tsx`. */
interface ArtifactSetSummary {
  name: string;
  description?: string | null;
  images?: unknown;
  details?: { rarity?: number };
}

interface ArtefactGeneratorClientProps {
  initialArtifacts: ArtifactSetSummary[];
  initialAvailableSets: string[];
}

/** La rareté maximale, la seule que le simulateur tire. */
const MAX_RARITY = 5;

/**
 * L'or des étoiles, repris du jeu. C'est une donnée, comme la rareté qu'il
 * représente, pas une couleur d'interface : il ne suit donc pas les jetons.
 */
const RARITY_STAR_FILL = "#eab308";
const RARITY_STAR_STROKE = "#ca8a04";

function getPieceIcon(pieceName: string) {
  return ARTEFACT_TYPES.find((type) => type.name === pieceName)?.icon ?? Star;
}

function getSetImage(set: ArtifactSetSummary, pieceId: string) {
  return (set.images as Record<string, string> | null | undefined)?.[pieceId];
}

function formatNumber(value: number, fractionDigits = 0) {
  return value.toLocaleString("fr-FR", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

function ArtefactImage({
  src,
  alt,
  icon: Icon,
  sizes,
  className,
}: {
  src?: string;
  alt: string;
  icon: LucideIcon;
  sizes: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={cn(
        "bg-surface rounded-field relative flex shrink-0 items-center justify-center overflow-hidden",
        className
      )}
    >
      {src && !failed ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          unoptimized
          className="object-contain"
          onError={() => setFailed(true)}
        />
      ) : (
        <Icon className="text-fg-subtle size-1/2" aria-hidden="true" />
      )}
    </div>
  );
}

function RarityStars({
  count,
  size = 14,
  reveal = false,
}: {
  count: number;
  size?: number;
  /** Au tirage, les étoiles montent l'une après l'autre, après la carte. */
  reveal?: boolean;
}) {
  return (
    <span
      role="img"
      aria-label={`${count} étoiles`}
      className="inline-flex shrink-0 gap-0.5"
      style={{ color: RARITY_STAR_STROKE }}
    >
      {Array.from({ length: count }, (_, index) => (
        <Star
          key={index}
          size={size}
          fill={RARITY_STAR_FILL}
          aria-hidden="true"
          className={reveal ? "jt-rise" : undefined}
          style={
            reveal ? ({ "--jt-step": index + 3 } as CSSProperties) : undefined
          }
        />
      ))}
    </span>
  );
}

/** Le résultat au centre de la scène. `reveal` n'est vrai que sur un tirage unique. */
function DrawnArtefact({
  artefact,
  reveal,
}: {
  artefact: GenshinArtefact;
  reveal: boolean;
}) {
  return (
    <article
      className={cn(
        "flex w-full max-w-sm min-w-0 flex-col items-center gap-4 text-center",
        reveal && "jt-rise"
      )}
    >
      <ArtefactImage
        src={artefact.imageUrl}
        alt={`${artefact.setName ?? "Artefact"}, ${artefact.type}`}
        icon={getPieceIcon(artefact.type)}
        sizes="9rem"
        className="size-36"
      />
      <RarityStars
        count={artefact.rarity ?? MAX_RARITY}
        size={18}
        reveal={reveal}
      />

      <div className="flex max-w-full min-w-0 flex-col gap-0.5">
        <h2 className="text-fg text-xl font-semibold">{artefact.type}</h2>
        {artefact.setName && (
          <p className="text-fg-muted text-sm break-words">{artefact.setName}</p>
        )}
      </div>

      <dl className="border-border flex w-full min-w-0 flex-col gap-3 border-t pt-4 text-left">
        <div className="flex min-w-0 flex-col gap-0.5">
          <dt className="text-fg-subtle text-xs">Stat principale</dt>
          <dd className="text-fg font-mono text-lg font-medium break-words">
            {artefact.mainStat}
          </dd>
        </div>
        <div className="flex min-w-0 flex-col gap-1.5">
          <dt className="flex items-center justify-between gap-2">
            <span className="text-fg-subtle text-xs">Sous-stats</span>
            <Badge
              variant={artefact.subStats.length === 4 ? "default" : "secondary"}
            >
              {artefact.subStats.length}&nbsp;sous-stats
            </Badge>
          </dt>
          <dd>
            <ul className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-x-4 gap-y-1">
              {artefact.subStats.map((stat) => (
                <li key={stat} className="text-fg text-sm break-words">
                  {stat}
                </li>
              ))}
            </ul>
          </dd>
        </div>
      </dl>

      <CopyButton
        value={formatGenshinArtefactShort(artefact)}
        variant="secondary"
        size="sm"
      />
    </article>
  );
}

function SeriesItem({
  artefact,
  active,
  onSelect,
}: {
  artefact: GenshinArtefact;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <li
      className={cn(
        "rounded-field flex min-w-0 items-center gap-1 border p-2",
        active
          ? "border-primary/25 bg-primary-soft"
          : "border-border hover:bg-surface"
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-current={active ? "true" : undefined}
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-xs text-left"
      >
        <ArtefactImage
          src={artefact.imageUrl}
          alt=""
          icon={getPieceIcon(artefact.type)}
          sizes="3rem"
          className="size-12"
        />
        <span className="flex min-w-0 flex-col">
          <span className="text-fg text-sm font-medium break-words">
            {artefact.type} – {artefact.mainStat}
          </span>
          {artefact.setName && (
            <span
              title={artefact.setName}
              className="text-fg-muted truncate text-xs"
            >
              {artefact.setName}
            </span>
          )}
          <span className="text-fg-subtle text-xs break-words">
            {artefact.subStats.join(", ")}
          </span>
        </span>
      </button>
      <CopyButton
        iconOnly
        value={formatGenshinArtefactShort(artefact)}
        label="Copier cet artefact"
        variant="ghost"
        size="icon-sm"
        className="pointer-coarse:size-11"
      />
    </li>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-fg-muted min-w-0">{label}</dt>
      <dd className="text-fg font-mono tabular-nums">{value}</dd>
    </div>
  );
}

function SetCard({ set }: { set: ArtifactSetSummary }) {
  return (
    <Card className="gap-3 p-4">
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex min-w-0 items-start justify-between gap-2">
          <h3 className="text-fg min-w-0 text-base font-semibold break-words">
            {set.name}
          </h3>
          <span className="pt-1">
            <RarityStars count={MAX_RARITY} size={12} />
          </span>
        </div>
        {set.description && (
          <p className="text-fg-muted text-sm leading-relaxed">
            {set.description}
          </p>
        )}
      </div>

      <ul className="grid grid-cols-[repeat(5,minmax(0,1fr))] gap-2">
        {ARTEFACT_TYPES.map((piece) => (
          <li
            key={piece.id}
            className="flex min-w-0 flex-col items-center gap-1"
          >
            <ArtefactImage
              src={getSetImage(set, piece.id)}
              alt={`${set.name}, ${piece.name}`}
              icon={piece.icon}
              sizes="3.5rem"
              className="aspect-square w-full max-w-14"
            />
            <span
              title={piece.name}
              className="text-fg-muted max-w-full truncate text-[0.6875rem]"
            >
              {piece.name}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export default function ArtefactGeneratorClient({
  initialArtifacts,
  initialAvailableSets,
}: ArtefactGeneratorClientProps) {
  const [artefacts, setArtefacts] = useState<GenshinArtefact[]>([]);
  // L'artefact affiché en grand. Par défaut, le premier de la série.
  const [focusedId, setFocusedId] = useState<string | null>(null);
  // Seul l'artefact d'un tirage unique a droit à son apparition, une seule fois :
  // revenir sur l'onglet ne la rejoue pas.
  const [revealedId, setRevealedId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSet, setSelectedSet] = useState("all");

  // Search params avec nuqs pour chaque onglet
  const [activeTab, setActiveTab] = useQueryState("tab", {
    defaultValue: "generator",
  });
  const [searchQuery, setSearchQuery] = useQueryState("search", {
    defaultValue: "",
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

      const newArtefact = await generateGenshinArtefactWithSet(
        {
          setName: selectedSet === "all" ? undefined : selectedSet,
        },
        initialArtifacts
      );

      setArtefacts([newArtefact]);
      setFocusedId(newArtefact.id);
      setRevealedId(newArtefact.id);
    } catch {
      toast.error("Le tirage a échoué. Réessaie.");
    } finally {
      setIsGenerating(false);
    }
  }, [selectedSet, initialArtifacts]);

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
        setFocusedId(null);
        setRevealedId(null);
      } catch {
        toast.error("Le tirage a échoué. Réessaie.");
      } finally {
        setIsGenerating(false);
      }
    },
    [selectedSet, initialArtifacts]
  );

  const handleTabChange = (tab: string) => {
    setRevealedId(null);
    setActiveTab(tab);
  };

  // Le résultat affiché doit toujours correspondre à ce qui est réglé : changer
  // de pièce invalide la stat principale, et une stat principale ne peut pas être
  // aussi une sous-stat.
  const handlePieceChange = (piece: string) => {
    setCalculatorType(piece);
    setCalculatorMainStat("");
    setProbability(null);
  };

  const handleMainStatChange = (stat: string) => {
    setCalculatorMainStat(stat);
    setCalculatorSubStats((prev) => prev.filter((s) => s !== stat));
    setProbability(null);
  };

  const toggleSubStat = (subStat: string) => {
    setCalculatorSubStats((prev) =>
      prev.includes(subStat)
        ? prev.filter((s) => s !== subStat)
        : [...prev, subStat]
    );
    setProbability(null);
  };

  const calculateProbability = () => {
    if (!calculatorType || !calculatorMainStat) {
      toast.error("Choisis d'abord une pièce et sa stat principale.");
      return;
    }

    if (calculatorSubStats.length !== 3 && calculatorSubStats.length !== 4) {
      toast.error(
        "Coche 3 ou 4 sous-stats : un artefact n'en porte jamais d'autre nombre."
      );
      return;
    }

    setProbability(
      calculateGenshinArtefactProbability(
        calculatorType,
        calculatorMainStat,
        calculatorSubStats
      )
    );
  };

  const focusedArtefact =
    artefacts.find((artefact) => artefact.id === focusedId) ?? artefacts[0];
  const isSeries = artefacts.length > 1;
  const stats = isSeries ? getGenshinGenerationStats(artefacts) : null;
  const pieceMainStats =
    ARTEFACT_TYPES.find((type) => type.name === calculatorType)?.mainStats ?? [];

  // Filtrer et trier les artefacts pour la galerie
  const filteredArtifacts = useMemo(
    () =>
      initialArtifacts
        .filter(
          (artifact) =>
            !searchQuery ||
            artifact.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
          switch (sortBy) {
            case "name":
              return a.name.localeCompare(b.name);
            case "rarity":
              return (b.details?.rarity || 0) - (a.details?.rarity || 0);
            default:
              return 0;
          }
        }),
    [initialArtifacts, searchQuery, sortBy]
  );

  return (
    <ToolPage wide>
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="min-w-0 gap-6"
      >
        <TabsList>
          <TabsTrigger value="generator">Générateur</TabsTrigger>
          <TabsTrigger value="calculator">Calculateur</TabsTrigger>
          <TabsTrigger value="gallery">Galerie</TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="flex min-w-0 flex-col gap-6">
          <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <Card
              aria-live="polite"
              aria-busy={isGenerating}
              className="min-h-[24rem] items-center justify-center p-6 lg:min-h-[32rem]"
            >
              {focusedArtefact ? (
                <DrawnArtefact
                  key={focusedArtefact.id}
                  artefact={focusedArtefact}
                  reveal={focusedArtefact.id === revealedId}
                />
              ) : (
                <div className="flex max-w-xs flex-col items-center gap-3 text-center">
                  <span
                    aria-hidden="true"
                    className="text-border-strong inline-flex gap-1"
                  >
                    {Array.from({ length: MAX_RARITY }, (_, index) => (
                      <Star key={index} size={20} />
                    ))}
                  </span>
                  <p className="text-fg font-medium">
                    Aucun artefact pour l&apos;instant
                  </p>
                  <p className="text-fg-muted text-sm leading-relaxed">
                    Choisis un set si tu en vises un, puis lance un tirage&nbsp;:
                    la pièce, sa stat principale et ses sous-stats
                    s&apos;afficheront ici.
                  </p>
                </div>
              )}
            </Card>

            <div className="flex min-w-0 flex-col gap-5">
              <section aria-label="Tirage" className="flex min-w-0 flex-col gap-4">
                <div className="flex min-w-0 flex-col gap-1.5">
                  <Label htmlFor="artefact-set">Set d&apos;artefacts</Label>
                  <Select value={selectedSet} onValueChange={setSelectedSet}>
                    <SelectTrigger
                      id="artefact-set"
                      className="w-full"
                      title={selectedSet === "all" ? undefined : selectedSet}
                    >
                      <SelectValue placeholder="Tous les sets (aléatoire)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        Tous les sets (aléatoire)
                      </SelectItem>
                      {initialAvailableSets.map((set) => (
                        <SelectItem key={set} value={set}>
                          {set}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-fg-muted text-xs leading-snug">
                    {selectedSet === "all"
                      ? `${initialAvailableSets.length} sets disponibles.`
                      : "Tous les artefacts tirés appartiendront à ce set."}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    size="lg"
                    className="w-full"
                    disabled={isGenerating}
                    onClick={generateSingleArtefact}
                  >
                    {isGenerating ? (
                      <Loader2 className="asc-animate-spin" aria-hidden="true" />
                    ) : (
                      <Dices aria-hidden="true" />
                    )}
                    {isGenerating ? "Tirage en cours…" : "Tirer un artefact"}
                  </Button>
                  <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-2">
                    <Button
                      variant="secondary"
                      className="min-w-0"
                      disabled={isGenerating}
                      onClick={() => generateMultiple(10)}
                    >
                      Tirer ×10
                    </Button>
                    <Button
                      variant="secondary"
                      className="min-w-0"
                      disabled={isGenerating}
                      onClick={() => generateMultiple(50)}
                    >
                      Tirer ×50
                    </Button>
                  </div>
                </div>
              </section>

              {stats && (
                <section
                  aria-labelledby="series-stats"
                  className="border-border flex min-w-0 flex-col gap-3 border-t pt-5"
                >
                  <h2
                    id="series-stats"
                    className="text-fg text-sm font-semibold"
                  >
                    Statistiques de la série
                  </h2>
                  <dl className="flex flex-col gap-1.5 text-sm">
                    <StatRow label="Total" value={String(stats.total)} />
                    <StatRow
                      label="4 sous-stats"
                      value={String(stats.fourSubStats)}
                    />
                    <StatRow
                      label="3 sous-stats"
                      value={String(stats.threeSubStats)}
                    />
                    <StatRow
                      label="Part à 4 sous-stats"
                      value={`${formatNumber(
                        (stats.fourSubStats / stats.total) * 100,
                        1
                      )} %`}
                    />
                  </dl>
                  {Object.keys(stats.bySet).length > 0 && (
                    <details className="min-w-0">
                      <summary className="text-fg cursor-pointer py-3 text-sm font-medium">
                        Répartition par set
                      </summary>
                      <ul className="flex min-w-0 flex-col gap-1.5 pt-1 text-sm">
                        {Object.entries(stats.bySet).map(([setName, count]) => (
                          <li
                            key={setName}
                            className="flex min-w-0 items-baseline justify-between gap-3"
                          >
                            <span
                              title={setName}
                              className="text-fg-muted min-w-0 truncate"
                            >
                              {setName}
                            </span>
                            <span className="text-fg font-mono tabular-nums">
                              {count}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                </section>
              )}
            </div>
          </div>

          {isSeries && (
            <section
              aria-labelledby="series-list"
              className="flex min-w-0 flex-col gap-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 id="series-list" className="text-fg text-sm font-semibold">
                  {artefacts.length}&nbsp;artefacts tirés
                </h2>
                <CopyButton
                  value={() =>
                    artefacts.map(formatGenshinArtefactShort).join("\n")
                  }
                  label="Tout copier"
                  variant="secondary"
                  size="sm"
                />
              </div>
              <ul className="grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-[repeat(2,minmax(0,1fr))] xl:grid-cols-[repeat(3,minmax(0,1fr))]">
                {artefacts.map((artefact) => (
                  <SeriesItem
                    key={artefact.id}
                    artefact={artefact}
                    active={artefact.id === focusedArtefact?.id}
                    onSelect={() => setFocusedId(artefact.id)}
                  />
                ))}
              </ul>
            </section>
          )}
        </TabsContent>

        <TabsContent value="calculator" className="flex min-w-0 flex-col gap-8">
          <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                calculateProbability();
              }}
              className="flex min-w-0 flex-col gap-6"
            >
              <div className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-[repeat(2,minmax(0,1fr))]">
                <div className="flex min-w-0 flex-col gap-1.5">
                  <Label htmlFor="calculator-piece">Pièce</Label>
                  <Select
                    value={calculatorType}
                    onValueChange={handlePieceChange}
                  >
                    <SelectTrigger id="calculator-piece" className="w-full">
                      <SelectValue placeholder="Choisis une pièce" />
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

                <div className="flex min-w-0 flex-col gap-1.5">
                  <Label htmlFor="calculator-main-stat">Stat principale</Label>
                  <Select
                    value={calculatorMainStat}
                    onValueChange={handleMainStatChange}
                    disabled={!calculatorType}
                  >
                    <SelectTrigger id="calculator-main-stat" className="w-full">
                      <SelectValue placeholder="Choisis une stat" />
                    </SelectTrigger>
                    <SelectContent>
                      {pieceMainStats.map((stat) => (
                        <SelectItem key={stat} value={stat}>
                          {stat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <fieldset className="flex min-w-0 flex-col gap-1">
                <legend className="text-fg text-sm font-medium">
                  Sous-stats souhaitées
                </legend>
                <p className="text-fg-muted text-xs leading-snug">
                  Coche 3 ou 4 sous-stats.
                </p>
                <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-x-6 md:grid-cols-[repeat(3,minmax(0,1fr))]">
                  {SUB_STATS.filter((stat) => stat !== calculatorMainStat).map(
                    (stat) => (
                      <label
                        key={stat}
                        className="flex min-h-11 min-w-0 cursor-pointer items-center gap-2.5 text-sm"
                      >
                        <Checkbox
                          checked={calculatorSubStats.includes(stat)}
                          onCheckedChange={() => toggleSubStat(stat)}
                        />
                        <span className="text-fg min-w-0 break-words">
                          {stat}
                        </span>
                      </label>
                    )
                  )}
                </div>
              </fieldset>

              <Button type="submit" className="w-full sm:w-fit">
                <Calculator aria-hidden="true" />
                Calculer la probabilité
              </Button>
            </form>

            <Card aria-live="polite" className="gap-2 p-5">
              {probability !== null ? (
                <div
                  key={probability}
                  className="asc-animate-step-in flex min-w-0 flex-col gap-1"
                >
                  <p className="text-fg-muted text-sm">
                    Probabilité d&apos;obtenir cet artefact
                  </p>
                  <p className="font-display text-fg text-3xl font-semibold tracking-tight tabular-nums break-words">
                    {formatNumber(probability * 100, 6)}&nbsp;%
                  </p>
                  <p className="text-fg-muted text-sm tabular-nums">
                    1&nbsp;chance sur {formatNumber(Math.round(1 / probability))}
                  </p>
                </div>
              ) : (
                <p className="text-fg-muted text-sm leading-relaxed">
                  Choisis une pièce, sa stat principale et 3 ou 4 sous-stats pour
                  connaître tes chances.
                </p>
              )}
            </Card>
          </div>

          <section
            aria-labelledby="game-odds"
            className="border-border flex min-w-0 flex-col gap-4 border-t pt-6"
          >
            <h2 id="game-odds" className="text-fg text-base font-semibold">
              Probabilités du jeu
            </h2>
            <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
              <div className="flex min-w-0 flex-col gap-2">
                <h3 className="text-fg text-sm font-semibold">
                  Nombre de sous-stats
                </h3>
                <dl className="flex flex-col gap-1.5 text-sm">
                  <StatRow label="3 sous-stats" value={"75 %"} />
                  <StatRow label="4 sous-stats" value={"25 %"} />
                </dl>
              </div>
              <div className="flex min-w-0 flex-col gap-2">
                <h3 className="text-fg text-sm font-semibold">
                  Pièces et stats principales possibles
                </h3>
                <ul className="flex min-w-0 flex-col gap-1.5 text-sm">
                  {ARTEFACT_TYPES.map((type) => (
                    <li
                      key={type.id}
                      className="grid grid-cols-[4.5rem_2.75rem_minmax(0,1fr)] gap-x-3"
                    >
                      <span className="text-fg">{type.name}</span>
                      <span className="text-fg-muted font-mono tabular-nums">
                        20&nbsp;%
                      </span>
                      <span className="text-fg-muted min-w-0 break-words">
                        {type.mainStats.join(", ")}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </TabsContent>

        <TabsContent value="gallery" className="flex min-w-0 flex-col gap-4">
          {initialArtifacts.length > 0 && (
            <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                aria-label="Rechercher un set"
                placeholder="Rechercher un set…"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="sm:max-w-sm"
              />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger
                  aria-label="Trier les sets"
                  className="w-full sm:w-48"
                >
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nom (A à Z)</SelectItem>
                  <SelectItem value="rarity">Rareté</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-fg-subtle text-sm tabular-nums sm:ms-auto">
                {filteredArtifacts.length}&nbsp;sur {initialArtifacts.length}
                &nbsp;sets
              </p>
            </div>
          )}

          {filteredArtifacts.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,20rem),1fr))] gap-4">
              {filteredArtifacts.map((artifactSet) => (
                <SetCard key={artifactSet.name} set={artifactSet} />
              ))}
            </div>
          ) : initialArtifacts.length > 0 ? (
            <p className="text-fg-muted py-8 text-sm">
              Aucun set ne correspond à «&nbsp;{searchQuery}&nbsp;». Essaie un
              autre nom.
            </p>
          ) : (
            <p className="text-fg-muted py-8 text-sm">
              Aucun set n&apos;est disponible pour le moment. Recharge la page
              dans quelques instants.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </ToolPage>
  );
}
