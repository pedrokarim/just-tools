import { describe, it, expect } from "vitest";
import {
  buildTtsUrl,
  decodeBase64Url,
  encodeBase64Url,
  parseTtsParams,
  stripTtsParams,
} from "@/lib/tts-params";

describe("tts-params", () => {
  describe("base64url", () => {
    it("fait un aller-retour sur du texte accentué", () => {
      const text = "Été : où ça ? Là — déjà 100 % prêt !";
      expect(decodeBase64Url(encodeBase64Url(text))).toBe(text);
    });

    it("produit un alphabet sûr pour une URL", () => {
      const encoded = encodeBase64Url("Ça déborde ?? ~~ ///");
      expect(encoded).toMatch(/^[A-Za-z0-9_-]*$/);
    });

    it("tolère l'absence de remplissage", () => {
      // « a » encodé fait 2 caractères, donc 2 « = » manquants.
      expect(decodeBase64Url(encodeBase64Url("a"))).toBe("a");
      expect(decodeBase64Url(encodeBase64Url("ab"))).toBe("ab");
      expect(decodeBase64Url(encodeBase64Url("abc"))).toBe("abc");
    });
  });

  describe("parseTtsParams", () => {
    it("ne signale rien sur une query vide", () => {
      const params = parseTtsParams("");
      expect(params.hasAny).toBe(false);
      expect(params.text).toBeUndefined();
      expect(params.autoplay).toBe(false);
    });

    it("lit le texte en clair", () => {
      const params = parseTtsParams("?text=Bonjour%20monde&autoplay=1");
      expect(params.text).toBe("Bonjour monde");
      expect(params.autoplay).toBe(true);
      expect(params.hasAny).toBe(true);
    });

    it("donne la priorité à b64 sur text", () => {
      const encoded = encodeBase64Url("depuis b64");
      const params = parseTtsParams(`?b64=${encoded}&text=depuis%20text`);
      expect(params.text).toBe("depuis b64");
    });

    it("retombe sur text si b64 est corrompu", () => {
      const params = parseTtsParams("?b64=%%%invalide&text=repli");
      expect(params.text).toBe("repli");
    });

    it("accepte les différentes écritures des booléens", () => {
      expect(parseTtsParams("?autoplay=1").autoplay).toBe(true);
      expect(parseTtsParams("?autoplay=true").autoplay).toBe(true);
      expect(parseTtsParams("?autoplay=oui").autoplay).toBe(true);
      expect(parseTtsParams("?autoplay").autoplay).toBe(true);
      expect(parseTtsParams("?play=on").autoplay).toBe(true);
      expect(parseTtsParams("?autoplay=0").autoplay).toBe(false);
      expect(parseTtsParams("?autoplay=non").autoplay).toBe(false);
    });

    it("borne les valeurs numériques", () => {
      const params = parseTtsParams("?rate=9&pitch=-3&volume=42");
      expect(params.rate).toBe(2);
      expect(params.pitch).toBe(0.5);
      expect(params.volume).toBe(1);
    });

    it("accepte la virgule décimale et ignore les nombres invalides", () => {
      expect(parseTtsParams("?rate=1,4").rate).toBeCloseTo(1.4);
      expect(parseTtsParams("?rate=abc").rate).toBeUndefined();
      expect(parseTtsParams("?rate=").rate).toBeUndefined();
    });

    it("accepte une URL complète", () => {
      const params = parseTtsParams(
        "https://exemple.fr/tools/text-to-speech?text=salut&mini=1"
      );
      expect(params.text).toBe("salut");
      expect(params.mini).toBe(true);
    });

    it("signale hasAny même sans texte", () => {
      expect(parseTtsParams("?mini=1").hasAny).toBe(true);
    });
  });

  describe("buildTtsUrl", () => {
    it("ajoute le chemin de l'outil une seule fois", () => {
      const fromRoot = buildTtsUrl("https://exemple.fr", { text: "a" });
      const fromFullPath = buildTtsUrl(
        "https://exemple.fr/tools/text-to-speech",
        { text: "a" }
      );
      expect(fromRoot).toContain("/tools/text-to-speech?");
      expect(fromFullPath.match(/tools\/text-to-speech/g)).toHaveLength(1);
    });

    it("tolère une barre oblique finale", () => {
      expect(buildTtsUrl("https://exemple.fr/", { text: "a" })).toContain(
        "https://exemple.fr/tools/text-to-speech?"
      );
    });

    it("produit une URL relue à l'identique", () => {
      const url = buildTtsUrl("https://exemple.fr", {
        text: "Où va-t-on ?",
        autoplay: true,
        mini: true,
        rate: 1.2,
        voice: "Microsoft Denise (Natural)",
      });

      const params = parseTtsParams(url);
      expect(params.text).toBe("Où va-t-on ?");
      expect(params.autoplay).toBe(true);
      expect(params.mini).toBe(true);
      expect(params.rate).toBe(1.2);
      expect(params.voice).toBe("Microsoft Denise (Natural)");
    });

    it("peut rester en texte clair", () => {
      const url = buildTtsUrl("https://exemple.fr", {
        text: "clair",
        encoded: false,
      });
      expect(url).toContain("text=clair");
      expect(url).not.toContain("b64=");
    });
  });

  describe("stripTtsParams", () => {
    it("retire les paramètres de l'outil", () => {
      expect(stripTtsParams("?b64=abc&autoplay=1&mini=1")).toBe("");
    });

    it("conserve les paramètres étrangers", () => {
      expect(stripTtsParams("?utm_source=mail&autoplay=1")).toBe(
        "?utm_source=mail"
      );
    });

    it("accepte une query sans point d'interrogation", () => {
      expect(stripTtsParams("autoplay=1&ref=x")).toBe("?ref=x");
    });
  });
});
