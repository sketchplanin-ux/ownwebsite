import { DEFAULT_WHATSAPP_MESSAGE } from "./constants";

const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f]/;
const WHATSAPP_NUMBER_PATTERN = /^[+\d\s().-]+$/;

function parseHttpUrl(value: string): URL | null {
  const trimmed = value.trim();
  if (!trimmed || CONTROL_CHARACTER_PATTERN.test(trimmed)) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);
    if (
      (parsed.protocol !== "https:" && parsed.protocol !== "http:") ||
      parsed.username !== "" ||
      parsed.password !== ""
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function isSafeHttpUrl(value: string): boolean {
  return parseHttpUrl(value) !== null;
}

export function isSafeRelativeUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || CONTROL_CHARACTER_PATTERN.test(trimmed)) {
    return false;
  }

  if (trimmed.startsWith("//") || trimmed.includes("\\")) {
    return false;
  }

  return (
    trimmed.startsWith("/") ||
    trimmed.startsWith("#") ||
    trimmed.startsWith("?")
  );
}

/** Allows only explicit HTTP(S) destinations or same-site relative links. */
export function isSafeLinkUrl(value: string): boolean {
  return isSafeRelativeUrl(value) || isSafeHttpUrl(value);
}

export function sanitizeLinkUrl(value: string): string | null {
  const trimmed = value.trim();
  return isSafeLinkUrl(trimmed) ? trimmed : null;
}

export function normalizeWhatsAppNumber(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed || !WHATSAPP_NUMBER_PATTERN.test(trimmed)) {
    return null;
  }

  const digits = trimmed.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15 ? digits : null;
}

export function buildWhatsAppUrl(
  phoneNumber: string,
  message = DEFAULT_WHATSAPP_MESSAGE,
): string | null {
  const digits = normalizeWhatsAppNumber(phoneNumber);
  if (!digits) {
    return null;
  }

  const normalizedMessage = message.trim();
  return normalizedMessage
    ? `https://wa.me/${digits}?text=${encodeURIComponent(normalizedMessage)}`
    : `https://wa.me/${digits}`;
}

/** Restricts iframe sources to known Google Maps embed endpoints. */
export function isSafeGoogleMapsEmbedUrl(value: string): boolean {
  const parsed = parseHttpUrl(value);
  if (!parsed || parsed.protocol !== "https:") {
    return false;
  }

  const allowedHosts = new Set([
    "google.com",
    "www.google.com",
    "maps.google.com",
    "google.co.in",
    "www.google.co.in",
    "maps.google.co.in",
  ]);

  if (!allowedHosts.has(parsed.hostname.toLowerCase())) {
    return false;
  }

  return (
    parsed.pathname.startsWith("/maps/embed") ||
    (parsed.pathname.startsWith("/maps") &&
      parsed.searchParams.get("output") === "embed")
  );
}
