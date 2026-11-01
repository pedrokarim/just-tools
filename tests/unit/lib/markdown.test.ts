import { renderMarkdown } from "@/lib/markdown";

describe("renderMarkdown", () => {
  it("should render the common syntax", () => {
    const html = renderMarkdown(
      "# Titre\n\n**gras** et *italique*\n\n- un\n- deux\n\n1. premier\n\n`code`"
    );

    expect(html).toContain("<h1>Titre</h1>");
    expect(html).toContain("<strong>gras</strong>");
    expect(html).toContain("<em>italique</em>");
    expect(html).toContain("<ul>");
    expect(html).toContain("<ol>");
    expect(html).toContain("<code>code</code>");
  });

  it("should render images, code blocks and tables", () => {
    expect(renderMarkdown("![texte](https://exemple.fr/a.png)")).toContain(
      '<img src="https://exemple.fr/a.png" alt="texte"'
    );
    expect(renderMarkdown("```\nconst a = 1;\n```")).toContain("<pre><code>");

    const table = renderMarkdown("| A | B |\n|---|---|\n| 1 | 2 |");
    expect(table).toContain("<table>");
    expect(table).toContain("<td>1</td>");
    expect(table).not.toContain("---");
  });

  it("should open links safely", () => {
    const html = renderMarkdown("[lien](https://exemple.fr)");

    expect(html).toContain('href="https://exemple.fr"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it.each([
    "<script>alert(1)</script>",
    "<img src=x onerror=alert(1)>",
    '<a href="javascript:alert(1)">x</a>',
    "<iframe src=https://exemple.fr></iframe>",
    "texte <svg onload=alert(1)> suite",
  ])("should escape raw HTML: %s", (source) => {
    const html = renderMarkdown(source);

    expect(html).not.toMatch(/<(script|img|a|iframe|svg)\b/);
  });

  it.each([
    "[x](javascript:alert(1))",
    "[x](JaVaScRiPt:alert(1))",
    "[x](vbscript:msgbox(1))",
    "[x](data:text/html;base64,PHNjcmlwdD4=)",
  ])("should drop dangerous link targets: %s", (source) => {
    const html = renderMarkdown(source);

    expect(html).not.toContain("<a ");
    expect(html).toContain("x");
  });

  it("should not load an image from an unsafe address", () => {
    expect(renderMarkdown("![x](javascript:alert(1))")).not.toContain("<img");
    expect(renderMarkdown("![x](data:image/svg+xml,<svg/>)")).not.toContain(
      "<img"
    );
  });

  it("should not let a title or an alternative text break out", () => {
    const html = renderMarkdown('![a" onerror="alert(1)](https://exemple.fr/a.png)');

    expect(html).toContain("&quot;");
    expect(html).not.toContain('" onerror="');
  });
});
