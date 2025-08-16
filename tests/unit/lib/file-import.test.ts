import {
  importTextFile,
  extractTextFromImage,
  extractTextFromImageURL,
  getClipboardText,
} from "@/lib/file-import";

// Mock de sonner
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

// Mock de tesseract.js
vi.mock("tesseract.js", () => ({
  createWorker: vi.fn(() =>
    Promise.resolve({
      recognize: vi.fn(() =>
        Promise.resolve({
          data: { text: "Extracted text from image" },
        })
      ),
    })
  ),
}));

// Mock de FileReader
const mockFileReader = {
  readAsText: vi.fn(),
  onload: null as any,
  onerror: null as any,
  result: "file content",
};

global.FileReader = vi.fn(() => mockFileReader) as any;

// Mock de URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => "blob:mock-url");

// Mock de document.createElement
const mockCanvas = {
  getContext: vi.fn(() => ({
    drawImage: vi.fn(),
  })),
  width: 0,
  height: 0,
};

const mockImg = {
  onload: null as any,
  onerror: null as any,
  src: "",
  width: 100,
  height: 100,
};

vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
  if (tagName === "canvas") return mockCanvas as any;
  if (tagName === "img") return mockImg as any;
  return document.createElement(tagName);
});

// Mock de navigator.clipboard
Object.defineProperty(navigator, "clipboard", {
  value: {
    readText: vi.fn(),
  },
  writable: true,
});

describe("File Import Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("importTextFile", () => {
    it("should import text file successfully", async () => {
      const file = new File(["content"], "test.txt", { type: "text/plain" });
      const setText = vi.fn();

      // Simuler le succès de FileReader
      setTimeout(() => {
        mockFileReader.onload({ target: { result: "file content" } });
      }, 0);

      await importTextFile(file, setText);

      expect(mockFileReader.readAsText).toHaveBeenCalledWith(file);
      expect(setText).toHaveBeenCalledWith("file content");
    });

    it("should handle FileReader error", async () => {
      const file = new File(["content"], "test.txt", { type: "text/plain" });
      const setText = vi.fn();

      // Simuler l'erreur de FileReader
      setTimeout(() => {
        mockFileReader.onerror();
      }, 0);

      await expect(importTextFile(file, setText)).rejects.toThrow(
        "Erreur de lecture"
      );
    });

    it("should handle invalid file type", async () => {
      const file = new File(["content"], "test.exe", {
        type: "application/octet-stream",
      });
      const setText = vi.fn();

      await importTextFile(file, setText);

      expect(setText).not.toHaveBeenCalled();
    });
  });

  describe("extractTextFromImage", () => {
    it("should extract text from image successfully", async () => {
      const file = new File(["image content"], "test.jpg", {
        type: "image/jpeg",
      });
      const setText = vi.fn();

      // Simuler le chargement réussi de l'image
      setTimeout(() => {
        mockImg.onload();
      }, 0);

      await extractTextFromImage(file, setText);

      expect(mockImg.src).toBe("blob:mock-url");
      expect(setText).toHaveBeenCalledWith("Extracted text from image");
    });

    it("should handle image load error", async () => {
      const file = new File(["image content"], "test.jpg", {
        type: "image/jpeg",
      });
      const setText = vi.fn();

      // Simuler l'erreur de chargement de l'image
      setTimeout(() => {
        mockImg.onerror();
      }, 0);

      await expect(extractTextFromImage(file, setText)).rejects.toThrow(
        "Erreur de chargement d'image"
      );
    });

    it("should handle invalid image file", async () => {
      const file = new File(["content"], "test.txt", { type: "text/plain" });
      const setText = vi.fn();

      await extractTextFromImage(file, setText);

      expect(setText).not.toHaveBeenCalled();
    });
  });

  describe("extractTextFromImageURL", () => {
    it("should extract text from image URL successfully", async () => {
      const imageUrl = "https://example.com/image.jpg";
      const setText = vi.fn();

      // Simuler le chargement réussi de l'image
      setTimeout(() => {
        mockImg.onload();
      }, 0);

      await extractTextFromImageURL(imageUrl, setText);

      expect(mockImg.src).toContain("/api/proxy-image?url=");
      expect(setText).toHaveBeenCalledWith("Extracted text from image");
    });

    it("should handle empty URL", async () => {
      const setText = vi.fn();

      await extractTextFromImageURL("", setText);

      expect(setText).not.toHaveBeenCalled();
    });

    it("should handle invalid URL", async () => {
      const setText = vi.fn();

      await extractTextFromImageURL("invalid-url", setText);

      expect(setText).not.toHaveBeenCalled();
    });

    it("should handle image load error from URL", async () => {
      const imageUrl = "https://example.com/image.jpg";
      const setText = vi.fn();

      // Simuler l'erreur de chargement de l'image
      setTimeout(() => {
        mockImg.onerror();
      }, 0);

      await expect(extractTextFromImageURL(imageUrl, setText)).rejects.toThrow(
        "Erreur de chargement d'image depuis URL"
      );
    });
  });

  describe("getClipboardText", () => {
    it("should get clipboard text successfully", async () => {
      const setText = vi.fn();
      const clipboardText = "clipboard content";

      vi.mocked(navigator.clipboard.readText).mockResolvedValue(clipboardText);

      await getClipboardText(setText);

      expect(navigator.clipboard.readText).toHaveBeenCalled();
      expect(setText).toHaveBeenCalledWith(clipboardText);
    });

    it("should handle empty clipboard", async () => {
      const setText = vi.fn();

      vi.mocked(navigator.clipboard.readText).mockResolvedValue("");

      await getClipboardText(setText);

      expect(setText).not.toHaveBeenCalled();
    });

    it("should handle clipboard access error", async () => {
      const setText = vi.fn();
      const error = new Error("Clipboard access denied");

      vi.mocked(navigator.clipboard.readText).mockRejectedValue(error);

      await expect(getClipboardText(setText)).rejects.toThrow(
        "Clipboard access denied"
      );
    });
  });
});
