import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { rateLimit, resetRateLimits, clientIp } from "@/lib/rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    resetRateLimits();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("laisse passer tant que la limite n'est pas atteinte", () => {
    for (let i = 0; i < 3; i++) {
      expect(rateLimit("ip", 3, 1000).ok).toBe(true);
    }
  });

  it("refuse au-delà de la limite", () => {
    for (let i = 0; i < 3; i++) rateLimit("ip", 3, 1000);

    const result = rateLimit("ip", 3, 1000);
    expect(result.ok).toBe(false);
    expect(result.retryAfter).toBeGreaterThan(0);
  });

  it("décompte les requêtes restantes", () => {
    expect(rateLimit("ip", 3, 1000).remaining).toBe(2);
    expect(rateLimit("ip", 3, 1000).remaining).toBe(1);
    expect(rateLimit("ip", 3, 1000).remaining).toBe(0);
  });

  it("compte chaque clé séparément", () => {
    for (let i = 0; i < 3; i++) rateLimit("ip-a", 3, 1000);

    // La saturation de « ip-a » ne doit pas affecter « ip-b ».
    expect(rateLimit("ip-b", 3, 1000).ok).toBe(true);
  });

  it("rouvre après expiration de la fenêtre", () => {
    for (let i = 0; i < 3; i++) rateLimit("ip", 3, 1000);
    expect(rateLimit("ip", 3, 1000).ok).toBe(false);

    vi.advanceTimersByTime(1001);

    expect(rateLimit("ip", 3, 1000).ok).toBe(true);
  });

  it("purge les fenêtres expirées pour ne pas fuir en mémoire", () => {
    rateLimit("éphémère", 1, 100);

    // La purge n'a lieu qu'au-delà de son intervalle : on dépasse les deux.
    vi.advanceTimersByTime(61_000);
    rateLimit("autre", 1, 100);

    // Si la purge a bien eu lieu, l'ancienne clé repart d'une fenêtre neuve.
    const result = rateLimit("éphémère", 1, 100);
    expect(result.ok).toBe(true);
    expect(result.remaining).toBe(0);
  });
});

describe("clientIp", () => {
  it("retient la première adresse de x-forwarded-for", () => {
    const headers = new Headers({
      "x-forwarded-for": "203.0.113.1, 70.41.3.18, 150.172.238.178",
    });
    expect(clientIp(headers)).toBe("203.0.113.1");
  });

  it("retombe sur x-real-ip", () => {
    expect(clientIp(new Headers({ "x-real-ip": "203.0.113.9" }))).toBe(
      "203.0.113.9"
    );
  });

  it("retourne « unknown » sans en-tête exploitable", () => {
    expect(clientIp(new Headers())).toBe("unknown");
  });
});
