"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Github,
  Bug,
  Sparkles,
  FileText,
  Code,
  Palette,
  Settings,
  ExternalLink,
  Copy,
  ArrowLeft,
  Edit3,
} from "lucide-react";
import { toast } from "sonner";

interface ContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ContributionTemplate {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  template: {
    title: string;
    body: string;
    labels: string[];
  };
}

const contributionTemplates: ContributionTemplate[] = [
  {
    id: "bug-report",
    title: "Signalement de Bug",
    description: "Rapporter un problème ou un bug",
    icon: <Bug className="w-4 h-4" />,
    color: "bg-red-500",
    template: {
      title: "🐛 [BUG] ",
      body: `## Description du bug
<!-- Décrivez le bug de manière claire et concise -->

## Étapes pour reproduire
1. Aller sur '...'
2. Cliquer sur '...'
3. Faire défiler jusqu'à '...'
4. Voir l'erreur

## Comportement attendu
<!-- Décrivez ce qui devrait se passer -->

## Comportement actuel
<!-- Décrivez ce qui se passe actuellement -->

## Captures d'écran
<!-- Si applicable, ajoutez des captures d'écran -->

## Informations système
- **Navigateur :** 
- **Version :** 
- **OS :** 

## Informations supplémentaires
<!-- Ajoutez tout autre contexte sur le problème ici -->`,
      labels: ["bug", "help wanted"],
    },
  },
  {
    id: "feature-request",
    title: "Demande de Fonctionnalité",
    description: "Suggérer une nouvelle fonctionnalité",
    icon: <Sparkles className="w-4 h-4" />,
    color: "bg-blue-500",
    template: {
      title: "✨ [FEATURE] ",
      body: `## Description de la fonctionnalité
<!-- Décrivez la fonctionnalité que vous souhaitez voir ajoutée -->

## Problème résolu
<!-- Expliquez quel problème cette fonctionnalité résoudrait -->

## Solution proposée
<!-- Décrivez comment vous imaginez cette fonctionnalité -->

## Alternatives considérées
<!-- Décrivez les alternatives que vous avez considérées -->

## Exemples d'utilisation
<!-- Donnez des exemples concrets d'utilisation -->

## Informations supplémentaires
<!-- Ajoutez tout autre contexte ou captures d'écran -->`,
      labels: ["enhancement", "help wanted"],
    },
  },
  {
    id: "documentation",
    title: "Amélioration Documentation",
    description: "Améliorer la documentation",
    icon: <FileText className="w-4 h-4" />,
    color: "bg-green-500",
    template: {
      title: "📚 [DOCS] ",
      body: `## Section à améliorer
<!-- Indiquez quelle section de la documentation doit être améliorée -->

## Problème actuel
<!-- Décrivez ce qui n'est pas clair ou manquant -->

## Amélioration proposée
<!-- Décrivez comment améliorer cette section -->

## Contexte
<!-- Ajoutez du contexte sur pourquoi cette amélioration est nécessaire -->`,
      labels: ["documentation", "help wanted"],
    },
  },
  {
    id: "new-tool",
    title: "Nouvel Outil",
    description: "Proposer un nouvel outil",
    icon: <Code className="w-4 h-4" />,
    color: "bg-purple-500",
    template: {
      title: "🛠️ [NEW TOOL] ",
      body: `## Nom de l'outil
<!-- Proposez un nom pour le nouvel outil -->

## Description
<!-- Décrivez ce que fait cet outil -->

## Cas d'usage
<!-- Expliquez quand et pourquoi cet outil serait utile -->

## Fonctionnalités principales
<!-- Listez les fonctionnalités principales -->

## Interface utilisateur
<!-- Décrivez comment l'interface pourrait être organisée -->

## Exemples d'utilisation
<!-- Donnez des exemples concrets -->

## Ressources
<!-- Liens vers des outils similaires ou de la documentation -->`,
      labels: ["enhancement", "new tool", "help wanted"],
    },
  },
  {
    id: "design-improvement",
    title: "Amélioration Design",
    description: "Améliorer l'interface utilisateur",
    icon: <Palette className="w-4 h-4" />,
    color: "bg-pink-500",
    template: {
      title: "🎨 [DESIGN] ",
      body: `## Élément à améliorer
<!-- Décrivez quel élément de l'interface doit être amélioré -->

## Problème actuel
<!-- Décrivez les problèmes de design actuels -->

## Solution proposée
<!-- Décrivez vos suggestions d'amélioration -->

## Mockups/Designs
<!-- Si vous avez des mockups ou designs, partagez-les -->

## Contexte utilisateur
<!-- Expliquez l'impact sur l'expérience utilisateur -->`,
      labels: ["design", "enhancement", "help wanted"],
    },
  },
];

