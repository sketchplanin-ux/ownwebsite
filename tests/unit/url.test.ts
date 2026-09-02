import { describe, expect, it } from "vitest";

import {
  buildWhatsAppUrl,
  isSafeGoogleMapsEmbedUrl,
  isSafeLinkUrl,
  normalizeWhatsAppNumber,
} from "@/lib/url";

describe("URL utilities", () => {
  it("accepts site-relative and HTTP(S) links only", () => {
    expect(isSafeLinkUrl("/projects/view/?slug=home")).toBe(true);
    expect(isSafeLinkUrl("https://example.com/work")).toBe(true);
    expect(isSafeLinkUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeLinkUrl("//evil.example/path")).toBe(false);
    expect(isSafeLinkUrl("https://user:pass@example.com")).toBe(false);
  });

  it("normalizes and validates WhatsApp numbers", () => {
    expect(normalizeWhatsAppNumber("+91 98765-43210")).toBe("919876543210");
    expect(normalizeWhatsAppNumber("call-me")).toBeNull();
  });

  it("encodes WhatsApp message content", () => {
    expect(buildWhatsAppUrl("+91 98765 43210", "Hello & welcome"))
      .toBe("https://wa.me/919876543210?text=Hello%20%26%20welcome");
  });

  it("allowlists Google Maps HTTPS embed endpoints", () => {
    expect(
      isSafeGoogleMapsEmbedUrl("https://www.google.com/maps/embed?pb=value"),
    ).toBe(true);
    expect(
      isSafeGoogleMapsEmbedUrl("https://evil.example/maps/embed?pb=value"),
    ).toBe(false);
    expect(
      isSafeGoogleMapsEmbedUrl("http://www.google.com/maps/embed?pb=value"),
    ).toBe(false);
  });
});
