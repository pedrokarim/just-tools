"use client";

import { useMemo, useState } from "react";
import ReactCountryFlag from "react-country-flag";
import { CopyButton } from "@/components/site/copy-button";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from "@/components/ui/select";
import { RotateCcw } from "lucide-react";
import { LANGUAGES } from "@/lib/language-data";
import { LANGUAGE_TO_COUNTRY, type TtsSettings } from "@/lib/tts-store";
import type { SpeechOverrides } from "@/hooks/use-tts-player";

interface SettingsPanelProps {
  settings: TtsSettings;
  onSettingsChange: (updater: (prev: TtsSettings) => TtsSettings) => void;
  voices: SpeechSynthesisVoice[];
  /** Surcharges issues de l'URL, actives pour la session uniquement. */
  overrides?: SpeechOverrides;
  onClearOverrides: () => void;
  /** Lève la surcharge d'un réglage précis quand l'utilisateur y touche. */
  onClearOverride: (keys: (keyof SpeechOverrides)[]) => void;
  onReset: () => void;
  /** Construit le lien de lecture automatique au moment de la copie. */
  getShareLink: () => string;
  canCopyLink: boolean;
}

const formatNumber = (value: number) =>
  value.toLocaleString("fr-FR", { maximumFractionDigits: 2 });

const formatRate = (value: number) => `${formatNumber(value)}x`;

const formatVolume = (value: number) => `${Math.round(value * 100)} %`;

const SLIDERS: {
  key: "rate" | "pitch" | "volume";
  label: string;
  min: number;
  max: number;
  format: (value: number) => string;
}[] = [
  { key: "rate", label: "Vitesse", min: 0.5, max: 2, format: formatRate },
  { key: "pitch", label: "Hauteur", min: 0.5, max: 2, format: formatNumber },
  { key: "volume", label: "Volume", min: 0, max: 1, format: formatVolume },
];

const SHORTCUTS = [
  { action: "Lire", keys: "Ctrl + Entrée" },
  { action: "Lire ou mettre en pause", keys: "Ctrl + Espace" },
  { action: "Reculer ou avancer de 10 s", keys: "Ctrl + flèches" },
];

const SECTION_CLASS = "border-border flex flex-col gap-4 border-t pt-5";

const HINT_CLASS = "text-fg-muted text-xs leading-relaxed";

/** Une voix au nom très long ne doit pas pousser la liste hors de l'écran. */
const SELECT_CONTENT_CLASS = "max-w-[calc(100vw-2rem)]";

