import { PROJECT_CONFIG } from "@/lib/constants";

describe("PROJECT_CONFIG", () => {
  it("should have required basic properties", () => {
    expect(PROJECT_CONFIG.name).toBeDefined();
    expect(PROJECT_CONFIG.description).toBeDefined();
    expect(PROJECT_CONFIG.version).toBeDefined();
    expect(PROJECT_CONFIG.baseUrl).toBeDefined();
  });

  it("should have creator information", () => {
    expect(PROJECT_CONFIG.creator.name).toBe("Ahmed Karim");
    expect(PROJECT_CONFIG.creator.alias).toBe("PedroKarim");
    expect(PROJECT_CONFIG.creator.website).toBe("https://ascencia.re");
    expect(PROJECT_CONFIG.creator.github).toBe("https://github.com/pedrokarim");
  });

  it("should have company information", () => {
    expect(PROJECT_CONFIG.company.name).toBe("Ascencia");
    expect(PROJECT_CONFIG.company.website).toBe("https://ascencia.re");
    expect(PROJECT_CONFIG.company.description).toBeDefined();
  });

  it("should have project information", () => {
    expect(PROJECT_CONFIG.project.github).toBe(
      "https://github.com/pedrokarim/just-tools"
    );
    expect(PROJECT_CONFIG.project.license).toBe("MIT");
    expect(PROJECT_CONFIG.project.repository).toBe("pedrokarim/just-tools");
  });

  it("should have dates information", () => {
    expect(PROJECT_CONFIG.dates.created).toBeDefined();
    expect(PROJECT_CONFIG.dates.lastUpdated).toBeDefined();
    expect(PROJECT_CONFIG.dates.copyrightYear).toBeDefined();
  });

  it("should have SEO configuration", () => {
    expect(PROJECT_CONFIG.seo.keywords).toBeInstanceOf(Array);
    expect(PROJECT_CONFIG.seo.keywords.length).toBeGreaterThan(0);
    expect(PROJECT_CONFIG.seo.author).toBe("Ahmed Karim (PedroKarim)");
    expect(PROJECT_CONFIG.seo.publisher).toBe("Ascencia");
    expect(PROJECT_CONFIG.seo.category).toBe("technology");
  });

  it("should have PWA configuration", () => {
    expect(PROJECT_CONFIG.pwa.name).toBeDefined();
    expect(PROJECT_CONFIG.pwa.shortName).toBe("Just Tools");
    expect(PROJECT_CONFIG.pwa.description).toBeDefined();
    expect(PROJECT_CONFIG.pwa.themeColor).toBe("#3b82f6");
    expect(PROJECT_CONFIG.pwa.backgroundColor).toBe("#ffffff");
    expect(PROJECT_CONFIG.pwa.display).toBe("standalone");
  });

  it("should have stats information", () => {
    expect(PROJECT_CONFIG.stats.toolsCount).toBe(10);
    expect(PROJECT_CONFIG.stats.isFree).toBe(true);
    expect(PROJECT_CONFIG.stats.isOpenSource).toBe(true);
    expect(PROJECT_CONFIG.stats.availability).toBe("24/7");
  });

  it("should have valid URLs", () => {
    const urlRegex = /^https?:\/\/.+/i;
    expect(PROJECT_CONFIG.baseUrl).toMatch(urlRegex);
    expect(PROJECT_CONFIG.creator.website).toMatch(urlRegex);
    expect(PROJECT_CONFIG.creator.github).toMatch(urlRegex);
    expect(PROJECT_CONFIG.company.website).toMatch(urlRegex);
    expect(PROJECT_CONFIG.project.github).toMatch(urlRegex);
  });

  it("should have valid email format", () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect(PROJECT_CONFIG.creator.email).toMatch(emailRegex);
  });
});
