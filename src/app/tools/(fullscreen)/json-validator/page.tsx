"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Copy,
  RotateCcw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Code,
  Download,
  Upload,
  Settings,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ValidationResult {
  isValid: boolean;
  error?: string;
  formatted?: string;
  size?: number;
  depth?: number;
  keys?: number;
}

export default function JsonValidator() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [showFormatted, setShowFormatted] = useState(false);
  const [indentSize, setIndentSize] = useState(2);

  const validateJson = (jsonString: string): ValidationResult => {
    if (!jsonString.trim()) {
      return { isValid: false, error: "Aucun contenu à valider" };
    }

    try {
      const parsed = JSON.parse(jsonString);
      const formatted = JSON.stringify(parsed, null, indentSize);

      // Calculer la taille
      const size = new Blob([jsonString]).size;

      // Calculer la profondeur
      const getDepth = (obj: any, currentDepth = 0): number => {
        if (obj === null || typeof obj !== "object") return currentDepth;

        let maxDepth = currentDepth;
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            maxDepth = Math.max(maxDepth, getDepth(obj[key], currentDepth + 1));
          }
        }
        return maxDepth;
      };

      // Compter les clés
      const countKeys = (obj: any): number => {
        if (obj === null || typeof obj !== "object") return 0;

        let count = Object.keys(obj).length;
        for (const key in obj) {
          if (obj.hasOwnProperty(key) && typeof obj[key] === "object") {
            count += countKeys(obj[key]);
          }
        }
        return count;
      };

      return {
        isValid: true,
        formatted,
        size,
        depth: getDepth(parsed),
        keys: countKeys(parsed),
      };
    } catch (error) {
      return {
        isValid: false,
        error:
          error instanceof Error
            ? error.message
            : "Erreur de validation inconnue",
      };
    }
  };

  const handleValidate = () => {
    const validationResult = validateJson(input);
    setResult(validationResult);

    if (validationResult.isValid) {
      toast.success("JSON valide !");
    } else {
      toast.error("JSON invalide");
    }
  };

  const handleFormat = () => {
    if (result?.isValid && result.formatted) {
      setInput(result.formatted);
      toast.success("JSON formaté !");
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copié dans le presse-papiers !");
  };

  const handleClear = () => {
    setInput("");
    setResult(null);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setInput(content);
        toast.success("Fichier chargé !");
      };
      reader.readAsText(file);
    }
  };

  const handleDownload = () => {
    if (!result?.formatted) return;

    const blob = new Blob([result.formatted], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Fichier téléchargé !");
  };

  // Validation automatique lors de la saisie
  useEffect(() => {
    if (input.trim()) {
      const validationResult = validateJson(input);
      setResult(validationResult);
    } else {
      setResult(null);
    }
  }, [input, indentSize]);

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
      {/* Barre d'outils principale */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Separator orientation="vertical" className="h-6" />

            {/* Statut de validation */}
            {result && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Statut:
                </span>
                {result.isValid ? (
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Valide
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="h-3 w-3 mr-1" />
                    Invalide
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Actions principales */}
          <div className="flex items-center space-x-2">
            <input
              type="file"
              accept=".json"
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
              onClick={handleClear}
              disabled={!input}
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
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Label className="text-xs font-medium">Indentation:</Label>
                <Select
                  value={indentSize.toString()}
                  onValueChange={(value) => setIndentSize(Number(value))}
                >
                  <SelectTrigger className="h-8 text-xs w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 espaces</SelectItem>
                    <SelectItem value="4">4 espaces</SelectItem>
                    <SelectItem value="8">8 espaces</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="show-formatted"
                  checked={showFormatted}
                  onChange={(e) => setShowFormatted(e.target.checked)}
                  className="w-3 h-3"
                />
                <Label htmlFor="show-formatted" className="text-xs">
                  Afficher formaté
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Zone de code */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Zone de saisie */}
          <Card className="shadow-sm border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>JSON à valider</span>
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
                placeholder="Collez votre JSON ici ou importez un fichier..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 font-mono text-sm resize-none min-h-0"
              />
            </CardContent>
          </Card>

          {/* Zone de résultat */}
          <Card className="shadow-sm border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Code className="h-4 w-4" />
                  <span>Résultat</span>
                </div>
                <div className="flex items-center space-x-2">
                  {result && (
                    <Badge
                      variant={result.isValid ? "default" : "destructive"}
                      className={
                        result.isValid
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : ""
                      }
                    >
                      {result.isValid ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Valide
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 mr-1" />
                          Invalide
                        </>
                      )}
                    </Badge>
                  )}
                  {result?.isValid && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFormatted(!showFormatted)}
                        className="h-6 px-2"
                      >
                        {showFormatted ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleFormat}
                        className="h-6 px-2"
                      >
                        <Code className="h-3 w-3 mr-1" />
                        Formater
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(result.formatted || "")}
                        className="h-6 px-2"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copier
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDownload}
                        className="h-6 px-2"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Télécharger
                      </Button>
                    </>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {!result ? (
                <div className="flex-1 flex items-center justify-center text-slate-500">
                  <div className="text-center">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Aucun JSON à valider</p>
                  </div>
                </div>
              ) : result.isValid ? (
                <div className="flex-1 flex flex-col space-y-4">
                  {/* JSON formaté */}
                  {showFormatted && result.formatted && (
                    <div className="flex-1 flex flex-col">
                      <Label className="text-xs font-medium mb-2">
                        JSON formaté
                      </Label>
                      <Textarea
                        value={result.formatted}
                        readOnly
                        className="flex-1 font-mono text-sm resize-none min-h-0 bg-slate-50 dark:bg-slate-900"
                      />
                    </div>
                  )}

                  {/* Statistiques */}
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded">
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {result.size ? (result.size / 1024).toFixed(2) : 0} KB
                      </div>
                      <div className="text-slate-500">Taille</div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded">
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {result.depth || 0}
                      </div>
                      <div className="text-slate-500">Profondeur</div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded">
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {result.keys || 0}
                      </div>
                      <div className="text-slate-500">Clés</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <XCircle className="h-12 w-12 mx-auto text-red-500" />
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">
                      JSON invalide
                    </p>
                    <p className="text-xs text-slate-500">{result.error}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
