"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Copy,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Zap,
  Shield,
  Lock,
  Key,
  Settings,
} from "lucide-react";
import { toast } from "sonner";

interface PasswordOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeSimilar: boolean;
  excludeAmbiguous: boolean;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  description: string;
}

export default function PasswordGenerator() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: false,
    excludeAmbiguous: false,
  });

  const generatePassword = useCallback(() => {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";
    const similar = "il1Lo0O";
    const ambiguous = "{}[]()/\\'\"`~,;:.<>";

    let charset = "";
    if (options.includeUppercase) charset += uppercase;
    if (options.includeLowercase) charset += lowercase;
    if (options.includeNumbers) charset += numbers;
    if (options.includeSymbols) charset += symbols;

    if (options.excludeSimilar) {
      charset = charset
        .split("")
        .filter((char) => !similar.includes(char))
        .join("");
    }

    if (options.excludeAmbiguous) {
      charset = charset
        .split("")
        .filter((char) => !ambiguous.includes(char))
        .join("");
    }

    if (charset.length === 0) {
      toast.error("Veuillez sélectionner au moins un type de caractères");
      return;
    }

    let generatedPassword = "";
    for (let i = 0; i < options.length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      generatedPassword += charset[randomIndex];
    }

    setPassword(generatedPassword);
  }, [options]);

  const copyToClipboard = () => {
    if (password) {
      navigator.clipboard.writeText(password);
      toast.success("Mot de passe copié dans le presse-papiers !");
    }
  };

  const getPasswordStrength = (): PasswordStrength => {
    if (!password) {
      return {
        score: 0,
        label: "Aucun",
        color: "bg-gray-500",
        description: "Aucun mot de passe généré",
      };
    }

    let score = 0;
    let feedback = [];

    // Longueur
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;

    // Complexité
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    // Variété des caractères
    const uniqueChars = new Set(password).size;
    if (uniqueChars >= password.length * 0.7) score += 1;

    if (score <= 2) {
      return {
        score,
        label: "Faible",
        color: "bg-red-500",
        description: "Facilement devinable",
      };
    } else if (score <= 4) {
      return {
        score,
        label: "Moyen",
        color: "bg-yellow-500",
        description: "Peut être amélioré",
      };
    } else if (score <= 6) {
      return {
        score,
        label: "Fort",
        color: "bg-green-500",
        description: "Bon niveau de sécurité",
      };
    } else {
      return {
        score,
        label: "Très Fort",
        color: "bg-emerald-500",
        description: "Excellent niveau de sécurité",
      };
    }
  };

  const strength = getPasswordStrength();

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* En-tête */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="text-4xl">🔐</div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Générateur de Mots de Passe
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Créez des mots de passe sécurisés et uniques pour protéger vos
            comptes en ligne
          </p>
        </div>

        {/* Mot de passe généré */}
        <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Key className="h-5 w-5" />
              <span>Mot de passe généré</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  readOnly
                  placeholder="Cliquez sur 'Générer' pour créer un mot de passe"
                  className="text-lg font-mono pr-12"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Button onClick={copyToClipboard} disabled={!password}>
                <Copy className="h-4 w-4 mr-2" />
                Copier
              </Button>
              <Button onClick={generatePassword} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Générer
              </Button>
            </div>

            {/* Force du mot de passe */}
            {password && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Force du mot de passe :
                  </span>
                  <Badge className={`${strength.color} text-white`}>
                    {strength.label}
                  </Badge>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className={`${strength.color} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${(strength.score / 8) * 100}%` }}
                  />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {strength.description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Options de génération */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Paramètres principaux */}
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Paramètres</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Longueur */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="length" className="text-sm font-medium">
                    Longueur : {options.length} caractères
                  </Label>
                  <Badge variant="outline">{options.length}</Badge>
                </div>
                <Slider
                  id="length"
                  min={4}
                  max={64}
                  step={1}
                  value={[options.length]}
                  onValueChange={([value]) =>
                    setOptions((prev) => ({ ...prev, length: value }))
                  }
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>4</span>
                  <span>8</span>
                  <span>16</span>
                  <span>32</span>
                  <span>64</span>
                </div>
              </div>

              <Separator />

              {/* Types de caractères */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Types de caractères
                </Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="uppercase"
                      checked={options.includeUppercase}
                      onChange={(e) =>
                        setOptions((prev) => ({
                          ...prev,
                          includeUppercase: e.target.checked,
                        }))
                      }
                      className="rounded"
                    />
                    <Label htmlFor="uppercase" className="text-sm">
                      Majuscules (A-Z)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="lowercase"
                      checked={options.includeLowercase}
                      onChange={(e) =>
                        setOptions((prev) => ({
                          ...prev,
                          includeLowercase: e.target.checked,
                        }))
                      }
                      className="rounded"
                    />
                    <Label htmlFor="lowercase" className="text-sm">
                      Minuscules (a-z)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="numbers"
                      checked={options.includeNumbers}
                      onChange={(e) =>
                        setOptions((prev) => ({
                          ...prev,
                          includeNumbers: e.target.checked,
                        }))
                      }
                      className="rounded"
                    />
                    <Label htmlFor="numbers" className="text-sm">
                      Chiffres (0-9)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="symbols"
                      checked={options.includeSymbols}
                      onChange={(e) =>
                        setOptions((prev) => ({
                          ...prev,
                          includeSymbols: e.target.checked,
                        }))
                      }
                      className="rounded"
                    />
                    <Label htmlFor="symbols" className="text-sm">
                      Symboles (!@#$%^&*)
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Options avancées */}
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Options avancées</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="excludeSimilar"
                    checked={options.excludeSimilar}
                    onChange={(e) =>
                      setOptions((prev) => ({
                        ...prev,
                        excludeSimilar: e.target.checked,
                      }))
                    }
                    className="rounded"
                  />
                  <Label htmlFor="excludeSimilar" className="text-sm">
                    Exclure les caractères similaires
                  </Label>
                </div>
                <p className="text-xs text-slate-500 ml-6">
                  Exclut les caractères qui peuvent être confondus (l, 1, I, O,
                  0)
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="excludeAmbiguous"
                    checked={options.excludeAmbiguous}
                    onChange={(e) =>
                      setOptions((prev) => ({
                        ...prev,
                        excludeAmbiguous: e.target.checked,
                      }))
                    }
                    className="rounded"
                  />
                  <Label htmlFor="excludeAmbiguous" className="text-sm">
                    Exclure les caractères ambigus
                  </Label>
                </div>
                <p className="text-xs text-slate-500 ml-6">
                  Exclut les caractères spéciaux qui peuvent causer des
                  problèmes ({} [ ] / \)
                </p>
              </div>

              <Separator />

              {/* Bouton de génération rapide */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Génération rapide</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setOptions({
                        length: 8,
                        includeUppercase: true,
                        includeLowercase: true,
                        includeNumbers: true,
                        includeSymbols: false,
                        excludeSimilar: false,
                        excludeAmbiguous: false,
                      });
                      generatePassword();
                    }}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Simple
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setOptions({
                        length: 16,
                        includeUppercase: true,
                        includeLowercase: true,
                        includeNumbers: true,
                        includeSymbols: true,
                        excludeSimilar: true,
                        excludeAmbiguous: false,
                      });
                      generatePassword();
                    }}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Sécurisé
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conseils de sécurité */}
        <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Conseils de sécurité</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>
                    Utilisez au moins 12 caractères pour une sécurité optimale
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Combinez différents types de caractères</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Évitez les mots du dictionnaire ou les séquences</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>N'utilisez pas le même mot de passe partout</span>
                </div>
                <div className="flex items-start space-x-2">
                  <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>N'utilisez pas d'informations personnelles</span>
                </div>
                <div className="flex items-start space-x-2">
                  <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>Ne partagez jamais vos mots de passe</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
