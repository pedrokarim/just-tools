"use client";

import { useMemo, useState } from "react";
import ReactCountryFlag from "react-country-flag";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from "@/components/ui/select";
import { Check, Clipboard, Link2, RotateCcw, X } from "lucide-react";
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
  onCopyLink: () => void;
  linkCopied: boolean;
  canCopyLink: boolean;
}

export function SettingsPanel({
  settings,
  onSettingsChange,
  voices,
  overrides,
  onClearOverrides,
  onClearOverride,
  onReset,
  onCopyLink,
  linkCopied,
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

  const hasOverrides = Boolean(
    overrides &&
      (overrides.rate !== undefined ||
        overrides.pitch !== undefined ||
        overrides.volume !== undefined ||
        overrides.voice ||
        overrides.lang)
  );

  const effective = {
    rate: overrides?.rate ?? settings.rate,
    pitch: overrides?.pitch ?? settings.pitch,
    volume: overrides?.volume ?? settings.volume,
  };

  return (
    <div className="space-y-5">
      {hasOverrides && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/30">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-amber-800 dark:text-amber-200">
                <Link2 className="h-4 w-4" />
                Réglages imposés par l&apos;URL
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Actifs pour cette session seulement, vos réglages enregistrés ne
                sont pas modifiés.
              </p>
              <div className="flex flex-wrap gap-1 pt-1">
                {overrides?.voice && (
                  <Badge variant="outline" className="text-[10px]">
                    voix : {overrides.voice}
                  </Badge>
                )}
                {overrides?.lang && (
                  <Badge variant="outline" className="text-[10px]">
                    langue : {overrides.lang}
                  </Badge>
                )}
                {overrides?.rate !== undefined && (
                  <Badge variant="outline" className="text-[10px]">
                    vitesse : {overrides.rate}x
                  </Badge>
                )}
                {overrides?.pitch !== undefined && (
                  <Badge variant="outline" className="text-[10px]">
                    hauteur : {overrides.pitch}
                  </Badge>
                )}
                {overrides?.volume !== undefined && (
                  <Badge variant="outline" className="text-[10px]">
                    volume : {overrides.volume}
                  </Badge>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 shrink-0 p-0"
              onClick={onClearOverrides}
              title="Revenir à mes réglages"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label>Langue</Label>
        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner une langue" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              🌍 Toutes les langues ({voices.length} voix)
            </SelectItem>
            {availableLanguages.map((lang) => {
              const count = voices.filter((voice) =>
                voice.lang.startsWith(lang)
              ).length;
              const info = LANGUAGES.find((item) => item.code === lang);
              const countryCode = LANGUAGE_TO_COUNTRY[lang];

              return (
                <SelectItem key={lang} value={lang}>
                  <div className="flex items-center space-x-2">
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
                      <span className="text-lg">🌐</span>
                    )}
                    <span>{info?.name || lang.toUpperCase()}</span>
                    <span className="text-muted-foreground">
                      ({count} voix)
                    </span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Voix</Label>
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
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner une voix" />
          </SelectTrigger>
          <SelectContent>
            {filteredVoices.map((voice) => (
              <SelectItem key={voice.name} value={voice.name}>
                {voice.name} ({voice.lang})
                {voice.localService ? "" : " ⚡"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          ⚡ = voix en ligne (plus naturelle, nécessite une connexion)
        </p>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label className="flex justify-between">
          Vitesse
          <span className="font-bold text-emerald-600">{effective.rate}x</span>
        </Label>
        <Slider
          value={[effective.rate]}
          onValueChange={([value]) => {
            onClearOverride(["rate"]);
            onSettingsChange((prev) => ({ ...prev, rate: value }));
          }}
          min={0.5}
          max={2}
          step={0.1}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Lent</span>
          <span>Normal</span>
          <span>Rapide</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="flex justify-between">
          Hauteur
          <span className="font-bold text-emerald-600">{effective.pitch}</span>
        </Label>
        <Slider
          value={[effective.pitch]}
          onValueChange={([value]) => {
            onClearOverride(["pitch"]);
            onSettingsChange((prev) => ({ ...prev, pitch: value }));
          }}
          min={0.5}
          max={2}
          step={0.1}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Grave</span>
          <span>Normal</span>
          <span>Aigu</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="flex justify-between">
          Volume
          <span className="font-bold text-emerald-600">{effective.volume}</span>
        </Label>
        <Slider
          value={[effective.volume]}
          onValueChange={([value]) => {
            onClearOverride(["volume"]);
            onSettingsChange((prev) => ({ ...prev, volume: value }));
          }}
          min={0}
          max={1}
          step={0.1}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Silencieux</span>
          <span>Normal</span>
          <span>Fort</span>
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clipboard className="h-4 w-4 text-emerald-500" />
            <span className="text-sm">Récupération automatique</span>
          </div>
          <Switch
            checked={settings.clipboardAutoRead}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              onSettingsChange((prev) => ({
                ...prev,
                clipboardAutoRead: event.target.checked,
              }))
            }
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Récupère le texte du presse-papiers lors d&apos;un copier/coller dans
          la page.
        </p>
      </div>

      <Separator />

      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full"
          onClick={onCopyLink}
          disabled={!canCopyLink}
        >
          {linkCopied ? (
            <Check className="mr-2 h-4 w-4 text-emerald-500" />
          ) : (
            <Link2 className="mr-2 h-4 w-4" />
          )}
          {linkCopied ? "Lien copié" : "Copier le lien de lecture auto"}
        </Button>
        <p className="text-xs text-muted-foreground">
          Génère une URL qui recharge ce texte et démarre la lecture
          automatiquement — c&apos;est le format utilisé par le client de
          raccourci clavier.
        </p>
      </div>

      <Button variant="outline" className="w-full" onClick={onReset}>
        <RotateCcw className="mr-2 h-4 w-4" />
        Réinitialiser
      </Button>
    </div>
  );
}
