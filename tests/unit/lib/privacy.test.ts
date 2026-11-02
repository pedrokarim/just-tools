import { describe, expect, it } from "vitest";
import { anonymizeIp } from "@/lib/privacy";

describe("anonymizeIp", () => {
  it("retire le dernier octet d'une IPv4", () => {
    expect(anonymizeIp("203.0.113.42")).toBe("203.0.113.0");
  });

  it("traite une IPv4 écrite en IPv6 comme une IPv4", () => {
    expect(anonymizeIp("::ffff:203.0.113.42")).toBe("203.0.113.0");
  });

  it("ne garde que le /48 d'une IPv6", () => {
    expect(anonymizeIp("2001:db8:85a3:8d3:1319:8a2e:370:7348")).toBe(
      "2001:db8:85a3::"
    );
  });

  it("développe la forme abrégée d'une IPv6", () => {
    expect(anonymizeIp("2001:db8::1")).toBe("2001:db8:0::");
  });

  it("ne garde jamais ce qui n'est pas une adresse", () => {
    for (const value of ["unknown", "", "1.2.3", "2001:db8", "1::2::3", "a:b"]) {
      expect(anonymizeIp(value)).toBeUndefined();
    }
  });
});
