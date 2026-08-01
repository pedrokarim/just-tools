/**
 * Limitation de débit en mémoire, par fenêtre glissante.
 *
 * ⚠ L'état vit dans le processus : avec plusieurs instances, chacune compte de
 * son côté et la limite effective est multipliée d'autant. C'est acceptable
 * pour l'usage visé — empêcher qu'un script gonfle la base d'analytics — mais
 * ce n'est pas une protection anti-abus distribuée. Le jour où l'app tourne en
 * plusieurs répliques, il faudra un magasin partagé (Redis).
 */

interface Window {
  count: number;
  /** Horodatage d'expiration, en millisecondes. */
  resetAt: number;
}

const windows = new Map<string, Window>();

/**
 * Sans purge, la Map grossit indéfiniment : une IP vue une fois y resterait
 * pour toujours. On balaie les entrées expirées de temps en temps, plutôt qu'à
 * chaque appel, pour ne pas parcourir toute la Map à chaque requête.
 */
let lastSweep = 0;
const SWEEP_INTERVAL_MS = 60_000;

function sweep(now: number) {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const [key, win] of windows) {
    if (win.resetAt <= now) windows.delete(key);
  }
}

export interface RateLimitResult {
  ok: boolean;
  /** Requêtes encore autorisées dans la fenêtre courante. */
  remaining: number;
  /** Secondes avant réinitialisation, pour l'en-tête `Retry-After`. */
  retryAfter: number;
}

/**
 * @param key    identifiant de l'appelant (IP le plus souvent)
 * @param limit  nombre de requêtes autorisées par fenêtre
 * @param windowMs durée de la fenêtre
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const current = windows.get(key);

  if (!current || current.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }

  current.count += 1;

  if (current.count > limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfter: Math.ceil((current.resetAt - now) / 1000),
    };
  }

  return {
    ok: true,
    remaining: limit - current.count,
    retryAfter: 0,
  };
}

/** Réinitialise l'état — réservé aux tests. */
export function resetRateLimits() {
  windows.clear();
  lastSweep = 0;
}

/**
 * Adresse de l'appelant. `x-forwarded-for` est ajouté par le proxy amont
 * (Cloudflare puis nginx ici) ; le premier élément est le client d'origine.
 */
export function clientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}
