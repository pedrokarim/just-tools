"use client";

import {
  Fragment,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import {
  Bold,
  Code,
  Columns2,
  Download,
  Eraser,
  Eye,
  FileText,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  PenLine,
  Quote,
  Save,
  SquareCode,
  Table,
  Trash2,
  Upload,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { renderMarkdown } from "@/lib/markdown";
import { cn } from "@/lib/utils";

/** Soit le texte encadre la sélection, soit un bloc s'insère après elle. */
type FormatAction = { label: string; icon: LucideIcon } & (
  | { before: string; after?: string }
  | { block: string }
);

const FORMAT_GROUPS: FormatAction[][] = [
  [
    { label: "Titre 1", icon: Heading1, before: "# " },
    { label: "Titre 2", icon: Heading2, before: "## " },
    { label: "Titre 3", icon: Heading3, before: "### " },
  ],
  [
    { label: "Gras", icon: Bold, before: "**", after: "**" },
    { label: "Italique", icon: Italic, before: "*", after: "*" },
    { label: "Code en ligne", icon: Code, before: "`", after: "`" },
  ],
  [
    { label: "Liste à puces", icon: List, before: "- " },
    { label: "Liste numérotée", icon: ListOrdered, before: "1. " },
    { label: "Citation", icon: Quote, before: "> " },
  ],
  [
    { label: "Lien", icon: LinkIcon, before: "[", after: "](url)" },
    { label: "Image", icon: ImageIcon, before: "![alt text](", after: ")" },
    { label: "Bloc de code", icon: SquareCode, block: "\n```\n\n```\n" },
    {
      label: "Tableau",
      icon: Table,
      block:
        "\n| Colonne 1 | Colonne 2 | Colonne 3 |\n|-----------|-----------|-----------|\n| Cellule 1 | Cellule 2 | Cellule 3 |\n",
    },
  ],
];

const VIEW_MODES = [
  { id: "edit", label: "Édition", icon: PenLine },
  { id: "preview", label: "Aperçu", icon: Eye },
  { id: "split", label: "Divisé", icon: Columns2 },
] as const;

type ViewMode = (typeof VIEW_MODES)[number]["id"];

interface SavedDocument {
  id: string;
  name: string;
  content: string;
}

const EXAMPLE = `# Note de version

Just Tools accueille un **éditeur Markdown** : écris d'un côté, le rendu suit à chaque frappe.

## Ce qui change

Tu peux mettre un mot en *italique*, citer une commande comme \`bun dev\` ou ajouter un [lien](https://example.com).

> Ton texte reste dans ton navigateur : rien n'est envoyé à un serveur.

- Les listes, à puces ou numérotées
- Les blocs de code et les images
- Les tableaux

| Syntaxe | Effet |
|---------|-------|
| Deux astérisques | Gras |
| Un astérisque | Italique |

Sauvegarde le document, ou télécharge-le une fois terminé.`;

const EDITOR_FIELD =
  "h-full min-h-0 resize-none rounded-none! border-0 px-3 py-3 font-mono field-sizing-fixed focus-visible:shadow-[inset_0_0_0_1px_var(--asc-primary)] sm:px-5 lg:px-6";

const formatCount = (count: number, unit: string) =>
  `${count.toLocaleString("fr-FR")} ${unit}${count > 1 ? "s" : ""}`;

function MarkdownPreview({ content }: { content: string }) {
  return (
    <div
      className="jt-prose max-w-3xl px-3 py-3 sm:px-5 lg:px-6"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  );
}

export default function MarkdownEditor() {
  const [content, setContent] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [savedDocuments, setSavedDocuments] = useState<SavedDocument[]>([]);
  const [openDialog, setOpenDialog] = useState<"save" | "clear" | null>(null);
  const [documentName, setDocumentName] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const showEditor = viewMode !== "preview";
  const showPreview = viewMode !== "edit";
  const isSplit = viewMode === "split";
  const hasContent = Boolean(content.trim());

  const applyFormat = (action: FormatAction) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd, scrollTop, value } = textarea;
    const isBlock = "block" in action;
    const start = isBlock ? selectionEnd : selectionStart;
    const inserted = isBlock
      ? action.block
      : action.before +
        value.slice(selectionStart, selectionEnd) +
        (action.after ?? "");

    setContent(value.slice(0, start) + inserted + value.slice(selectionEnd));

    // Restaurer le focus, la position du curseur et le défilement
    setTimeout(() => {
      textarea.focus();
      textarea.scrollTop = scrollTop;
      textarea.setSelectionRange(
        start + inserted.length,
        start + inserted.length
      );
    }, 0);
  };

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Sans cette remise à zéro, réimporter le même fichier ne déclenche rien.
    event.target.value = "";
    if (!file) return;

    try {
      setContent(await file.text());
    } catch {
      toast.error("Lecture impossible. Vérifie le fichier, puis réessaie.");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "document.md";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const openSaveDialog = () => {
    setDocumentName("");
    setOpenDialog("save");
  };

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = documentName.trim();
    if (!name) return;

    setSavedDocuments((previous) => [
      { id: Date.now().toString(), name, content },
      ...previous,
    ]);
    setOpenDialog(null);
  };

  const handleClear = () => {
    setContent("");
    setOpenDialog(null);
  };

  const handleDelete = (id: string) =>
    setSavedDocuments((previous) => previous.filter((doc) => doc.id !== id));

  return (
    // La coquille défilante ne donne pas de hauteur à la page : on retire celle
    // de l'en-tête pour que l'éditeur tienne dans la fenêtre, sans double défilement.
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-border flex shrink-0 flex-wrap items-center gap-2 border-b px-3 py-2 sm:px-5 lg:px-6">
        <div
          role="group"
          aria-label="Affichage"
          className="flex min-w-0 items-center gap-1"
        >
          {VIEW_MODES.map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant={viewMode === id ? "soft" : "ghost"}
              size="sm"
              title={label}
              aria-pressed={viewMode === id}
              className={cn(viewMode !== id && "border border-transparent")}
              onClick={() => setViewMode(id)}
            >
              <Icon aria-hidden="true" />
              <span className="max-[1400px]:sr-only">{label}</span>
            </Button>
          ))}
        </div>

        {showEditor && (
          <>
            <Separator
              orientation="vertical"
              className="data-[orientation=vertical]:h-6 max-xl:hidden"
            />
            <div
              role="group"
              aria-label="Mise en forme"
              className="flex min-w-0 flex-wrap items-center gap-1 max-xl:order-last max-xl:w-full"
            >
              {FORMAT_GROUPS.map((group, index) => (
                <Fragment key={group[0].label}>
                  {index > 0 && (
                    <Separator
                      orientation="vertical"
                      className="mx-1 data-[orientation=vertical]:h-6 max-sm:hidden"
                    />
                  )}
                  {group.map((action) => (
                    <Button
                      key={action.label}
                      variant="ghost"
                      size="icon-sm"
                      aria-label={action.label}
                      title={action.label}
                      onClick={() => applyFormat(action)}
                    >
                      <action.icon aria-hidden="true" />
                    </Button>
                  ))}
                </Fragment>
              ))}
            </div>
          </>
        )}

        <div className="ms-auto flex min-w-0 flex-wrap items-center gap-1">
          <input
            ref={fileInput}
            type="file"
            accept=".md,.markdown,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Importer un fichier"
            title="Importer un fichier"
            onClick={() => fileInput.current?.click()}
          >
            <Upload aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Télécharger le document"
            title="Télécharger le document"
            onClick={handleDownload}
            disabled={!hasContent}
          >
            <Download aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Sauvegarder le document"
            title="Sauvegarder le document"
            onClick={openSaveDialog}
            disabled={!hasContent}
          >
            <Save aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Effacer"
            title="Effacer"
            onClick={() => setOpenDialog("clear")}
            disabled={!hasContent}
          >
            <Eraser aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "grid min-h-0 flex-1 grid-cols-1",
          isSplit ? "grid-rows-2 md:grid-cols-2 md:grid-rows-1" : "grid-rows-1"
        )}
      >
        {showEditor && (
          <Textarea
            ref={textareaRef}
            aria-label="Texte Markdown"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Commence à écrire ton document Markdown…"
            className={EDITOR_FIELD}
          />
        )}

        {showPreview && (
          <section
            aria-label="Aperçu"
            tabIndex={0}
            className={cn(
              "bg-surface flex min-h-0 min-w-0 flex-col overflow-auto focus-visible:-outline-offset-2",
              isSplit && "max-md:border-t md:border-s"
            )}
          >
            {hasContent ? (
              <MarkdownPreview content={content} />
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
                <p className="text-fg-muted max-w-xs text-sm text-pretty">
                  Écris du Markdown ou importe un fichier&nbsp;: le rendu
                  s&apos;affiche ici à chaque frappe.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setContent(EXAMPLE)}
                >
                  Essayer un exemple
                </Button>
              </div>
            )}
          </section>
        )}
      </div>

      <div className="border-border flex min-h-9 shrink-0 items-center gap-4 border-t px-3 py-1.5 sm:px-5 lg:px-6">
        <span className="text-fg-subtle shrink-0 text-xs tabular-nums">
          {formatCount(content.length, "caractère")}
        </span>

        {savedDocuments.length > 0 && (
          // Le débord négatif garde l'anneau de focus des boutons dans la zone
          // visible : ce conteneur coupe tout ce qui dépasse.
          <ul
            aria-label="Documents sauvegardés"
            className="asc-animate-fade -m-1 flex min-w-0 flex-1 items-center gap-2 overflow-x-auto overflow-y-hidden p-1"
          >
            {savedDocuments.map((doc) => (
              <li
                key={doc.id}
                className="border-border bg-surface rounded-field flex max-w-56 min-w-0 shrink-0 items-center border"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  title={doc.name}
                  aria-label={`Ouvrir « ${doc.name} »`}
                  className="min-w-0 flex-1 justify-start"
                  onClick={() => setContent(doc.content)}
                >
                  <FileText aria-hidden="true" />
                  <span className="min-w-0 truncate">{doc.name}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Supprimer « ${doc.name} »`}
                  title="Supprimer"
                  onClick={() => handleDelete(doc.id)}
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog
        open={openDialog === "save"}
        onOpenChange={(open) => !open && setOpenDialog(null)}
      >
        <DialogContent>
          <form onSubmit={handleSave} className="flex min-w-0 flex-col gap-4">
            <DialogHeader>
              <DialogTitle>Sauvegarder le document</DialogTitle>
              <DialogDescription>
                Il reste disponible au bas de l&apos;éditeur tant que cette page
                est ouverte. Pour le conserver, télécharge-le.
              </DialogDescription>
            </DialogHeader>
            <div className="flex min-w-0 flex-col gap-2">
              <Label htmlFor="document-name">Nom du document</Label>
              <Input
                id="document-name"
                value={documentName}
                onChange={(event) => setDocumentName(event.target.value)}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="ghost">
                  Annuler
                </Button>
              </DialogClose>
              <Button type="submit" disabled={!documentName.trim()}>
                Sauvegarder
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={openDialog === "clear"}
        onOpenChange={(open) => !open && setOpenDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Effacer tout le contenu&nbsp;?</DialogTitle>
            <DialogDescription>
              Ce que tu n&apos;as ni sauvegardé ni téléchargé sera perdu.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Annuler
              </Button>
            </DialogClose>
            <Button type="button" variant="destructive" onClick={handleClear}>
              Effacer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
