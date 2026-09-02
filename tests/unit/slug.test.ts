import { describe, expect, it } from "vitest";

import { createUniqueSlug, generateSlug, isValidSlug } from "@/lib/slug";

describe("slug utilities", () => {
  it("normalizes punctuation, accents, ampersands, and whitespace", () => {
    expect(generateSlug("  Café & Client's  Home! ")).toBe(
      "cafe-and-clients-home",
    );
  });

  it("keeps non-Latin letters while removing unsafe path characters", () => {
    const slug = generateSlug("বাংলা / Design");
    expect(slug).toBe("বাংলা-design");
    expect(isValidSlug(slug)).toBe(true);
  });

  it("uses a safe fallback for empty input", () => {
    expect(generateSlug("///")).toBe("untitled");
  });

  it("creates a deterministic unused suffix", () => {
    expect(
      createUniqueSlug("House", ["house", "house-2", "house-3"]),
    ).toBe("house-4");
  });
});
