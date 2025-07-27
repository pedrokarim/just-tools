"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Copy,
  Download,
  Upload,
  FileText,
  Code,
  RotateCcw,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

interface Language {
  id: string;
  name: string;
  extension: string;
  icon: string;
}

const languages: Language[] = [
  { id: "javascript", name: "JavaScript", extension: ".js", icon: "⚡" },
  { id: "typescript", name: "TypeScript", extension: ".ts", icon: "📘" },
  { id: "json", name: "JSON", extension: ".json", icon: "📄" },
  { id: "html", name: "HTML", extension: ".html", icon: "🌐" },
  { id: "css", name: "CSS", extension: ".css", icon: "🎨" },
  { id: "python", name: "Python", extension: ".py", icon: "🐍" },
  { id: "java", name: "Java", extension: ".java", icon: "☕" },
  { id: "cpp", name: "C++", extension: ".cpp", icon: "⚙️" },
  { id: "csharp", name: "C#", extension: ".cs", icon: "🔷" },
  { id: "php", name: "PHP", extension: ".php", icon: "🐘" },
  { id: "go", name: "Go", extension: ".go", icon: "🐹" },
  { id: "rust", name: "Rust", extension: ".rs", icon: "🦀" },
];

interface FormatOptions {
  indentSize: number;
  useTabs: boolean;
  maxLineLength: number;
  removeTrailingWhitespace: boolean;
  insertFinalNewline: boolean;
}

