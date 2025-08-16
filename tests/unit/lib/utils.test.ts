import { cn } from "@/lib/utils";

describe("cn function", () => {
  it("should merge class names correctly", () => {
    const result = cn("text-red-500", "bg-blue-500", "p-4");
    expect(result).toBe("text-red-500 bg-blue-500 p-4");
  });

  it("should handle conditional classes", () => {
    const isActive = true;
    const result = cn(
      "base-class",
      isActive && "active-class",
      "always-present"
    );
    expect(result).toBe("base-class active-class always-present");
  });

  it("should handle false conditional classes", () => {
    const isActive = false;
    const result = cn(
      "base-class",
      isActive && "active-class",
      "always-present"
    );
    expect(result).toBe("base-class always-present");
  });

  it("should handle arrays of classes", () => {
    const result = cn(["class1", "class2"], "class3", ["class4", "class5"]);
    expect(result).toBe("class1 class2 class3 class4 class5");
  });

  it("should handle objects with boolean values", () => {
    const result = cn({
      "conditional-class": true,
      "another-class": false,
      "always-class": true,
    });
    expect(result).toBe("conditional-class always-class");
  });

  it("should handle mixed input types", () => {
    const isActive = true;
    const result = cn(
      "base-class",
      ["array-class1", "array-class2"],
      {
        "object-class": isActive,
        "disabled-class": false,
      },
      "string-class"
    );
    expect(result).toBe(
      "base-class array-class1 array-class2 object-class string-class"
    );
  });

  it("should handle empty inputs", () => {
    expect(cn()).toBe("");
    expect(cn("")).toBe("");
    expect(cn(null, undefined, "")).toBe("");
  });

  it("should handle Tailwind CSS conflicts", () => {
    // Test that Tailwind classes are properly merged
    const result = cn("text-red-500", "text-blue-500");
    expect(result).toBe("text-blue-500"); // Last class should override
  });
});
