import { describe, it, expect } from "vitest";
import { assertSafeExternalUrl } from "@/lib/safe-fetch";

/**
 * Régression : `api/proxy-image` acceptait n'importe quelle URL, son allowlist
 * de domaines ayant été commentée. Le serveur pouvait donc être amené à
 * interroger le réseau interne ou les métadonnées cloud.
 */
describe("assertSafeExternalUrl", () => {
  const refuse = [
    ["métadonnées cloud", "http://169.254.169.254/latest/meta-data/"],
    ["loopback nommé", "http://localhost:3000/"],
    ["loopback IPv4", "http://127.0.0.1/"],
    ["loopback IPv6", "http://[::1]/"],
    ["privé 10/8", "http://10.0.0.5/img.png"],
    ["privé 192.168/16", "http://192.168.1.1/"],
    ["privé 172.16/12", "http://172.16.0.1/"],
    ["0.0.0.0/8", "http://0.0.0.0/"],
    ["schéma file", "file:///etc/passwd"],
    ["schéma gopher", "gopher://evil/"],
    ["identifiants dans l'URL", "http://user:pass@example.com/"],
    ["URL malformée", "pas-une-url"],
  ] as const;

  it.each(refuse)("refuse : %s", async (_label, url) => {
    const result = await assertSafeExternalUrl(url);
    expect(result.ok).toBe(false);
  });

  const accepte = [
    ["hôte public en https", "https://images.unsplash.com/photo-1.jpg"],
    ["hôte public en http", "http://example.com/a.png"],
  ] as const;

  it.each(accepte)("accepte : %s", async (_label, url) => {
    const result = await assertSafeExternalUrl(url);
    expect(result.ok).toBe(true);
  });

  it("refuse une IP interne même écrite en décimal pointé complet", async () => {
    // Le contournement classique : un nom public qui résout vers du loopback.
    // Ici on vérifie au moins la forme littérale.
    const result = await assertSafeExternalUrl("http://169.254.169.254/");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("Adresse non autorisée");
  });
});