export function ContributionModal({ isOpen, onClose }: ContributionModalProps) {
  const [selectedTemplate, setSelectedTemplate] =
    useState<ContributionTemplate | null>(null);
  const [activeTab, setActiveTab] = useState("templates");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    browser: "",
    os: "",
    additionalInfo: "",
  });

  const handleTemplateSelect = (templateId: string) => {
    const template = contributionTemplates.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      setFormData({
        title: template.template.title,
        description: template.template.body,
        browser: "",
        os: "",
        additionalInfo: "",
      });
      setActiveTab("form");
    }
  };

  const resetForm = () => {
    setSelectedTemplate(null);
    setActiveTab("templates");
    setFormData({
      title: "",
      description: "",
      browser: "",
      os: "",
      additionalInfo: "",
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    if (!selectedTemplate) return;

    const finalTitle =
      formData.title +
      (formData.title.includes("[") ? "" : selectedTemplate.template.title);

    let finalBody = formData.description;

    // Remplacer les placeholders par les informations réelles
    finalBody = finalBody
      .replace(
        "<!-- Décrivez le bug de manière claire et concise -->",
        formData.additionalInfo || "À compléter"
      )
      .replace(
        "<!-- Ajoutez tout autre contexte sur le problème ici -->",
        formData.additionalInfo || "À compléter"
      )
      .replace(
        "<!-- Ajoutez tout autre contexte -->",
        formData.additionalInfo || "À compléter"
      )
      .replace(
        "<!-- Ajoutez du contexte -->",
        formData.additionalInfo || "À compléter"
      )
      .replace(
        "<!-- Ajoutez tout autre contexte ou captures d'écran -->",
        formData.additionalInfo || "À compléter"
      );

    // Ajouter les informations système si fournies
    if (formData.browser || formData.os) {
      finalBody = finalBody.replace(
        "- **Navigateur :** \n- **Version :** \n- **OS :** ",
        `- **Navigateur :** ${
          formData.browser || "Non spécifié"
        }\n- **Version :** Non spécifiée\n- **OS :** ${
          formData.os || "Non spécifié"
        }`
      );
    }

    const labels = selectedTemplate.template.labels.join(",");
    const url = `https://github.com/pedrokarim/just-tools/issues/new?title=${encodeURIComponent(
      finalTitle
    )}&body=${encodeURIComponent(finalBody)}&labels=${encodeURIComponent(
      labels
    )}`;

    window.open(url, "_blank");
    handleClose();
    toast.success("Redirection vers GitHub...");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copié dans le presse-papiers !");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-2xl">
            <Github className="w-6 h-6" />
            <span>Contribuer au projet</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="templates"
              className="flex items-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>Templates</span>
            </TabsTrigger>
            <TabsTrigger
              value="form"
              className="flex items-center space-x-2"
              disabled={!selectedTemplate}
            >
              <Edit3 className="w-4 h-4" />
              <span>Formulaire</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-6">
            <div className="space-y-4">
              <Label className="text-lg font-semibold">
                Choisissez le type de contribution :
              </Label>
              {selectedTemplate && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Template sélectionné :</strong>{" "}
                    {selectedTemplate.title}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => setActiveTab("form")}
                  >
                    Continuer vers le formulaire
                  </Button>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contributionTemplates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
                      selectedTemplate?.id === template.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 ${template.color} rounded-lg flex items-center justify-center text-white`}
                      >
                        {template.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold">{template.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {template.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="form" className="space-y-6">
            {selectedTemplate && (
              <>
                {/* Header avec template sélectionné */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-background rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 ${selectedTemplate.color} rounded-lg flex items-center justify-center text-white`}
                    >
                      {selectedTemplate.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {selectedTemplate.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedTemplate.description}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("templates")}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Changer de template
                  </Button>
                </div>

                {/* Formulaire */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold">
                    Remplissez les détails :
                  </Label>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Titre</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        placeholder="Titre de votre contribution..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        rows={8}
                        placeholder="Décrivez votre contribution..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="browser">Navigateur (optionnel)</Label>
                        <Input
                          id="browser"
                          value={formData.browser}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              browser: e.target.value,
                            })
                          }
                          placeholder="Chrome, Firefox, Safari..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="os">
                          Système d'exploitation (optionnel)
                        </Label>
                        <Input
                          id="os"
                          value={formData.os}
                          onChange={(e) =>
                            setFormData({ ...formData, os: e.target.value })
                          }
                          placeholder="Windows, macOS, Linux..."
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="additionalInfo">
                        Informations supplémentaires
                      </Label>
                      <Textarea
                        id="additionalInfo"
                        value={formData.additionalInfo}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            additionalInfo: e.target.value,
                          })
                        }
                        rows={3}
                        placeholder="Ajoutez des détails supplémentaires, captures d'écran, etc."
                      />
                    </div>
                  </div>

                  {/* Labels */}
                  <div>
                    <Label>Labels qui seront ajoutés :</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedTemplate.template.labels.map((label) => (
                        <Badge key={label} variant="secondary">
                          {label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Actions */}
                <div className="flex justify-between items-center">
                  <Button variant="outline" onClick={handleClose}>
                    Annuler
                  </Button>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => copyToClipboard(formData.description)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copier
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Créer sur GitHub
                    </Button>
                  </div>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
