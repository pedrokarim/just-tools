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

  it("should get latest tool", () => {
    const latestTool = getLatestTool();
    expect(latestTool).toBeDefined();
    expect(latestTool?.name).toBe("Synthèse Vocale"); // Le plus récent selon les données
  });

  it("should get tools count", () => {
    const count = getToolsCount();
    expect(count).toBe(10); // 10 outils dans les métadonnées
  });

  it("should get tools by category", () => {
    const devTools = getToolsByCategory("Développement");
    expect(devTools.length).toBe(2); // code-formatter et json-validator
    devTools.forEach((tool) => {
      expect(tool.category).toBe("Développement");
    });

    const designTools = getToolsByCategory("Design");
    expect(designTools.length).toBe(4); // color-palette, pattern-editor, halftone, color-extractor
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
