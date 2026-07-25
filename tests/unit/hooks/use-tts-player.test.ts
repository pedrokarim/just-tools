import { describe, it, expect } from "vitest";
import {
  formatDuration,
  pickDefaultVoice,
  resolveVoice,
  splitIntoSegments,
} from "@/hooks/use-tts-player";

/** Fabrique une fausse voix : seuls `name` et `lang` sont utilisés. */
const voice = (name: string, lang: string, localService = true) =>
  ({ name, lang, localService, default: false, voiceURI: name } as SpeechSynthesisVoice);

describe("splitIntoSegments", () => {
  it("ne perd aucun caractère et reste contigu", () => {
    const text =
      "Première phrase. Deuxième phrase ! Et une troisième ? Enfin la fin…";
    const segments = splitIntoSegments(text);

    expect(segments[0].start).toBe(0);
    expect(segments[segments.length - 1].end).toBe(text.length);

    segments.forEach((segment, index) => {
      if (index > 0) expect(segment.start).toBe(segments[index - 1].end);
      expect(segment.end).toBeGreaterThan(segment.start);
    });
  });

  it("coupe aux fins de phrase", () => {
    const text = "Un. Deux. Trois.";
    const segments = splitIntoSegments(text);
    expect(segments).toHaveLength(3);
    expect(text.slice(segments[0].start, segments[0].end)).toBe("Un. ");
  });

  it("découpe une phrase trop longue sans dépasser la limite", () => {
    const text = `${"mot ".repeat(200)}fin.`;
    const segments = splitIntoSegments(text, 100);

    expect(segments.length).toBeGreaterThan(1);
    segments.forEach((segment) => {
      expect(segment.end - segment.start).toBeLessThanOrEqual(100);
    });
    expect(segments[segments.length - 1].end).toBe(text.length);
  });

  it("coupe en priorité sur une ponctuation faible", () => {
    const text = `${"a".repeat(50)}, ${"b".repeat(60)}`;
    const segments = splitIntoSegments(text, 80);
    expect(text.slice(segments[0].start, segments[0].end)).toBe(
      `${"a".repeat(50)},`
    );
  });

  it("gère un texte sans ponctuation ni espace", () => {
    const text = "x".repeat(250);
    const segments = splitIntoSegments(text, 100);
    expect(segments.map((s) => s.end - s.start)).toEqual([100, 100, 50]);
  });

  it("ne renvoie rien pour un texte vide", () => {
    expect(splitIntoSegments("")).toHaveLength(0);
  });

  it("traite les retours à la ligne comme des fins de segment", () => {
    const segments = splitIntoSegments("Titre\nCorps du texte");
    expect(segments).toHaveLength(2);
    expect(segments[0].end).toBe(6);
  });
});

describe("resolveVoice", () => {
  const voices = [
    voice("Microsoft Hortense - French (France)", "fr-FR"),
    voice("Microsoft Denise Online (Natural) - French (France)", "fr-FR", false),
    voice("Microsoft David - English (United States)", "en-US"),
  ];

  it("préfère un nom exact", () => {
    expect(resolveVoice(voices, { voice: voices[0].name })?.name).toBe(
      voices[0].name
    );
  });

  it("accepte un nom partiel, insensible à la casse", () => {
    expect(resolveVoice(voices, { voice: "denise" })?.name).toContain("Denise");
  });

  it("privilégie une voix naturelle pour une langue", () => {
    expect(resolveVoice(voices, { lang: "fr" })?.name).toContain("Natural");
  });

  it("accepte un code de langue complet", () => {
    expect(resolveVoice(voices, { lang: "en-US" })?.name).toContain("David");
  });

  it("ne renvoie rien sans critère ni correspondance", () => {
    expect(resolveVoice(voices, {})).toBeUndefined();
    expect(resolveVoice(voices, { voice: "inexistante" })).toBeUndefined();
    expect(resolveVoice(voices, { lang: "ja" })).toBeUndefined();
    expect(resolveVoice([], { lang: "fr" })).toBeUndefined();
  });
});

describe("pickDefaultVoice", () => {
  it("préfère une voix française naturelle", () => {
    const voices = [
      voice("English Natural", "en-US"),
      voice("Hortense", "fr-FR"),
      voice("Denise Natural", "fr-FR"),
    ];
    expect(pickDefaultVoice(voices)?.name).toBe("Denise Natural");
  });

  it("retombe sur le français, puis sur une voix naturelle", () => {
    expect(
      pickDefaultVoice([voice("English Natural", "en-US"), voice("Hortense", "fr-FR")])
        ?.name
    ).toBe("Hortense");

    expect(
      pickDefaultVoice([voice("Zira", "en-US"), voice("Aria Natural", "en-US")])?.name
    ).toBe("Aria Natural");
  });

  it("prend la première voix en dernier recours", () => {
    expect(pickDefaultVoice([voice("Zira", "en-US")])?.name).toBe("Zira");
    expect(pickDefaultVoice([])).toBeUndefined();
  });
});

describe("formatDuration", () => {
  it("formate minutes et secondes", () => {
    expect(formatDuration(0)).toBe("0:00");
    expect(formatDuration(9_000)).toBe("0:09");
    expect(formatDuration(65_000)).toBe("1:05");
    expect(formatDuration(600_000)).toBe("10:00");
  });

  it("ajoute les heures au besoin", () => {
    expect(formatDuration(3_600_000)).toBe("1:00:00");
    expect(formatDuration(3_725_000)).toBe("1:02:05");
  });

  it("tolère les valeurs aberrantes", () => {
    expect(formatDuration(-5)).toBe("0:00");
    expect(formatDuration(Number.NaN)).toBe("0:00");
    expect(formatDuration(Number.POSITIVE_INFINITY)).toBe("0:00");
  });
});