export default function CodeFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(
    languages[0]
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [options, setOptions] = useState<FormatOptions>({
    indentSize: 2,
    useTabs: false,
    maxLineLength: 80,
    removeTrailingWhitespace: true,
    insertFinalNewline: true,
  });

  const formatJavaScript = (code: string, indent: string): string => {
    // Formatage basique pour JavaScript
    let formatted = code
      .replace(/\s*{\s*/g, " {\n")
      .replace(/\s*}\s*/g, "\n}\n")
      .replace(/\s*;\s*/g, ";\n")
      .replace(/\s*,\s*/g, ", ")
      .replace(/\s*=\s*/g, " = ")
      .replace(/\s*\+\s*/g, " + ")
      .replace(/\s*-\s*/g, " - ")
      .replace(/\s*\*\s*/g, " * ")
      .replace(/\s*\/\s*/g, " / ");

    // Ajouter l'indentation
    const lines = formatted.split("\n");
    let indentLevel = 0;
    const formattedLines = lines.map((line) => {
      const trimmed = line.trim();
      if (trimmed.includes("}")) indentLevel = Math.max(0, indentLevel - 1);
      const result = indent.repeat(indentLevel) + trimmed;
      if (trimmed.includes("{")) indentLevel++;
      return result;
    });

    return formattedLines.join("\n");
  };

  const formatJSON = (code: string, indent: string): string => {
    try {
      const parsed = JSON.parse(code);
      return JSON.stringify(parsed, null, indent.length);
    } catch {
      return code; // Retourner le code original si invalide
    }
  };

  const formatHTML = (code: string, indent: string): string => {
    // Formatage basique pour HTML
    let formatted = code
      .replace(/>\s*</g, ">\n<")
      .replace(/\s*\/>\s*/g, " />\n")
      .replace(/\s*>\s*/g, ">\n");

    // Ajouter l'indentation
    const lines = formatted.split("\n");
    let indentLevel = 0;
    const formattedLines = lines.map((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("</")) indentLevel = Math.max(0, indentLevel - 1);
      const result = indent.repeat(indentLevel) + trimmed;
      if (
        trimmed.startsWith("<") &&
        !trimmed.startsWith("</") &&
        !trimmed.endsWith("/>")
      )
        indentLevel++;
      return result;
    });

    return formattedLines.join("\n");
  };

  const formatCSS = (code: string, indent: string): string => {
    // Formatage basique pour CSS
    let formatted = code
      .replace(/\s*{\s*/g, " {\n")
      .replace(/\s*}\s*/g, "\n}\n")
      .replace(/\s*;\s*/g, ";\n")
      .replace(/\s*:\s*/g, ": ");

    // Ajouter l'indentation
    const lines = formatted.split("\n");
    let indentLevel = 0;
    const formattedLines = lines.map((line) => {
      const trimmed = line.trim();
      if (trimmed.includes("}")) indentLevel = Math.max(0, indentLevel - 1);
      const result = indent.repeat(indentLevel) + trimmed;
      if (trimmed.includes("{")) indentLevel++;
      return result;
    });

    return formattedLines.join("\n");
  };

  const formatPython = (code: string, indent: string): string => {
    // Formatage basique pour Python
    let formatted = code
      .replace(/\s*:\s*/g, ":\n")
      .replace(/\s*,\s*/g, ", ")
      .replace(/\s*=\s*/g, " = ")
      .replace(/\s*\+\s*/g, " + ")
      .replace(/\s*-\s*/g, " - ")
      .replace(/\s*\*\s*/g, " * ")
      .replace(/\s*\/\s*/g, " / ");

    // Ajouter l'indentation
    const lines = formatted.split("\n");
    let indentLevel = 0;
    const formattedLines = lines.map((line) => {
      const trimmed = line.trim();
      if (
        trimmed.startsWith("return") ||
        trimmed.startsWith("break") ||
        trimmed.startsWith("continue")
      )
        indentLevel = Math.max(0, indentLevel - 1);
      const result = indent.repeat(indentLevel) + trimmed;
      if (trimmed.endsWith(":")) indentLevel++;
      return result;
    });

    return formattedLines.join("\n");
  };

  const formatGeneric = (code: string, indent: string): string => {
    // Formatage générique pour les autres langages
    let formatted = code
      .replace(/\s*{\s*/g, " {\n")
      .replace(/\s*}\s*/g, "\n}\n")
      .replace(/\s*;\s*/g, ";\n")
      .replace(/\s*,\s*/g, ", ")
      .replace(/\s*=\s*/g, " = ");

    return formatted;
  };

  const wrapLongLines = (code: string, maxLength: number): string => {
    if (maxLength <= 0) return code;

    const lines = code.split("\n");
    const wrappedLines = lines.map((line) => {
      if (line.length <= maxLength) return line;

      // Essayer de couper aux espaces
      const words = line.split(" ");
      const result = [];
      let currentLine = "";

      for (const word of words) {
        if ((currentLine + word).length <= maxLength) {
          currentLine += (currentLine ? " " : "") + word;
        } else {
          if (currentLine) result.push(currentLine);
          currentLine = word;
        }
      }

      if (currentLine) result.push(currentLine);
      return result.join("\n");
    });

    return wrappedLines.join("\n");
  };

  const formatCode = useCallback(() => {
    if (!input.trim()) return;

    setIsProcessing(true);
    try {
      let formatted = input.trim();
      const indent = options.useTabs ? "\t" : " ".repeat(options.indentSize);

      // Appliquer le formatage selon le langage
      switch (selectedLanguage.id) {
        case "javascript":
        case "typescript":
          formatted = formatJavaScript(formatted, indent);
          break;
        case "json":
          formatted = formatJSON(formatted, indent);
          break;
        case "html":
          formatted = formatHTML(formatted, indent);
          break;
        case "css":
          formatted = formatCSS(formatted, indent);
          break;
        case "python":
          formatted = formatPython(formatted, indent);
          break;
        default:
          formatted = formatGeneric(formatted, indent);
      }

      // Appliquer les options supplémentaires
      if (options.removeTrailingWhitespace) {
        formatted = formatted
          .split("\n")
          .map((line) => line.trimEnd())
          .join("\n");
      }

      if (options.maxLineLength > 0) {
        formatted = wrapLongLines(formatted, options.maxLineLength);
      }

      if (options.insertFinalNewline && !formatted.endsWith("\n")) {
        formatted += "\n";
      }

      setOutput(formatted);
      toast.success("Code formaté avec succès !");
    } catch (error) {
      toast.error("Erreur lors du formatage du code");
      console.error("Erreur de formatage:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [input, selectedLanguage, options]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setInput(content);

      // Détecter le langage basé sur l'extension
      const extension = file.name.split(".").pop()?.toLowerCase();
      const detectedLanguage = languages.find(
        (lang) => lang.extension.slice(1) === extension
      );
      if (detectedLanguage) {
        setSelectedLanguage(detectedLanguage);
      }

      toast.success(`Fichier ${file.name} importé avec succès !`);
    };
    reader.readAsText(file);
  };

  const handleDownload = () => {
    if (!output) return;

    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `formatted${selectedLanguage.extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Fichier téléchargé avec succès !");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Code copié dans le presse-papiers !");
  };

  const clearContent = () => {
    setInput("");
    setOutput("");
    toast.success("Contenu effacé");
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
      {/* Barre d'outils principale */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="text-2xl">⚡</div>
              <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Formateur de Code
              </h1>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Langage sélectionné */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Langage:
              </span>
              <Badge variant="secondary" className="text-xs">
                {selectedLanguage.icon} {selectedLanguage.name}
              </Badge>
            </div>
          </div>

          {/* Actions principales */}
          <div className="flex items-center space-x-2">
            <Button
              onClick={formatCode}
              disabled={isProcessing || !input.trim()}
              size="sm"
            >
              <Zap className="h-4 w-4 mr-2" />
              {isProcessing ? "Formatage..." : "Formatter"}
            </Button>
            <input
              type="file"
              accept=".js,.ts,.json,.html,.css,.py,.java,.cpp,.cs,.php,.go,.rs,.txt"
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
              onClick={clearContent}
              disabled={!input && !output}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Effacer
            </Button>
          </div>
        </div>
      </div>

      {/* Zone principale */}
      <div className="flex-1 flex flex-col p-4 space-y-4">
        {/* Paramètres */}
        <Card className="shadow-sm border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Paramètres</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {/* Langage */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Langage</Label>
                <Select
                  value={selectedLanguage.id}
                  onValueChange={(value) => {
                    const lang = languages.find((l) => l.id === value);
                    if (lang) setSelectedLanguage(lang);
                  }}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.id} value={lang.id}>
                        <span className="flex items-center space-x-2">
                          <span>{lang.icon}</span>
                          <span>{lang.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Indentation */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Indentation</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="spaces"
                    checked={!options.useTabs}
                    onChange={() =>
                      setOptions((prev) => ({ ...prev, useTabs: false }))
                    }
                    className="w-3 h-3"
                  />
                  <Label htmlFor="spaces" className="text-xs">
                    Espaces
                  </Label>
                </div>
                {!options.useTabs && (
                  <Select
                    value={options.indentSize.toString()}
                    onValueChange={(value) =>
                      setOptions((prev) => ({
                        ...prev,
                        indentSize: Number(value),
                      }))
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 espaces</SelectItem>
                      <SelectItem value="4">4 espaces</SelectItem>
                      <SelectItem value="8">8 espaces</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Longueur de ligne */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Longueur max.</Label>
                <Input
                  type="number"
                  min="0"
                  max="200"
                  value={options.maxLineLength}
                  onChange={(e) =>
                    setOptions((prev) => ({
                      ...prev,
                      maxLineLength: Number(e.target.value),
                    }))
                  }
                  className="h-8 text-xs"
                />
              </div>

              {/* Options supplémentaires */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Options</Label>
                <div className="space-y-1">
                  <label className="flex items-center space-x-2 text-xs">
                    <input
                      type="checkbox"
                      checked={options.removeTrailingWhitespace}
                      onChange={(e) =>
                        setOptions((prev) => ({
                          ...prev,
                          removeTrailingWhitespace: e.target.checked,
                        }))
                      }
                      className="w-3 h-3"
                    />
                    <span>Supprimer espaces</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs">
                    <input
                      type="checkbox"
                      checked={options.insertFinalNewline}
                      onChange={(e) =>
                        setOptions((prev) => ({
                          ...prev,
                          insertFinalNewline: e.target.checked,
                        }))
                      }
                      className="w-3 h-3"
                    />
                    <span>Nouvelle ligne finale</span>
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Zone de code */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Code source */}
          <Card className="shadow-sm border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Code className="h-4 w-4" />
                  <span>Code source</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-500">
                  <span>{input.length} caractères</span>
                  <span>•</span>
                  <span>{input.split("\n").length} lignes</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <Textarea
                placeholder="Collez votre code ici ou importez un fichier..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 font-mono text-sm resize-none min-h-0"
              />
            </CardContent>
          </Card>

          {/* Code formaté */}
          <Card className="shadow-sm border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Code formaté</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(output)}
                    disabled={!output}
                    className="h-6 px-2"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copier
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDownload}
                    disabled={!output}
                    className="h-6 px-2"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Télécharger
                  </Button>
                  <div className="flex items-center space-x-2 text-xs text-slate-500">
                    <span>{output.length} caractères</span>
                    <span>•</span>
                    <span>{output.split("\n").length} lignes</span>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <Textarea
                placeholder="Le code formaté apparaîtra ici..."
                value={output}
                readOnly
                className="flex-1 font-mono text-sm resize-none min-h-0 bg-slate-50 dark:bg-slate-900"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
