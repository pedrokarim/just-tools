import { renderLlmsTxt, renderMarkdown } from "@/lib/site-markdown";
import { prefersMarkdown } from "@/middleware";
import { tools } from "@/lib/tools-metadata";

describe("site markdown", () => {
  it("should describe the site and list every tool on the home page", () => {
    const { status, body } = renderMarkdown("/");

    expect(status).toBe(200);
    expect(body.startsWith("# ")).toBe(true);
    for (const tool of tools) {
      expect(body).toContain(tool.name);
    }
  });

  it("should render each tool page from its metadata", () => {
    for (const tool of tools) {
      const { status, body } = renderMarkdown(tool.route);

      expect(status).toBe(200);
      expect(body).toContain(tool.about);
    }
  });

  it("should ignore a trailing slash", () => {
    expect(renderMarkdown("/about/").status).toBe(200);
  });

  it("should answer unknown paths with a useful 404", () => {
    const { status, body } = renderMarkdown("/nowhere");

    expect(status).toBe(404);
    expect(body.length).toBeGreaterThan(20);
    expect(body).toContain("/llms.txt");
  });

  it("should list every tool in llms.txt", () => {
    const body = renderLlmsTxt();

    expect(body.startsWith("# Just Tools")).toBe(true);
    for (const tool of tools) {
      expect(body).toContain(tool.route);
    }
  });
});

describe("prefersMarkdown", () => {
  it("should only answer an explicit request", () => {
    expect(prefersMarkdown("text/markdown")).toBe(true);
    expect(prefersMarkdown("text/markdown, text/html;q=0.8")).toBe(true);
  });

  it("should leave browsers on HTML", () => {
    expect(prefersMarkdown(null)).toBe(false);
    expect(prefersMarkdown("*/*")).toBe(false);
    expect(
      prefersMarkdown("text/html,application/xhtml+xml,application/xml;q=0.9")
    ).toBe(false);
    expect(prefersMarkdown("text/html, text/markdown;q=0.5")).toBe(false);
  });
});
