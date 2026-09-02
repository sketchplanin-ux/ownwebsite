import { describe, expect, it } from "vitest";

import { buildTransformedImageUrl } from "@/components/website/responsive-image";

describe("Cloudflare image transformation URLs", () => {
  const source = "https://cdn.test.example/sketchplan/courtyard-a1b2c3d4e5f6.webp";

  it("inserts the transformation prefix ahead of the object path", () => {
    expect(buildTransformedImageUrl(source, 640)).toBe(
      "https://cdn.test.example/cdn-cgi/image/format=auto,quality=85,fit=scale-down,width=640/sketchplan/courtyard-a1b2c3d4e5f6.webp",
    );
  });

  it("clamps an explicit quality into the supported range", () => {
    expect(buildTransformedImageUrl(source, 640, 200)).toContain("quality=100");
    expect(buildTransformedImageUrl(source, 640, 0)).toContain("quality=1");
  });

  it("rejects other hosts, insecure URLs, and out-of-range widths", () => {
    expect(
      buildTransformedImageUrl("https://images.other.example/sketchplan/a.webp", 640),
    ).toBeNull();
    expect(
      buildTransformedImageUrl("http://cdn.test.example/sketchplan/a.webp", 640),
    ).toBeNull();
    expect(buildTransformedImageUrl(source, 8)).toBeNull();
    expect(buildTransformedImageUrl(source, 5000)).toBeNull();
  });

  it("refuses to nest one transformation inside another", () => {
    expect(
      buildTransformedImageUrl(
        "https://cdn.test.example/cdn-cgi/image/width=320/sketchplan/a.webp",
        640,
      ),
    ).toBeNull();
  });
});
