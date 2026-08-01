import { lookup } from "node:dns/promises";
import net from "node:net";

/**
 * Garde anti-SSRF pour les URL fournies par l'utilisateur.
 *
 * Le proxy d'images acceptait n'importe quelle URL : l'allowlist de domaines
 * avait été commentée au motif que « la vérification du Content-Type suffit ».
 * Elle ne suffit pas — elle filtre ce qui est *renvoyé*, alors que la requête
 * sortante part dans tous les cas. De quoi atteindre depuis le serveur les
 * métadonnées cloud (169.254.169.254), localhost, ou le réseau privé.
 *
 * On refuse donc *avant* d'émettre la requête, en résolvant le nom pour ne pas
 * se faire contourner par un domaine public pointant vers une IP interne
 * (ex. `127.0.0.1.nip.io`).
 */

/** Plages qu'un service exposé sur Internet n'a aucune raison d'atteindre. */
function isBlockedIpv4(ip: string): boolean {
  const p = ip.split(".").map(Number);
  if (p.length !== 4 || p.some((n) => Number.isNaN(n))) return true;
  const [a, b] = p;

  if (a === 0) return true; // 0.0.0.0/8
  if (a === 10) return true; // privé
  if (a === 127) return true; // loopback
  if (a === 169 && b === 254) return true; // link-local + métadonnées cloud
  if (a === 172 && b >= 16 && b <= 31) return true; // privé
  if (a === 192 && b === 168) return true; // privé
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  if (a === 192 && b === 0) return true; // IETF
  if (a >= 224) return true; // multicast + réservé
  return false;
}

function isBlockedIpv6(ip: string): boolean {
  const v = ip.toLowerCase().split("%")[0];
  if (v === "::" || v === "::1") return true; // non spécifié, loopback
  if (v.startsWith("fe80")) return true; // link-local
  if (v.startsWith("fc") || v.startsWith("fd")) return true; // unique-local
  // IPv4 encapsulée : on retombe sur les règles v4.
  const mapped = v.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isBlockedIpv4(mapped[1]);
  return false;
}

function isBlockedIp(ip: string): boolean {
  const version = net.isIP(ip);
  if (version === 4) return isBlockedIpv4(ip);
  if (version === 6) return isBlockedIpv6(ip);
  return true; // ni v4 ni v6 : on refuse
}

export type SafeUrlResult =
  | { ok: true; url: URL }
  | { ok: false; reason: string };

/**
 * Valide une URL fournie par l'utilisateur avant toute requête sortante.
 * Résout le nom et refuse si *n'importe quelle* adresse renvoyée est interne.
 */
export async function assertSafeExternalUrl(
  rawUrl: string
): Promise<SafeUrlResult> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return { ok: false, reason: "URL invalide" };
  }

  // Ferme file:, data:, gopher:, ftp:…
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { ok: false, reason: "Protocole non autorisé" };
  }

  if (url.username || url.password) {
    return { ok: false, reason: "URL non autorisée" };
  }

  // Une IP écrite en clair est vérifiée telle quelle, sans passer par le DNS.
  if (net.isIP(url.hostname)) {
    return isBlockedIp(url.hostname)
      ? { ok: false, reason: "Adresse non autorisée" }
      : { ok: true, url };
  }

  let addresses: { address: string }[];
  try {
    addresses = await lookup(url.hostname, { all: true });
  } catch {
    return { ok: false, reason: "Hôte introuvable" };
  }

  if (addresses.length === 0) {
    return { ok: false, reason: "Hôte introuvable" };
  }

  // Une seule adresse interne suffit à refuser : un domaine peut en publier
  // plusieurs, et on ne contrôle pas celle que `fetch` retiendra.
  if (addresses.some((a) => isBlockedIp(a.address))) {
    return { ok: false, reason: "Adresse non autorisée" };
  }

  return { ok: true, url };
}
