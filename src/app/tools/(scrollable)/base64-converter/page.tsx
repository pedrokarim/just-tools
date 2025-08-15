"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Copy, RotateCcw, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function Base64Converter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");

  const handleConvert = () => {
    try {
      if (mode === "encode") {
        const encoded = btoa(input);
        setOutput(encoded);
      } else {
        const decoded = atob(input);
        setOutput(decoded);
      }
    } catch (error) {
      toast.error("Erreur lors de la conversion. Vérifiez votre entrée.");
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copié dans le presse-papiers !");
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
  };

  const handleSwap = () => {
    setInput(output);
    setOutput("");
  };

  const isInputValid = () => {
    if (mode === "encode") return input.length > 0;
    try {
      atob(input);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="w-full space-y-6 p-6">
      {/* Sélecteur de mode */}
      <div className="flex justify-center space-x-2">
        <Button
          variant={mode === "encode" ? "default" : "outline"}
          onClick={() => setMode("encode")}
          className="min-w-[120px]"
        >
          Encoder
        </Button>
        <Button
          variant={mode === "decode" ? "default" : "outline"}
          onClick={() => setMode("decode")}
          className="min-w-[120px]"
        >
          Décoder
        </Button>
      </div>

      {/* Zone de conversion */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Entrée */}
        <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>
                {mode === "encode" ? "Texte à encoder" : "Base64 à décoder"}
              </span>
              <Badge variant="secondary">
                {mode === "encode" ? "Entrée" : "Base64"}
              </Badge>
            </CardTitle>
            <CardDescription>
              {mode === "encode"
                ? "Saisissez le texte que vous souhaitez convertir en Base64"
                : "Collez le texte encodé en Base64 que vous souhaitez décoder"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder={
                mode === "encode"
                  ? "Entrez votre texte ici..."
                  : "Collez votre Base64 ici..."
              }
              value={input}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setInput(e.target.value)
              }
              className="min-h-[200px] resize-none"
            />
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">
                {input.length} caractères
              </span>
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
          </CardContent>
        </Card>

        {/* Bouton de conversion */}
        <div className="flex items-center justify-center lg:flex-col">
          <Button
            onClick={handleConvert}
            disabled={!isInputValid()}
            size="lg"
            className="lg:rotate-90"
          >
            <ArrowRight className="h-5 w-5 mr-2" />
            Convertir
          </Button>
        </div>

        {/* Sortie */}
        <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>
                {mode === "encode" ? "Résultat Base64" : "Texte décodé"}
              </span>
              <Badge variant="secondary">
                {mode === "encode" ? "Base64" : "Sortie"}
              </Badge>
            </CardTitle>
            <CardDescription>
              {mode === "encode"
                ? "Le texte encodé en Base64"
                : "Le texte décodé depuis Base64"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Le résultat apparaîtra ici..."
              value={output}
              readOnly
              className="min-h-[200px] resize-none bg-slate-50 dark:bg-slate-900"
            />
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">
                {output.length} caractères
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(output)}
                disabled={!output}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copier
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-center space-x-4">
        <Button
          variant="outline"
          onClick={handleClear}
          disabled={!input && !output}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Effacer tout
        </Button>
        <Button variant="outline" onClick={handleSwap} disabled={!output}>
          <ArrowRight className="h-4 w-4 mr-2" />
          Échanger
        </Button>
      </div>

      {/* Informations */}
      <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>À propos de Base64</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <p>
            Base64 est un schéma d'encodage qui représente des données binaires
            sous forme de chaîne de caractères ASCII. Il est couramment utilisé
            pour :
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Encoder des images dans des documents HTML/CSS</li>
            <li>Transmettre des données binaires via des protocoles texte</li>
            <li>
              Stocker des données dans des formats qui ne supportent que le
              texte
            </li>
            <li>Encoder des certificats et des clés cryptographiques</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
