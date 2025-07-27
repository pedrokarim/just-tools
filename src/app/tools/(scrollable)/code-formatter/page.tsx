"use client";

import { useState, useCallback } from "react";
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
  const [options, setOptions] = useState<FormatOptions>({
    indentSize: 2,
    useTabs: false,
    maxLineLength: 80,
    removeTrailingWhitespace: true,
    insertFinalNewline: true,
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const formatCode = useCallback(async () => {
    if (!input.trim()) {
      toast.error("Aucun code à formater");
      return;
    }

    setIsProcessing(true);
    try {
      // Simulation de formatage (dans un vrai projet, vous utiliseriez des bibliothèques comme Prettier)
      let formatted = input;

      // Supprimer les espaces en fin de ligne
      if (options.removeTrailingWhitespace) {
        formatted = formatted.replace(/[ \t]+$/gm, "");
      }

      // Gérer l'indentation
      const indent = options.useTabs ? "\t" : " ".repeat(options.indentSize);

      // Formatage basique selon le langage
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

      // Limiter la longueur des lignes
      if (options.maxLineLength > 0) {
        formatted = wrapLongLines(formatted, options.maxLineLength);
      }

      // Ajouter une nouvelle ligne finale
      if (options.insertFinalNewline && !formatted.endsWith("\n")) {
        formatted += "\n";
      }

      setOutput(formatted);
      toast.success("Code formaté avec succès !");
    } catch (error) {
      toast.error("Erreur lors du formatage");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  }, [input, selectedLanguage, options]);

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

    return lines
      .map((line) => {
        const trimmed = line.trim();
        if (trimmed === "") return "";

        if (trimmed.includes("}")) indentLevel = Math.max(0, indentLevel - 1);
        const indentedLine = indent.repeat(indentLevel) + trimmed;
        if (trimmed.includes("{")) indentLevel++;

        return indentedLine;
      })
      .filter((line) => line !== "")
      .join("\n");
  };

  const formatJSON = (code: string, indent: string): string => {
    try {
      const parsed = JSON.parse(code);
      return JSON.stringify(parsed, null, options.indentSize);
    } catch {
      return code; // Retourner le code original si le JSON est invalide
    }
  };

  const formatHTML = (code: string, indent: string): string => {
    let formatted = code
      .replace(/>\s*</g, ">\n<")
      .replace(/\s*\/>\s*/g, " />\n")
      .replace(/\s*>\s*/g, ">\n");

    const lines = formatted.split("\n");
    let indentLevel = 0;

    return lines
      .map((line) => {
        const trimmed = line.trim();
        if (trimmed === "") return "";

        if (trimmed.startsWith("</"))
          indentLevel = Math.max(0, indentLevel - 1);
        const indentedLine = indent.repeat(indentLevel) + trimmed;
        if (
          trimmed.startsWith("<") &&
          !trimmed.startsWith("</") &&
          !trimmed.endsWith("/>")
        )
          indentLevel++;

        return indentedLine;
      })
      .filter((line) => line !== "")
      .join("\n");
  };

  const formatCSS = (code: string, indent: string): string => {
    let formatted = code
      .replace(/\s*{\s*/g, " {\n")
      .replace(/\s*}\s*/g, "\n}\n")
      .replace(/\s*;\s*/g, ";\n")
      .replace(/\s*:\s*/g, ": ");

    const lines = formatted.split("\n");
    let indentLevel = 0;

    return lines
      .map((line) => {
        const trimmed = line.trim();
        if (trimmed === "") return "";

        if (trimmed.includes("}")) indentLevel = Math.max(0, indentLevel - 1);
        const indentedLine = indent.repeat(indentLevel) + trimmed;
        if (trimmed.includes("{")) indentLevel++;

        return indentedLine;
      })
      .filter((line) => line !== "")
      .join("\n");
  };

  const formatPython = (code: string, indent: string): string => {
    // Python utilise des espaces pour l'indentation
    const pythonIndent = " ".repeat(4);

    let formatted = code
      .replace(/\s*:\s*/g, ":\n")
      .replace(/\s*=\s*/g, " = ")
      .replace(/\s*\+\s*/g, " + ")
      .replace(/\s*-\s*/g, " - ")
      .replace(/\s*\*\s*/g, " * ")
      .replace(/\s*\/\s*/g, " / ");

    const lines = formatted.split("\n");
    let indentLevel = 0;

    return lines
      .map((line) => {
        const trimmed = line.trim();
        if (trimmed === "") return "";

        if (
          trimmed.startsWith("return") ||
          trimmed.startsWith("break") ||
          trimmed.startsWith("continue")
        ) {
          indentLevel = Math.max(0, indentLevel - 1);
        }
        const indentedLine = pythonIndent.repeat(indentLevel) + trimmed;
        if (trimmed.endsWith(":")) indentLevel++;

        return indentedLine;
      })
      .filter((line) => line !== "")
      .join("\n");
  };

  const formatGeneric = (code: string, indent: string): string => {
    // Formatage générique pour les autres langages
    return code
      .replace(/\s*{\s*/g, " {\n")
      .replace(/\s*}\s*/g, "\n}\n")
      .replace(/\s*;\s*/g, ";\n")
      .replace(/\s*,\s*/g, ", ")
      .replace(/\s*=\s*/g, " = ");
  };

  const wrapLongLines = (code: string, maxLength: number): string => {
    const lines = code.split("\n");
    return lines
      .map((line) => {
        if (line.length <= maxLength) return line;

        // Tentative de découpage intelligent
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
      })
      .join("\n");
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileContent = e.target?.result as string;
        setInput(fileContent);

        // Détecter automatiquement le langage basé sur l'extension
        const extension = file.name.split(".").pop()?.toLowerCase();
        const detectedLanguage = languages.find(
          (lang) => lang.extension.slice(1) === extension
        );
        if (detectedLanguage) {
          setSelectedLanguage(detectedLanguage);
        }

        toast.success("Fichier chargé !");
      };
      reader.readAsText(file);
    }
  };

  const handleDownload = () => {
    if (!output.trim()) {
      toast.error("Aucun code formaté à télécharger");
      return;
    }

    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `formatted${selectedLanguage.extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Code téléchargé !");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Code copié dans le presse-papiers !");
  };

  const clearContent = () => {
    setInput("");
    setOutput("");
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* En-tête */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="text-4xl">⚡</div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Formateur de Code
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Formatez automatiquement votre code dans différents langages de
            programmation
          </p>
        </div>

        {/* Contrôles */}
        <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Paramètres</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Langage */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Langage</label>
                <select
                  value={selectedLanguage.id}
                  onChange={(e) => {
                    const lang = languages.find((l) => l.id === e.target.value);
                    if (lang) setSelectedLanguage(lang);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-sm"
                >
                  {languages.map((lang) => (
                    <option key={lang.id} value={lang.id}>
                      {lang.icon} {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Taille d'indentation */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Indentation</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="spaces"
                    checked={!options.useTabs}
                    onChange={() =>
                      setOptions((prev) => ({ ...prev, useTabs: false }))
                    }
                  />
                  <label htmlFor="spaces" className="text-sm">
                    Espaces
                  </label>
                  <input
                    type="radio"
                    id="tabs"
                    checked={options.useTabs}
                    onChange={() =>
                      setOptions((prev) => ({ ...prev, useTabs: true }))
                    }
                  />
                  <label htmlFor="tabs" className="text-sm">
                    Tabulations
                  </label>
                </div>
                {!options.useTabs && (
                  <select
                    value={options.indentSize}
                    onChange={(e) =>
                      setOptions((prev) => ({
                        ...prev,
                        indentSize: Number(e.target.value),
                      }))
                    }
                    className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded text-sm"
                  >
                    <option value={2}>2 espaces</option>
                    <option value={4}>4 espaces</option>
                    <option value={8}>8 espaces</option>
                  </select>
                )}
              </div>

              {/* Longueur de ligne */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Longueur max. de ligne
                </label>
                <input
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
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-sm"
                />
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Actions</label>
                <div className="flex space-x-2">
                  <Button
                    onClick={formatCode}
                    disabled={isProcessing || !input.trim()}
                    className="flex-1"
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
                        <Upload className="h-4 w-4" />
                      </span>
                    </Button>
                  </label>
                </div>
              </div>
            </div>

            {/* Options avancées */}
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <h4 className="text-sm font-medium mb-3">Options avancées</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remove-whitespace"
                    checked={options.removeTrailingWhitespace}
                    onChange={(e) =>
                      setOptions((prev) => ({
                        ...prev,
                        removeTrailingWhitespace: e.target.checked,
                      }))
                    }
                  />
                  <label htmlFor="remove-whitespace" className="text-sm">
                    Supprimer les espaces en fin de ligne
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="final-newline"
                    checked={options.insertFinalNewline}
                    onChange={(e) =>
                      setOptions((prev) => ({
                        ...prev,
                        insertFinalNewline: e.target.checked,
                      }))
                    }
                  />
                  <label htmlFor="final-newline" className="text-sm">
                    Ajouter une nouvelle ligne finale
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Zone de code */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Code source */}
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Code className="h-5 w-5" />
                  <span>Code source</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(input)}
                    disabled={!input}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copier
                  </Button>
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
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Collez votre code ici ou importez un fichier..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[400px] font-mono text-sm resize-none"
              />
              <div className="flex items-center justify-between mt-2 text-sm text-slate-500">
                <span>{input.length} caractères</span>
                <span>{input.split("\n").length} lignes</span>
              </div>
            </CardContent>
          </Card>

          {/* Code formaté */}
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Code formaté</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(output)}
                    disabled={!output}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copier
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    disabled={!output}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Le code formaté apparaîtra ici..."
                value={output}
                readOnly
                className="min-h-[400px] font-mono text-sm resize-none bg-slate-50 dark:bg-slate-900"
              />
              <div className="flex items-center justify-between mt-2 text-sm text-slate-500">
                <span>{output.length} caractères</span>
                <span>{output.split("\n").length} lignes</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informations */}
        <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Langages supportés</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {languages.map((lang) => (
                <div
                  key={lang.id}
                  className={`flex items-center space-x-2 p-2 rounded border ${
                    selectedLanguage.id === lang.id
                      ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700"
                      : "border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <span className="text-lg">{lang.icon}</span>
                  <span className="text-sm font-medium">{lang.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
