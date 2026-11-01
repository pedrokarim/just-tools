"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Save, Trash2 } from "lucide-react";
import { SAMPLE_TEXTS, type SavedText } from "@/lib/tts-store";

interface LibraryPanelProps {
  savedTexts: SavedText[];
  history: string[];
  canSave: boolean;
  showSaveBox: boolean;
  saveName: string;
  isSaving: boolean;
  onSaveNameChange: (name: string) => void;
  onRequestSave: () => void;
  onConfirmSave: () => void;
  onLoad: (text: string) => void;
  onDelete: (id: string) => void;
  onClearHistory: () => void;
}

/** Une ligne de liste cliquable : charge le texte qu'elle décrit. */
const ROW_CLASS =
  "hover:bg-surface rounded-field min-w-0 cursor-pointer px-2 py-2 text-start transition-colors duration-(--animate-duration-fast)";

const SECTION_CLASS = "border-border flex flex-col gap-1 border-t pt-5";

const TITLE_CLASS = "text-fg font-sans text-sm font-medium tracking-normal";

const formatLength = (length: number) =>
  `${length.toLocaleString("fr-FR")} caractère${length > 1 ? "s" : ""}`;

export function LibraryPanel({
  savedTexts,
  history,
  canSave,
  showSaveBox,
  saveName,
  isSaving,
  onSaveNameChange,
  onRequestSave,
  onConfirmSave,
  onLoad,
  onDelete,
  onClearHistory,
}: LibraryPanelProps) {
  return (
    <div className="flex flex-col gap-5">
      <section aria-label="Sauvegarder" className="flex flex-col gap-2">
        <Button
          variant="secondary"
          className="w-full"
          onClick={onRequestSave}
          disabled={!canSave}
          aria-expanded={showSaveBox}
        >
          <Save aria-hidden="true" />
          Sauvegarder le texte courant
        </Button>

        {showSaveBox && (
          <div className="asc-animate-rise flex min-w-0 gap-2">
            <Input
              value={saveName}
              onChange={(event) => onSaveNameChange(event.target.value)}
              placeholder="Nom du texte…"
              aria-label="Nom du texte"
              onKeyDown={(event) => event.key === "Enter" && onConfirmSave()}
              autoFocus
            />
            <Button
              onClick={onConfirmSave}
              disabled={!saveName.trim() || isSaving}
            >
              {isSaving && (
                <Loader2 className="asc-animate-spin" aria-hidden="true" />
              )}
              Enregistrer
            </Button>
          </div>
        )}
      </section>

      {savedTexts.length > 0 && (
        <section aria-labelledby="tts-saved-title" className={SECTION_CLASS}>
          <h2 id="tts-saved-title" className={TITLE_CLASS}>
            Textes sauvegardés
          </h2>
          <ul className="divide-border -mx-2 flex flex-col divide-y">
            {savedTexts.map((savedText) => (
              <li
                key={savedText.id}
                className="flex min-w-0 items-center gap-1 py-0.5"
              >
                <button
                  type="button"
                  onClick={() => onLoad(savedText.content)}
                  title={`Charger « ${savedText.name} »`}
                  className={`${ROW_CLASS} flex-1`}
                >
                  <span className="text-fg block truncate text-sm font-medium">
                    {savedText.name}
                  </span>
                  <span className="text-fg-subtle block truncate text-xs">
                    {savedText.updatedAt.toLocaleDateString("fr-FR")},{" "}
                    {formatLength(savedText.content.length)}
                  </span>
                </button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="hover:text-danger"
                  onClick={() => onDelete(savedText.id)}
                  aria-label={`Supprimer « ${savedText.name} »`}
                  title="Supprimer"
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="tts-history-title" className={SECTION_CLASS}>
        <div className="flex min-h-9 items-center justify-between gap-3">
          <h2 id="tts-history-title" className={TITLE_CLASS}>
            Historique
          </h2>
          {history.length > 0 && (
            <Button variant="ghost" size="sm" onClick={onClearHistory}>
              Vider
            </Button>
          )}
        </div>

        {history.length === 0 ? (
          <p className="text-fg-muted text-sm leading-relaxed">
            Les 20 derniers textes lus apparaîtront ici.
          </p>
        ) : (
          <ul className="divide-border -mx-2 flex flex-col divide-y">
            {history.map((entry, index) => (
              <li key={`${index}-${entry.slice(0, 24)}`} className="py-0.5">
                <button
                  type="button"
                  onClick={() => onLoad(entry)}
                  title={entry}
                  className={`${ROW_CLASS} w-full`}
                >
                  <span className="text-fg line-clamp-2 text-sm break-words">
                    {entry}
                  </span>
                  <span className="text-fg-subtle mt-0.5 block text-xs">
                    {formatLength(entry.length)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="tts-samples-title" className={SECTION_CLASS}>
        <h2 id="tts-samples-title" className={TITLE_CLASS}>
          Exemples
        </h2>
        <ul className="divide-border -mx-2 flex flex-col divide-y">
          {SAMPLE_TEXTS.map((sample) => (
            <li key={sample.title} className="py-0.5">
              <button
                type="button"
                onClick={() => onLoad(sample.content)}
                className={`${ROW_CLASS} w-full`}
              >
                <span className="text-fg block text-sm font-medium">
                  {sample.title}
                </span>
                <span className="text-fg-subtle block text-xs">
                  {sample.description}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <p className="border-border text-fg-subtle border-t pt-5 text-xs leading-relaxed">
        Ton texte, ton historique, tes textes sauvegardés et tes réglages restent
        dans le stockage local de ton navigateur. Trois choses en sortent, et
        seulement si tu t&apos;en sers&nbsp;: une voix en ligne envoie le texte à
        son fournisseur, la traduction le transmet à un service tiers, et une
        image ajoutée par adresse passe par le serveur de Just Tools.
      </p>
    </div>
  );
}