export function SettingsPanel({
  settings,
  onSettingsChange,
  voices,
  overrides,
  onClearOverrides,
  onClearOverride,
  onReset,
  getShareLink,
  canCopyLink,
}: SettingsPanelProps) {
  const [selectedLanguage, setSelectedLanguage] = useState("all");

  const availableLanguages = useMemo(() => {
    const languages = new Set<string>();
    voices.forEach((voice) => languages.add(voice.lang.split("-")[0]));
    return Array.from(languages).sort();
  }, [voices]);

  const filteredVoices = useMemo(() => {
    if (selectedLanguage === "all") return voices;
    return voices.filter((voice) => voice.lang.startsWith(selectedLanguage));
  }, [voices, selectedLanguage]);

  const activeOverrides = [
    overrides?.voice && `voix ${overrides.voice}`,
    overrides?.lang && `langue ${overrides.lang}`,
    overrides?.rate !== undefined && `vitesse ${formatRate(overrides.rate)}`,
    overrides?.pitch !== undefined && `hauteur ${formatNumber(overrides.pitch)}`,
    overrides?.volume !== undefined && `volume ${formatVolume(overrides.volume)}`,
  ].filter(Boolean);

  const effective = {
    rate: overrides?.rate ?? settings.rate,
    pitch: overrides?.pitch ?? settings.pitch,
    volume: overrides?.volume ?? settings.volume,
  };

  return (
    <div className="flex flex-col gap-5">
      {activeOverrides.length > 0 && (
        <div className="border-warning/30 bg-warning-soft text-warning-soft-fg rounded-field flex min-w-0 flex-col items-start gap-2 border p-3">
          <p className="text-sm font-medium">Réglages imposés par le lien</p>
          <p className="min-w-0 text-[0.8125rem] leading-snug break-words">
            Pour cette session&nbsp;: {activeOverrides.join(", ")}. Tes réglages
            enregistrés ne changent pas.
          </p>
          <Button variant="outline" size="sm" onClick={onClearOverrides}>
            Revenir à mes réglages
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="tts-language">Langue</Label>
        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
          <SelectTrigger id="tts-language" className="w-full">
            <SelectValue placeholder="Choisis une langue" />
          </SelectTrigger>
          <SelectContent className={SELECT_CONTENT_CLASS}>
            <SelectItem value="all">
              Toutes les langues ({voices.length}&nbsp;voix)
            </SelectItem>
            {availableLanguages.map((lang) => {
              const count = voices.filter((voice) =>
                voice.lang.startsWith(lang)
              ).length;
              const info = LANGUAGES.find((item) => item.code === lang);
              const countryCode = LANGUAGE_TO_COUNTRY[lang];

              return (
                <SelectItem key={lang} value={lang}>
                  <span className="flex min-w-0 items-center gap-2">
                    {countryCode ? (
                      <ReactCountryFlag
                        countryCode={countryCode}
                        svg
                        style={{
                          width: "20px",
                          height: "15px",
                          borderRadius: "2px",
                        }}
                      />
                    ) : (
                      // Garde l'alignement des libellés quand le drapeau manque.
                      <span aria-hidden="true" className="w-5 shrink-0" />
                    )}
                    <span>{info?.name || lang.toUpperCase()}</span>
                    <span className="text-fg-subtle">({count}&nbsp;voix)</span>
                  </span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="tts-voice">Voix</Label>
        <Select
          value={
            filteredVoices.some((voice) => voice.name === settings.selectedVoice)
              ? settings.selectedVoice
              : ""
          }
          onValueChange={(value) => {
            // Choisir une voix à la main annule la voix imposée par l'URL.
            onClearOverride(["voice", "lang"]);
            onSettingsChange((prev) => ({ ...prev, selectedVoice: value }));
          }}
        >
          <SelectTrigger
            id="tts-voice"
            className="w-full"
            title={settings.selectedVoice || undefined}
          >
            <SelectValue placeholder="Choisis une voix" />
          </SelectTrigger>
          <SelectContent className={SELECT_CONTENT_CLASS}>
            {filteredVoices.map((voice) => (
              <SelectItem key={voice.name} value={voice.name}>
                {voice.name} ({voice.lang})
                {voice.localService ? "" : ", en ligne"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className={HINT_CLASS}>
          Les voix «&nbsp;en ligne&nbsp;» sont plus naturelles, mais demandent une
          connexion.
        </p>
      </div>

      <div className={SECTION_CLASS}>
        {SLIDERS.map(({ key, label, min, max, format }) => (
          <div key={key} className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between gap-3">
              <Label htmlFor={`tts-${key}`}>{label}</Label>
              <span className="text-fg font-mono text-sm tabular-nums">
                {format(effective[key])}
              </span>
            </div>
            <Slider
              id={`tts-${key}`}
              aria-label={label}
              value={[effective[key]]}
              onValueChange={([value]) => {
                onClearOverride([key]);
                onSettingsChange((prev) => ({ ...prev, [key]: value }));
              }}
              min={min}
              max={max}
              step={0.1}
            />
          </div>
        ))}
      </div>

      <div className="border-border flex flex-col gap-1 border-t pt-4">
        <Switch
          label="Récupération automatique"
          checked={settings.clipboardAutoRead}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            onSettingsChange((prev) => ({
              ...prev,
              clipboardAutoRead: event.target.checked,
            }))
          }
        />
        <p className={HINT_CLASS}>
          Reprend le contenu du presse-papiers à chaque copier ou coller dans la
          page.
        </p>
      </div>

      <div className="border-border flex flex-col gap-2 border-t pt-5">
        <CopyButton
          variant="secondary"
          className="w-full"
          value={getShareLink}
          disabled={!canCopyLink}
          label="Copier le lien de lecture"
          copiedLabel="Lien copié"
        />
        <p className={HINT_CLASS}>
          Ce lien ouvre l&apos;outil avec ton texte et lance la lecture.
        </p>
      </div>

      <section
        aria-labelledby="tts-shortcuts-title"
        className="border-border flex flex-col gap-2.5 border-t pt-5 pointer-coarse:hidden"
      >
        <h2
          id="tts-shortcuts-title"
          className="text-fg font-sans text-sm font-medium tracking-normal"
        >
          Raccourcis clavier
        </h2>
        <dl className="flex flex-col gap-1.5 text-xs">
          {SHORTCUTS.map(({ action, keys }) => (
            <div
              key={keys}
              className="flex min-w-0 items-center justify-between gap-3"
            >
              <dt className="text-fg-muted min-w-0">{action}</dt>
              <dd className="shrink-0">
                <kbd className="border-border bg-surface text-fg-muted rounded-xs border px-1.5 py-0.5 font-mono">
                  {keys}
                </kbd>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="border-border border-t pt-3">
        <Button variant="ghost" className="w-full" onClick={onReset}>
          <RotateCcw aria-hidden="true" />
          Réinitialiser
        </Button>
      </div>
    </div>
  );
}
