"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton } from "@/components/site/copy-button";
import { Bug, Sparkles, FileText, Code, Palette, ExternalLink, ArrowLeft, ChevronRight } from "lucide-react";
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
  template: {
    title: string;
    body: string;
    labels: string[];
  };
}

const contributionTemplates: ContributionTemplate[] = [
  {
    id: "bug-report",
    title: "Signaler un bug",
    description: "Quelque chose ne marche pas comme prévu.",
    icon: <Bug aria-hidden="true" />,
    template: {
      title: "[BUG] ",
      body: `## Description du bug
<!-- Décris le bug de manière claire et concise -->

## Étapes pour reproduire
1. Aller sur '...'
2. Cliquer sur '...'
3. Faire défiler jusqu'à '...'
4. Voir l'erreur

## Comportement attendu
<!-- Décris ce qui devrait se passer -->

## Comportement actuel
<!-- Décris ce qui se passe actuellement -->

## Captures d'écran
<!-- Si applicable, ajoute des captures d'écran -->

## Informations système
- **Navigateur :** 
- **Version :** 
- **OS :** 

## Informations supplémentaires
<!-- Ajoute tout autre contexte sur le problème ici -->`,
      labels: ["bug", "help wanted"],
    },
  },
  {
    id: "feature-request",
    title: "Proposer une fonctionnalité",
    description: "Une idée pour un outil existant.",
    icon: <Sparkles aria-hidden="true" />,
    template: {
      title: "[FEATURE] ",
      body: `## Description de la fonctionnalité
<!-- Décris la fonctionnalité que tu souhaites voir ajoutée -->

## Problème résolu
<!-- Explique quel problème cette fonctionnalité résoudrait -->

## Solution proposée
<!-- Décris comment tu imagines cette fonctionnalité -->

## Alternatives considérées
<!-- Décris les alternatives que tu as envisagées -->

## Exemples d'utilisation
<!-- Donne des exemples concrets d'utilisation -->

## Informations supplémentaires
<!-- Ajoute tout autre contexte ou captures d'écran -->`,
      labels: ["enhancement", "help wanted"],
    },
  },
  {
    id: "documentation",
    title: "Améliorer la documentation",
    description: "Une explication manque ou reste floue.",
    icon: <FileText aria-hidden="true" />,
    template: {
      title: "[DOCS] ",
      body: `## Section à améliorer
<!-- Indique quelle section de la documentation doit être améliorée -->

## Problème actuel
<!-- Décris ce qui n'est pas clair ou manquant -->

## Amélioration proposée
<!-- Décris comment améliorer cette section -->

## Contexte
<!-- Ajoute du contexte sur pourquoi cette amélioration est nécessaire -->`,
      labels: ["documentation", "help wanted"],
    },
  },
  {
    id: "new-tool",
    title: "Proposer un outil",
    description: "Un outil qui manque à la collection.",
    icon: <Code aria-hidden="true" />,
    template: {
      title: "[NEW TOOL] ",
      body: `## Nom de l'outil
<!-- Propose un nom pour le nouvel outil -->

## Description
<!-- Décris ce que fait cet outil -->

## Cas d'usage
<!-- Explique quand et pourquoi cet outil serait utile -->

## Fonctionnalités principales
<!-- Liste les fonctionnalités principales -->

## Interface utilisateur
<!-- Décris comment l'interface pourrait être organisée -->

## Exemples d'utilisation
<!-- Donne des exemples concrets -->

## Ressources
<!-- Liens vers des outils similaires ou de la documentation -->`,
      labels: ["enhancement", "new tool", "help wanted"],
    },
  },
  {
    id: "design-improvement",
    title: "Améliorer le design",
    description: "Une interface qui pourrait être plus claire.",
    icon: <Palette aria-hidden="true" />,
    template: {
      title: "[DESIGN] ",
      body: `## Élément à améliorer
<!-- Décris quel élément de l'interface doit être amélioré -->

## Problème actuel
<!-- Décris les problèmes de design actuels -->

## Solution proposée
<!-- Décris tes suggestions d'amélioration -->

## Mockups/Designs
<!-- Si tu as des mockups ou designs, partage-les -->

## Contexte utilisateur
<!-- Explique l'impact sur l'expérience utilisateur -->`,
      labels: ["design", "enhancement", "help wanted"],
    },
  },
];

