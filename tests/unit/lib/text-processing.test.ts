import {
  cleanTextForTTS,
  cleanMarkdown,
  cleanHTML,
  cleanXML,
  extractTextFromJSON,
  cleanFileContent,
  validateFileType,
  validateImage,
} from "@/lib/text-processing";

// Mock de sonner pour éviter les erreurs de toast
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe("Text Processing Functions", () => {
  describe("cleanTextForTTS", () => {
    it("should clean text for text-to-speech", () => {
      const input = "Hello\n\n\nWorld\n\nTest";
      const expected = "Hello World Test";
      expect(cleanTextForTTS(input)).toBe(expected);
    });

    it("should handle multiple spaces", () => {
      const input = "Hello    World   Test";
      const expected = "Hello World Test";
      expect(cleanTextForTTS(input)).toBe(expected);
    });

    it("should trim whitespace", () => {
      const input = "  Hello World  ";
      const expected = "Hello World";
      expect(cleanTextForTTS(input)).toBe(expected);
    });

    it("should handle empty string", () => {
      expect(cleanTextForTTS("")).toBe("");
    });
  });

  describe("cleanMarkdown", () => {
    it("should remove code blocks", () => {
      const input = "Text ```code block``` more text";
      const expected = "Text  more text";
      expect(cleanMarkdown(input)).toBe(expected);
    });

    it("should remove inline code", () => {
      const input = "Text `inline code` more text";
      const expected = "Text  more text";
      expect(cleanMarkdown(input)).toBe(expected);
    });

    it("should replace links with text", () => {
      const input = "Text [link text](http://example.com) more text";
      const expected = "Text link text more text";
      expect(cleanMarkdown(input)).toBe(expected);
    });

    it("should remove headers", () => {
      const input = "# Header 1\n## Header 2\nText";
      const expected = "Header 1\nHeader 2\nText";
      expect(cleanMarkdown(input)).toBe(expected);
    });

    it("should remove bold and italic", () => {
      const input = "**bold** and *italic* text";
      const expected = "bold and italic text";
      expect(cleanMarkdown(input)).toBe(expected);
    });

    it("should remove strikethrough", () => {
      const input = "~~strikethrough~~ text";
      const expected = "strikethrough text";
      expect(cleanMarkdown(input)).toBe(expected);
    });

    it("should remove bullet lists", () => {
      const input = "- Item 1\n* Item 2\n+ Item 3";
      const expected = "Item 1\nItem 2\nItem 3";
      expect(cleanMarkdown(input)).toBe(expected);
    });

    it("should remove numbered lists", () => {
      const input = "1. Item 1\n2. Item 2";
      const expected = "Item 1\nItem 2";
      expect(cleanMarkdown(input)).toBe(expected);
    });
  });

  describe("cleanHTML", () => {
    it("should remove HTML tags", () => {
      const input = "<p>Hello <strong>World</strong></p>";
      const expected = "Hello World";
      expect(cleanHTML(input)).toBe(expected);
    });

    it("should remove scripts", () => {
      const input = "<script>alert('test')</script>Text";
      const expected = "Text";
      expect(cleanHTML(input)).toBe(expected);
    });

    it("should remove styles", () => {
      const input = "<style>.test { color: red; }</style>Text";
      const expected = "Text";
      expect(cleanHTML(input)).toBe(expected);
    });

    it("should handle HTML entities", () => {
      const input = "Hello &amp; World &lt;test&gt;";
      const expected = "Hello   World  test";
      expect(cleanHTML(input)).toBe(expected);
    });
  });

  describe("cleanXML", () => {
    it("should remove XML declaration", () => {
      const input = '<?xml version="1.0"?><root>text</root>';
      const expected = "text";
      expect(cleanXML(input)).toBe(expected);
    });

    it("should remove XML tags", () => {
      const input = "<root><item>text</item></root>";
      const expected = "text";
      expect(cleanXML(input)).toBe(expected);
    });

    it("should handle XML entities", () => {
      const input = "Hello &amp; World &lt;test&gt;";
      const expected = "Hello   World  test";
      expect(cleanXML(input)).toBe(expected);
    });
  });

  describe("extractTextFromJSON", () => {
    it("should extract text from simple JSON", () => {
      const input = '{"name": "John", "age": 30}';
      const expected = "John 30";
      expect(extractTextFromJSON(input)).toBe(expected);
    });

    it("should extract text from nested JSON", () => {
      const input = '{"user": {"name": "John", "details": {"city": "Paris"}}}';
      const expected = "John Paris";
      expect(extractTextFromJSON(input)).toBe(expected);
    });

    it("should extract text from array", () => {
      const input = '["item1", "item2", 123]';
      const expected = "item1 item2 123";
      expect(extractTextFromJSON(input)).toBe(expected);
    });

    it("should handle invalid JSON", () => {
      const input = "invalid json";
      expect(extractTextFromJSON(input)).toBe(input);
    });

    it("should handle boolean and number values", () => {
      const input = '{"active": true, "count": 42}';
      const expected = "true 42";
      expect(extractTextFromJSON(input)).toBe(expected);
    });
  });

  describe("cleanFileContent", () => {
    it("should clean markdown files", () => {
      const content = "# Title\n**Bold text**";
      const fileName = "test.md";
      const expected = "Title\nBold text";
      expect(cleanFileContent(content, fileName)).toBe(expected);
    });

    it("should clean HTML files", () => {
      const content = "<p>Hello <strong>World</strong></p>";
      const fileName = "test.html";
      const expected = "Hello World";
      expect(cleanFileContent(content, fileName)).toBe(expected);
    });

    it("should clean XML files", () => {
      const content = "<root><item>text</item></root>";
      const fileName = "test.xml";
      const expected = "text";
      expect(cleanFileContent(content, fileName)).toBe(expected);
    });

    it("should extract text from JSON files", () => {
      const content = '{"name": "John", "age": 30}';
      const fileName = "test.json";
      const expected = "John 30";
      expect(cleanFileContent(content, fileName)).toBe(expected);
    });

    it("should return original content for unknown file types", () => {
      const content = "original content";
      const fileName = "test.txt";
      expect(cleanFileContent(content, fileName)).toBe(content);
    });
  });

  describe("validateFileType", () => {
    it("should validate text files", () => {
      const file = new File(["content"], "test.txt", { type: "text/plain" });
      expect(validateFileType(file)).toBe(true);
    });

    it("should validate markdown files", () => {
      const file = new File(["content"], "test.md", { type: "text/markdown" });
      expect(validateFileType(file)).toBe(true);
    });

    it("should validate JSON files", () => {
      const file = new File(["content"], "test.json", {
        type: "application/json",
      });
      expect(validateFileType(file)).toBe(true);
    });

    it("should validate HTML files", () => {
      const file = new File(["content"], "test.html", { type: "text/html" });
      expect(validateFileType(file)).toBe(true);
    });

    it("should validate XML files", () => {
      const file = new File(["content"], "test.xml", { type: "text/xml" });
      expect(validateFileType(file)).toBe(true);
    });

    it("should validate CSV files", () => {
      const file = new File(["content"], "test.csv", { type: "text/csv" });
      expect(validateFileType(file)).toBe(true);
    });

    it("should reject invalid file types", () => {
      const file = new File(["content"], "test.exe", {
        type: "application/octet-stream",
      });
      expect(validateFileType(file)).toBe(false);
    });
  });

  describe("validateImage", () => {
    it("should validate valid image files", () => {
      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });
      expect(validateImage(file)).toBe(true);
    });

    it("should reject non-image files", () => {
      const file = new File(["content"], "test.txt", { type: "text/plain" });
      expect(validateImage(file)).toBe(false);
    });

    it("should reject large files", () => {
      // Créer un fichier de 11MB (plus que la limite de 10MB)
      const largeContent = "x".repeat(11 * 1024 * 1024);
      const file = new File([largeContent], "large.jpg", {
        type: "image/jpeg",
      });
      expect(validateImage(file)).toBe(false);
    });
  });
});
