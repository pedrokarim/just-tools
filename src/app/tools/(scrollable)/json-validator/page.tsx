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
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* En-tête */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="text-4xl">🔍</div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Validateur JSON
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Validez, formatez et analysez vos fichiers JSON en temps réel
          </p>
        </div>

        {/* Zone principale */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Zone de saisie */}
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>JSON à valider</span>
                </div>
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
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Collez votre JSON ici ou importez un fichier..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[400px] font-mono text-sm resize-none"
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  {input.length} caractères
                </span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClear}
                    disabled={!input}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Effacer
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(input)}
                    disabled={!input}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copier
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Zone de résultat */}
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Code className="h-5 w-5" />
                  <span>Résultat</span>
                </div>
                {result && (
                  <Badge
                    className={result.isValid ? "bg-green-500" : "bg-red-500"}
                  >
                    {result.isValid ? "Valide" : "Invalide"}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!result ? (
                <div className="flex items-center justify-center h-[400px] text-slate-500">
                  <div className="text-center">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Aucun JSON à valider</p>
                  </div>
                </div>
              ) : result.isValid ? (
                <div className="space-y-4">
                  {/* JSON formaté */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">
                        JSON formaté
                      </Label>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowFormatted(!showFormatted)}
                        >
                          {showFormatted ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleFormat}
                        >
                          <Code className="h-4 w-4 mr-2" />
                          Formater
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDownload}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger
                        </Button>
                      </div>
                    </div>
                    {showFormatted && result.formatted && (
                      <Textarea
                        value={result.formatted}
                        readOnly
                        className="min-h-[300px] font-mono text-sm resize-none bg-slate-50 dark:bg-slate-900"
                      />
                    )}
                  </div>

                  {/* Statistiques */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {result.size?.toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-500">octets</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {result.depth}
                      </div>
                      <div className="text-xs text-slate-500">profondeur</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {result.keys}
                      </div>
                      <div className="text-xs text-slate-500">clés</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start space-x-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-red-800 dark:text-red-200">
                        Erreur de validation
                      </h4>
                      <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                        {result.error}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Options de formatage */}
        <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Options de formatage</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Label htmlFor="indent" className="text-sm">
                  Indentation :
                </Label>
                <select
                  id="indent"
                  value={indentSize}
                  onChange={(e) => setIndentSize(Number(e.target.value))}
                  className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-sm"
                >
                  <option value={2}>2 espaces</option>
                  <option value={4}>4 espaces</option>
                  <option value={8}>8 espaces</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations */}
        <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>À propos de JSON</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium">Format JSON</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
                  <li>
                    Les chaînes de caractères doivent être entre guillemets
                    doubles
                  </li>
                  <li>Les nombres peuvent être entiers ou décimaux</li>
                  <li>Les valeurs booléennes sont true ou false</li>
                  <li>Les valeurs null sont autorisées</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Structures de données</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
                  <li>Objets : collections de paires clé-valeur</li>
                  <li>Tableaux : listes ordonnées de valeurs</li>
                  <li>
                    Imbrication : objets et tableaux peuvent être imbriqués
                  </li>
                  <li>Pas de commentaires autorisés</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
