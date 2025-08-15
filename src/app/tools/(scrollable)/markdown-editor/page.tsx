"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Copy,
  Download,
  Upload,
  FileText,
  Eye,
  EyeOff,
  Split,
  Bold,
  Italic,
  List,
  Link,
  Image,
  Code,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Table,
  RotateCcw,
  Save,
  Settings,
} from "lucide-react";
import { toast } from "sonner";

interface MarkdownToolbarProps {
  onInsert: (text: string, selection?: { start: number; end: number }) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

const MarkdownToolbar = ({ onInsert, textareaRef }: MarkdownToolbarProps) => {
  const getSelection = () => {
    if (!textareaRef.current) return { start: 0, end: 0 };
    return {
      start: textareaRef.current.selectionStart,
      end: textareaRef.current.selectionEnd,
    };
  };

  const insertText = (before: string, after: string = "") => {
    const selection = getSelection();
    const selectedText =
      textareaRef.current?.value.slice(selection.start, selection.end) || "";
    const newText = before + selectedText + after;
    onInsert(newText, selection);
  };

  const insertAtCursor = (text: string) => {
    const selection = getSelection();
    onInsert(text, { start: selection.end, end: selection.end });
  };

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => insertText("# ")}
        title="Titre 1"
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => insertText("## ")}
        title="Titre 2"
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => insertText("### ")}
        title="Titre 3"
      >
        <Heading3 className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      <Button
        variant="ghost"
        size="sm"
        onClick={() => insertText("**", "**")}
        title="Gras"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => insertText("*", "*")}
        title="Italique"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => insertText("`", "`")}
        title="Code inline"
      >
        <Code className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      <Button
        variant="ghost"
        size="sm"
        onClick={() => insertText("- ")}
        title="Liste à puces"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => insertText("1. ")}
        title="Liste numérotée"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => insertText("> ")}
        title="Citation"
      >
        <Quote className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      <Button
        variant="ghost"
        size="sm"
        onClick={() => insertText("[", "](url)")}
        title="Lien"
      >
        <Link className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => insertText("![alt text](", ")")}
        title="Image"
      >
        <Image className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => insertAtCursor("\n```\n\n```\n")}
        title="Bloc de code"
      >
        <Code className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      <Button
        variant="ghost"
        size="sm"
        onClick={() =>
          insertAtCursor(
            "\n| Colonne 1 | Colonne 2 | Colonne 3 |\n|-----------|-----------|-----------|\n| Cellule 1 | Cellule 2 | Cellule 3 |\n"
          )
        }
        title="Tableau"
      >
        <Table className="h-4 w-4" />
      </Button>
    </div>
  );
};

const MarkdownPreview = ({ content }: { content: string }) => {
  const renderMarkdown = (text: string) => {
    // Conversion basique du Markdown en HTML
    let html = text
      // Titres
      .replace(
        /^### (.*$)/gim,
        '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>'
      )
      .replace(
        /^## (.*$)/gim,
        '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>'
      )
      .replace(
        /^# (.*$)/gim,
        '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>'
      )

      // Gras et italique
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')

      // Code inline
      .replace(
        /`(.*?)`/g,
        '<code class="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-sm font-mono">$1</code>'
      )

      // Blocs de code
      .replace(
        /```([\s\S]*?)```/g,
        '<pre class="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg overflow-x-auto my-4"><code class="text-sm font-mono">$1</code></pre>'
      )

      // Liens
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" class="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>'
      )

      // Images
      .replace(
        /!\[([^\]]*)\]\(([^)]+)\)/g,
        '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-4" />'
      )

      // Citations
      .replace(
        /^> (.*$)/gim,
        '<blockquote class="border-l-4 border-slate-300 dark:border-slate-600 pl-4 my-4 italic text-slate-600 dark:text-slate-300">$1</blockquote>'
      )

      // Listes à puces
      .replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>')
      .replace(/(<li.*<\/li>)/, '<ul class="list-disc my-4">$1</ul>')

      // Listes numérotées
      .replace(/^\d+\. (.*$)/gim, '<li class="ml-4">$1</li>')
      .replace(/(<li.*<\/li>)/, '<ol class="list-decimal my-4">$1</ol>')

      // Tableaux basiques
      .replace(/\|(.+)\|/g, (match, content) => {
        const cells = content
          .split("|")
          .map(
            (cell: string) =>
              `<td class="border border-slate-300 dark:border-slate-600 px-3 py-2">${cell.trim()}</td>`
          )
          .join("");
        return `<tr>${cells}</tr>`;
      })
      .replace(
        /(<tr>.*<\/tr>)/,
        '<table class="border-collapse border border-slate-300 dark:border-slate-600 my-4 w-full">$1</table>'
      )

      // Lignes horizontales
      .replace(
        /^---$/gim,
        '<hr class="my-6 border-slate-300 dark:border-slate-600" />'
      )

      // Paragraphes
      .replace(/\n\n/g, '</p><p class="my-2">')
      .replace(/^(?!<[a-z])(.*$)/gim, '<p class="my-2">$1</p>');

    return html;
  };

  return (
    <div
      className="prose prose-slate dark:prose-invert max-w-none p-4"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  );
};

