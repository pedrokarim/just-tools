import {
  buildCharset,
  describeStrength,
  estimateEntropy,
  generatePassword,
  type PasswordOptions,
} from "@/lib/password";

const OPTIONS: PasswordOptions = {
  length: 32,
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSymbols: true,
  excludeSimilar: false,
  excludeAmbiguous: false,
};

describe("password", () => {
  it("should generate the requested length", () => {
    expect(generatePassword({ ...OPTIONS, length: 4 })).toHaveLength(4);
    expect(generatePassword({ ...OPTIONS, length: 64 })).toHaveLength(64);
  });

  it("should only use allowed characters", () => {
    const options = { ...OPTIONS, includeSymbols: false, excludeSimilar: true };
    const charset = buildCharset(options);
    const password = generatePassword({ ...options, length: 500 });

    expect([...password].every((char) => charset.includes(char))).toBe(true);
    expect(password).not.toMatch(/[il1Lo0O]/);
  });

  it("should return nothing without any character type", () => {
    const options = {
      ...OPTIONS,
      includeUppercase: false,
      includeLowercase: false,
      includeNumbers: false,
      includeSymbols: false,
    };

    expect(generatePassword(options)).toBe("");
    expect(estimateEntropy(options)).toBe(0);
  });

  it("should draw from the cryptographic generator", () => {
    const spy = vi.spyOn(crypto, "getRandomValues");

    generatePassword({ ...OPTIONS, length: 8 });

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("should not produce the same password twice", () => {
    expect(generatePassword(OPTIONS)).not.toBe(generatePassword(OPTIONS));
  });

  it("should grow entropy with length and alphabet", () => {
    const base = estimateEntropy({ ...OPTIONS, length: 16 });

    expect(estimateEntropy({ ...OPTIONS, length: 32 })).toBeCloseTo(base * 2);
    expect(estimateEntropy({ ...OPTIONS, length: 16, includeSymbols: false }))
      .toBeLessThan(base);
  });

  it("should describe strength from entropy", () => {
    expect(describeStrength(30).level).toBe("weak");
    expect(describeStrength(50).level).toBe("fair");
    expect(describeStrength(80).level).toBe("strong");
    expect(describeStrength(120).level).toBe("excellent");
    expect(describeStrength(500).ratio).toBe(1);
  });
});
