import {
  getToolMetadata,
  getToolMetadataByRoute,
  getToolMetadataByPathname,
  isToolNew,
  getRecentTools,
  getLatestTool,
  getToolsCount,
  getToolsByCategory,
  getReadyTools,
  getStats,
  categories,
  toolsMetadata,
} from "@/lib/tools-metadata";

describe("Tools Metadata Functions", () => {
  it("should get tool metadata by ID", () => {
    const tool = getToolMetadata("code-formatter");
    expect(tool).toBeDefined();
    expect(tool?.name).toBe("Formateur de Code");
    expect(tool?.category).toBe("Développement");
  });

  it("should return undefined for non-existent tool ID", () => {
    const tool = getToolMetadata("non-existent-tool");
    expect(tool).toBeUndefined();
  });

  it("should get tool metadata by route", () => {
    const tool = getToolMetadataByRoute("/tools/base64-converter");
    expect(tool).toBeDefined();
    expect(tool?.name).toBe("Convertisseur Base64");
    expect(tool?.route).toBe("/tools/base64-converter");
  });

  it("should return undefined for non-existent route", () => {
    const tool = getToolMetadataByRoute("/tools/non-existent");
    expect(tool).toBeUndefined();
  });

  it("should get tool metadata by pathname", () => {
    const tool = getToolMetadataByPathname("/tools/json-validator");
    expect(tool).toBeDefined();
    expect(tool?.name).toBe("Validateur JSON");
  });

  it("should return undefined for invalid pathname", () => {
    const tool = getToolMetadataByPathname("/invalid/path");
    expect(tool).toBeUndefined();
  });

  it("should check if tool is new", () => {
    const recentTool = {
      id: "test-tool",
      name: "Test Tool",
      description: "Test",
      category: "Test",
      status: "ready" as const,
      icon: null,
      color: "test",
      gradient: "test",
      route: "/test",
      headerGradient: "test",
      headerIconBg: "test",
      createdAt: new Date(), // Aujourd'hui
    };

    const oldTool = {
      ...recentTool,
      createdAt: new Date("2020-01-01"), // Il y a longtemps
    };

    expect(isToolNew(recentTool)).toBe(true);
    expect(isToolNew(oldTool)).toBe(false);
  });

  it("should get recent tools", () => {
    const recentTools = getRecentTools();
    expect(Array.isArray(recentTools)).toBe(true);
    // Vérifier que tous les outils récents sont bien récents
    recentTools.forEach((tool) => {
      expect(isToolNew(tool)).toBe(true);
    });
  });

  // Ces trois tests portaient des valeurs en dur (10 outils, « Synthèse Vocale »
  // comme dernier), qui cassaient à chaque ajout d'outil — ils étaient rouges
  // depuis l'arrivée de « Suppression d'Arrière-plan ». Réécrits en invariants :
  // ils vérifient la propriété, plus l'instantané.

  it("should get latest tool", () => {
    const latestTool = getLatestTool();
    expect(latestTool).toBeDefined();

    // Le plus récent est celui de `createdAt` maximal, quel qu'il soit.
    const expected = [...toolsMetadata].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    )[0];
    expect(latestTool?.id).toBe(expected.id);
  });

  it("should get tools count", () => {
    expect(getToolsCount()).toBe(toolsMetadata.length);
  });

  it("should get tools by category", () => {
    for (const category of ["Développement", "Design"]) {
      const filtered = getToolsByCategory(category);

      // Le filtre ne doit rien laisser passer d'autre…
      filtered.forEach((tool) => expect(tool.category).toBe(category));

      // …ni rien oublier. Comparer au décompte réel plutôt qu'à un nombre figé
      // évite de casser à chaque nouvel outil.
      const expected = toolsMetadata.filter((t) => t.category === category);
      expect(filtered).toHaveLength(expected.length);
      expect(expected.length).toBeGreaterThan(0);
    }
  });

  it("should get all tools when category is 'Tous'", () => {
    const allTools = getToolsByCategory("Tous");
    expect(allTools.length).toBe(getToolsCount());
  });

  it("should get ready tools", () => {
    const readyTools = getReadyTools();
    expect(readyTools.length).toBe(getToolsCount()); // Tous les outils sont "ready"
    readyTools.forEach((tool) => {
      expect(tool.status).toBe("ready");
    });
  });

  it("should get stats", () => {
    const stats = getStats();
    expect(stats).toHaveLength(4);
    expect(stats[0]).toEqual({
      number: getToolsCount().toString(),
      label: "Outils disponibles",
    });
    expect(stats[1]).toEqual({ number: "100%", label: "Gratuit" });
    expect(stats[2]).toEqual({ number: "Open", label: "Source" });
    expect(stats[3]).toEqual({ number: "24/7", label: "Disponible" });
  });

  it("should have correct categories", () => {
    expect(categories).toContain("Tous");
    expect(categories).toContain("Développement");
    expect(categories).toContain("Design");
    expect(categories).toContain("Utilitaires");
    expect(categories).toContain("Sécurité");
    expect(categories).toContain("Édition");
  });
});
