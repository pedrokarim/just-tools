"use client";

import { useState } from "react";
import { Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useHalftoneStore } from "@/lib/halftone-store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog, PanelSection } from "./panel-parts";

const quoted = (name: string) => `« ${name} »`;

export function PresetsBar() {
  const { sourceImage, presets, savePreset, loadPreset, deletePreset } =
    useHalftoneStore();

  const [isSaving, setIsSaving] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  // Le nom reste après la confirmation : la fenêtre se ferme encore en l'affichant.
  const [deletionTarget, setDeletionTarget] = useState("");

  const presetNames = Object.keys(presets);
  const trimmedName = draftName.trim();

  const handleLoad = (name: string) => {
    loadPreset(name);
    toast.success(`Préréglage ${quoted(name)} chargé.`);
  };

  const handleSave = () => {
    if (!trimmedName) return;
    savePreset(trimmedName);
    toast.success(`Préréglage ${quoted(trimmedName)} enregistré.`);
    setDraftName("");
    setIsSaving(false);
  };

  return (
    <>
      <PanelSection
        title="Préréglages"
        summary={presetNames.length > 0 ? String(presetNames.length) : undefined}
      >
        {presetNames.length > 0 ? (
          <ul className="flex min-w-0 flex-col gap-0.5">
            {presetNames.map((name) => (
              <li key={name} className="flex min-w-0 items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  title={name}
                  onClick={() => handleLoad(name)}
                  className="min-w-0 flex-1 justify-start"
                >
                  <span className="min-w-0 truncate">{name}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Supprimer le préréglage ${name}`}
                  title="Supprimer"
                  onClick={() => {
                    setDeletionTarget(name);
                    setIsDeleting(true);
                  }}
                  className="hover:text-danger pointer-coarse:size-11"
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-fg-muted text-xs leading-snug">
            Enregistre tes calques et leurs réglages pour les retrouver ici.
          </p>
        )}
        <Button
          variant="secondary"
          size="sm"
          className="w-full"
          disabled={!sourceImage}
          onClick={() => setIsSaving(true)}
        >
          <Save aria-hidden="true" />
          Enregistrer ces réglages
        </Button>
      </PanelSection>

      <Dialog open={isSaving} onOpenChange={setIsSaving}>
        <DialogContent>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleSave();
            }}
            className="flex min-w-0 flex-col gap-4"
          >
            <DialogHeader>
              <DialogTitle>Enregistrer un préréglage</DialogTitle>
              <DialogDescription>
                Il garde tous tes calques et leurs réglages, dans ce navigateur.
              </DialogDescription>
            </DialogHeader>
            <div className="flex min-w-0 flex-col gap-1.5">
              <Label htmlFor="halftone-preset-name">Nom du préréglage</Label>
              <Input
                id="halftone-preset-name"
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                autoFocus
              />
              {presets[trimmedName] && (
                <p className="text-warning text-xs leading-snug">
                  Ce nom existe déjà&nbsp;: le préréglage sera remplacé.
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsSaving(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={!trimmedName}>
                Enregistrer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleting}
        onOpenChange={setIsDeleting}
        title={`Supprimer ${quoted(deletionTarget)} ?`}
        description="Ce préréglage sera perdu. Tes calques actuels ne changent pas."
        confirmLabel="Supprimer"
        onConfirm={() => {
          deletePreset(deletionTarget);
          toast.success(`Préréglage ${quoted(deletionTarget)} supprimé.`);
        }}
      />
    </>
  );
}
