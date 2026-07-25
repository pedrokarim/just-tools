"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { History, Loader2, Play, Save, Shield, Trash2 } from "lucide-react";
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
    <div className="space-y-4">
      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full"
          onClick={onRequestSave}
          disabled={!canSave}
        >
          <Save className="mr-2 h-4 w-4" />
          Sauvegarder le texte courant
        </Button>

        <AnimatePresence>
          {showSaveBox && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="flex space-x-2 pt-1">
                <Input
                  value={saveName}
                  onChange={(event) => onSaveNameChange(event.target.value)}
                  placeholder="Nom du texte…"
                  onKeyDown={(event) => event.key === "Enter" && onConfirmSave()}
                  autoFocus
                />
                <Button
                  onClick={onConfirmSave}
                  disabled={!saveName.trim() || isSaving}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {savedTexts.length > 0 && (
        <>
          <Separator />
          <div className="space-y-2">
            <p className="text-sm font-medium">Textes sauvegardés</p>
            {savedTexts.map((savedText) => (
              <div
                key={savedText.id}
                className="flex items-center justify-between gap-2 rounded-lg border bg-muted/40 p-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">
                    {savedText.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {savedText.updatedAt.toLocaleDateString()} •{" "}
                    {savedText.content.length} car.
                  </div>
                </div>
                <div className="flex shrink-0 items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => onLoad(savedText.content)}
                    title="Charger ce texte"
                  >
                    <Play className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 hover:text-red-600"
                    onClick={() => onDelete(savedText.id)}
                    title="Supprimer"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Separator />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 text-sm font-medium">
            <History className="h-4 w-4 text-emerald-500" />
            Historique
          </p>
          {history.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={onClearHistory}
            >
              Vider
            </Button>
          )}
        </div>

        {history.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Les textes lus apparaîtront ici (20 derniers).
          </p>
        ) : (
          history.map((entry, index) => (
            <button
              key={`${index}-${entry.slice(0, 24)}`}
              type="button"
              onClick={() => onLoad(entry)}
              className="w-full rounded-lg border p-2 text-left transition-colors hover:border-emerald-300 hover:bg-emerald-50 dark:hover:border-emerald-400 dark:hover:bg-emerald-950/20"
            >
              <div className="line-clamp-2 text-xs">{entry}</div>
              <div className="mt-1 text-[10px] text-muted-foreground">
                {entry.length} caractères
              </div>
            </button>
          ))
        )}
      </div>

      <Separator />

      <div className="space-y-2">
        <p className="text-sm font-medium">Exemples</p>
        <div className="grid gap-2">
          {SAMPLE_TEXTS.map((sample) => (
            <button
              key={sample.title}
              type="button"
              onClick={() => onLoad(sample.content)}
              className="rounded-lg border p-2 text-left transition-colors hover:border-emerald-300 hover:bg-emerald-50 dark:hover:border-emerald-400 dark:hover:bg-emerald-950/20"
            >
              <div className="text-sm font-medium">{sample.title}</div>
              <div className="text-xs text-muted-foreground">
                {sample.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-2 rounded-lg border p-3">
        <p className="flex items-center gap-2 text-sm font-medium">
          <Shield className="h-4 w-4 text-emerald-500" />
          Confidentialité
        </p>
        <p className="text-xs text-muted-foreground">
          Texte courant, historique, textes sauvegardés et réglages restent dans
          le <strong>localStorage</strong> de votre navigateur. Rien n&apos;est
          envoyé à un serveur (l&apos;OCR et la synthèse tournent en local ; seule
          la traduction, si vous l&apos;utilisez, appelle un service externe).
          « Réinitialiser » efface tout immédiatement.
        </p>
      </div>
    </div>
  );
}