export default function MarkdownEditor() {
  const [content, setContent] = useState("");
  const [viewMode, setViewMode] = useState<"edit" | "preview" | "split">(
    "split"
  );
  const [savedDocuments, setSavedDocuments] = useState<
    Array<{ id: string; name: string; content: string; updatedAt: Date }>
  >([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInsert = useCallback(
    (text: string, selection?: { start: number; end: number }) => {
      if (!textareaRef.current) return;

      const textarea = textareaRef.current;
      const currentValue = textarea.value;
      const currentScrollTop = textarea.scrollTop;

      if (selection) {
        const newValue =
          currentValue.slice(0, selection.start) +
          text +
          currentValue.slice(selection.end);
        setContent(newValue);

        // Restaurer le focus, la position du curseur et le scroll
        setTimeout(() => {
          textarea.focus();
          textarea.scrollTop = currentScrollTop;
          textarea.setSelectionRange(
            selection.start + text.length,
            selection.start + text.length
          );
        }, 0);
      } else {
        setContent(currentValue + text);
      }
    },
    []
  );

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileContent = e.target?.result as string;
        setContent(fileContent);
        toast.success("Fichier chargé !");
      };
      reader.readAsText(file);
    }
  };

  const handleDownload = () => {
    if (!content.trim()) {
      toast.error("Aucun contenu à télécharger");
      return;
    }

    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Document téléchargé !");
  };

  const handleSave = () => {
    const name = prompt("Nom du document :");
    if (name && content.trim()) {
      const newDocument = {
        id: Date.now().toString(),
        name,
        content,
        updatedAt: new Date(),
      };
      setSavedDocuments((prev) => [newDocument, ...prev]);
      toast.success("Document sauvegardé !");
    }
  };

  const handleLoad = (document: (typeof savedDocuments)[0]) => {
    setContent(document.content);
    toast.success(`Document "${document.name}" chargé !`);
  };

  const handleDelete = (id: string) => {
    setSavedDocuments((prev) => prev.filter((doc) => doc.id !== id));
    toast.success("Document supprimé !");
  };

  const clearContent = () => {
    if (content.trim()) {
      if (confirm("Êtes-vous sûr de vouloir effacer tout le contenu ?")) {
        setContent("");
        toast.success("Contenu effacé !");
      }
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="h-screen flex flex-col">
        {/* Barre d'outils principale */}
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Mode d'affichage */}
              <div className="flex items-center space-x-1">
                <Button
                  variant={viewMode === "edit" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("edit")}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Édition
                </Button>
                <Button
                  variant={viewMode === "preview" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("preview")}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Aperçu
                </Button>
                <Button
                  variant={viewMode === "split" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("split")}
                >
                  <Split className="h-4 w-4 mr-2" />
                  Divisé
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="file"
                accept=".md,.markdown,.txt"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button variant="outline" size="sm" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Importer
                  </span>
                </Button>
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={!content.trim()}
              >
                <Download className="h-4 w-4 mr-2" />
                Télécharger
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                disabled={!content.trim()}
              >
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearContent}
                disabled={!content.trim()}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Effacer
              </Button>
            </div>
          </div>
        </div>

        {/* Zone d'édition */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Zone d'édition */}
          {(viewMode === "edit" || viewMode === "split") && (
            <div
              className={`flex flex-col min-h-0 ${
                viewMode === "split" ? "w-1/2" : "w-full"
              }`}
            >
              <MarkdownToolbar
                onInsert={handleInsert}
                textareaRef={textareaRef}
              />
              <div className="flex-1 p-4 overflow-hidden min-h-0">
                <Textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Commencez à écrire votre document Markdown..."
                  className="h-full resize-none font-mono text-sm border-0 focus:ring-0 overflow-y-auto"
                />
              </div>
            </div>
          )}

          {/* Séparateur */}
          {viewMode === "split" && (
            <div className="w-px bg-slate-200 dark:bg-slate-700" />
          )}

          {/* Zone de prévisualisation */}
          {(viewMode === "preview" || viewMode === "split") && (
            <div
              className={`flex flex-col min-h-0 ${
                viewMode === "split" ? "w-1/2" : "w-full"
              }`}
            >
              <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-2">
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4" />
                  <span className="text-sm font-medium">Aperçu</span>
                  <Badge variant="outline" className="text-xs">
                    {content.length} caractères
                  </Badge>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto min-h-0">
                {content.trim() ? (
                  <MarkdownPreview content={content} />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-500">
                    <div className="text-center">
                      <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Aucun contenu à prévisualiser</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Documents sauvegardés */}
        {savedDocuments.length > 0 && (
          <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4">
            <h3 className="text-sm font-medium mb-3">Documents sauvegardés</h3>
            <div className="flex space-x-2 overflow-x-auto">
              {savedDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center space-x-2 p-2 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 min-w-0"
                >
                  <FileText className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm truncate">{doc.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLoad(doc)}
                    className="h-6 w-6 p-0"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(doc.id)}
                    className="h-6 w-6 p-0"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