export function ContributionModal({ isOpen, onClose }: ContributionModalProps) {
  const [selectedTemplate, setSelectedTemplate] =
    useState<ContributionTemplate | null>(null);
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
    }
  };

  const resetForm = () => {
    setSelectedTemplate(null);
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
        "<!-- Décris le bug de manière claire et concise -->",
        formData.additionalInfo || "À compléter"
      )
      .replace(
        "<!-- Ajoute tout autre contexte sur le problème ici -->",
        formData.additionalInfo || "À compléter"
      )
      .replace(
        "<!-- Ajoute tout autre contexte -->",
        formData.additionalInfo || "À compléter"
      )
      .replace(
        "<!-- Ajoute du contexte -->",
        formData.additionalInfo || "À compléter"
      )
      .replace(
        "<!-- Ajoute tout autre contexte ou captures d'écran -->",
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
    toast.success("Ouverture de GitHub…");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {selectedTemplate ? selectedTemplate.title : "Contribuer au projet"}
          </DialogTitle>
          <DialogDescription>
            {selectedTemplate
              ? "Complète ta contribution : elle s'ouvrira sur GitHub, prête à être envoyée."
              : "Choisis ce que tu veux faire. Tout se passe sur GitHub."}
          </DialogDescription>
        </DialogHeader>

        {!selectedTemplate ? (
          <ul className="divide-border border-border asc-animate-step-in divide-y border-y">
            {contributionTemplates.map((template) => (
              <li key={template.id}>
                <button
                  type="button"
                  onClick={() => handleTemplateSelect(template.id)}
                  className="group hover:bg-surface flex min-h-14 w-full cursor-pointer items-center gap-3.5 px-2 py-2.5 text-left transition-colors duration-(--animate-duration-fast) [&_svg]:size-4"
                >
                  <span className="text-link shrink-0">{template.icon}</span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-fg text-sm font-semibold">
                      {template.title}
                    </span>
                    <span className="text-fg-muted text-[0.8125rem]">
                      {template.description}
                    </span>
                  </span>
                  <ChevronRight
                    aria-hidden="true"
                    className="text-fg-subtle shrink-0 transition-[translate] duration-(--animate-duration-fast) group-hover:translate-x-0.5"
                  />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="asc-animate-step-in flex min-w-0 flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="contribution-title">Titre</Label>
              <Input
                id="contribution-title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Le titre de ta contribution…"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="contribution-description">Description</Label>
              <Textarea
                id="contribution-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={8}
                className="max-h-64 font-mono text-[0.8125rem] [field-sizing:fixed]"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex min-w-0 flex-col gap-2">
                <Label htmlFor="contribution-browser">
                  Navigateur (facultatif)
                </Label>
                <Input
                  id="contribution-browser"
                  value={formData.browser}
                  onChange={(e) =>
                    setFormData({ ...formData, browser: e.target.value })
                  }
                  placeholder="Firefox, Edge…"
                />
              </div>
              <div className="flex min-w-0 flex-col gap-2">
                <Label htmlFor="contribution-os">Système (facultatif)</Label>
                <Input
                  id="contribution-os"
                  value={formData.os}
                  onChange={(e) =>
                    setFormData({ ...formData, os: e.target.value })
                  }
                  placeholder="Windows, macOS, Linux…"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="contribution-more">
                Autres informations (facultatif)
              </Label>
              <Textarea
                id="contribution-more"
                value={formData.additionalInfo}
                onChange={(e) =>
                  setFormData({ ...formData, additionalInfo: e.target.value })
                }
                rows={2}
                placeholder="Tout détail utile, un lien, une capture…"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button variant="ghost" onClick={resetForm}>
                <ArrowLeft aria-hidden="true" />
                Retour
              </Button>
              <CopyButton
                variant="secondary"
                className="ms-auto"
                value={formData.description}
              />
              <Button onClick={handleSubmit}>
                <ExternalLink aria-hidden="true" />
                Créer sur GitHub
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
