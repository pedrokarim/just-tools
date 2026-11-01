import {
  formatSource,
  isFullyFormatted,
  reindent,
  type FormatOptions,
} from "@/lib/code-format";

// Le vrai chargeur passe par une adresse du site : ici, les mêmes fichiers depuis
// le paquet. Le chargement réel se vérifie dans le navigateur, sur le site compilé.
vi.mock("@/lib/prettier-loader", () => ({
  loadPrettierModule: async (name: string) => {
    const loaded =
      name === "standalone"
        ? await import("prettier/standalone")
        : await import(`../../../node_modules/prettier/plugins/${name}.mjs`);
    return loaded.default ?? loaded;
  },
}));

const OPTIONS: FormatOptions = {
  indentSize: 2,
  useTabs: false,
  maxLineLength: 80,
  removeTrailingWhitespace: true,
  insertFinalNewline: true,
};

describe("formatSource", () => {
  it("should keep operators, strings and comments intact", async () => {
    // Chaque ligne cassait l'ancien formateur : `===`, `=>`, `"x-y"` et `//`.
    const source = `const same = a === b; // comparaison
const up = (value) => value + 1;
const label = "x-y";
`;

    const formatted = await formatSource(source, "javascript", OPTIONS);

    expect(formatted).toContain("a === b");
    expect(formatted).toContain("// comparaison");
    expect(formatted).toContain("(value) => value + 1");
    expect(formatted).toContain('"x-y"');
  });

  it("should format minified code", async () => {
    const formatted = await formatSource(
      "function a(b){if(b){return 1}return 2}",
      "javascript",
      OPTIONS
    );

    expect(formatted).toContain("function a(b) {\n  if (b) {\n    return 1;");
  });

  it("should honor the indentation options", async () => {
    const source = "function a(){return 1}";

    expect(
      await formatSource(source, "javascript", { ...OPTIONS, indentSize: 4 })
    ).toContain("\n    return 1;");
    expect(
      await formatSource(source, "javascript", { ...OPTIONS, useTabs: true })
    ).toContain("\n\treturn 1;");
  });

  it("should support each analyzed language", async () => {
    expect(await formatSource("{\"a\":1}", "json", OPTIONS)).toContain('"a": 1');
    expect(await formatSource("a{color:red}", "css", OPTIONS)).toContain(
      "color: red;"
    );
    expect(
      await formatSource("<div><p>x</p></div>", "html", OPTIONS)
    ).toContain("<div>");
    expect(
      await formatSource("const a:number=1", "typescript", OPTIONS)
    ).toContain("const a: number = 1;");
  });

  it("should reject code it cannot parse", async () => {
    await expect(
      formatSource("function (", "javascript", OPTIONS)
    ).rejects.toThrow(/^Code invalide/);
    await expect(formatSource("{a", "json", OPTIONS)).rejects.toThrow(
      /^Code invalide/
    );
  });

  it("should honor the final newline option", async () => {
    expect(
      await formatSource("const a = 1", "javascript", {
        ...OPTIONS,
        insertFinalNewline: false,
      })
    ).toBe("const a = 1;");
  });

  it("should leave the content of other languages untouched", async () => {
    const source = `def run(a: int) -> int:
    if a == 1:
        return {"x-y": a}
    return a
`;

    const formatted = await formatSource(source, "python", OPTIONS);

    expect(formatted).toBe(`def run(a: int) -> int:
  if a == 1:
    return {"x-y": a}
  return a
`);
  });
});

describe("reindent", () => {
  it("should convert tabs to the requested unit", () => {
    expect(reindent("a\n\tb\n\t\tc", "  ")).toBe("a\n  b\n    c");
  });

  it("should keep empty lines empty", () => {
    expect(reindent("a\n   \n  b", "    ")).toBe("a\n\n    b");
  });
});

describe("isFullyFormatted", () => {
  it("should tell analyzed languages apart", () => {
    expect(isFullyFormatted("typescript")).toBe(true);
    expect(isFullyFormatted("python")).toBe(false);
  });
});
