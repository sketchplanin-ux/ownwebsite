const DEFAULT_FALLBACK = "untitled";
const DEFAULT_MAX_LENGTH = 80;
const SLUG_PATTERN =
  /^[\p{Letter}\p{Number}\p{Mark}]+(?:-[\p{Letter}\p{Number}\p{Mark}]+)*$/u;

export interface SlugOptions {
  fallback?: string;
  maxLength?: number;
}

function trimHyphens(value: string): string {
  return value.replace(/^-+|-+$/g, "");
}

function normalize(value: string): string {
  return trimHyphens(
    value
      .normalize("NFKD")
      .replace(/(\p{Script=Latin})\p{Mark}+/gu, "$1")
      .toLocaleLowerCase("en-US")
      .replace(/[’']/g, "")
      .replace(/&/g, " and ")
      .replace(/[^\p{Letter}\p{Number}\p{Mark}]+/gu, "-")
      .replace(/-{2,}/g, "-"),
  );
}

function truncate(value: string, maxLength: number): string {
  const characters = Array.from(value);
  if (characters.length <= maxLength) {
    return value;
  }

  return trimHyphens(characters.slice(0, maxLength).join(""));
}

export function generateSlug(input: string, options: SlugOptions = {}): string {
  const maxLength = Math.max(
    1,
    Math.min(Math.floor(options.maxLength ?? DEFAULT_MAX_LENGTH), 200),
  );
  const fallback = normalize(options.fallback ?? DEFAULT_FALLBACK);
  const normalized = normalize(input);
  return truncate(normalized || fallback || DEFAULT_FALLBACK, maxLength);
}

export const slugify = generateSlug;

export function isValidSlug(value: string): boolean {
  return value.length > 0 && value.length <= 200 && SLUG_PATTERN.test(value);
}

export function createUniqueSlug(
  input: string,
  existingSlugs: Iterable<string>,
  options: SlugOptions = {},
): string {
  const used = new Set(Array.from(existingSlugs, (slug) => slug.toLowerCase()));
  const base = generateSlug(input, options);
  if (!used.has(base.toLowerCase())) {
    return base;
  }

  const maxLength = Math.max(
    4,
    Math.min(Math.floor(options.maxLength ?? DEFAULT_MAX_LENGTH), 200),
  );
  let suffix = 2;
  while (true) {
    const suffixText = `-${suffix}`;
    const shortenedBase = truncate(
      base,
      Math.max(1, maxLength - suffixText.length),
    );
    const candidate = `${shortenedBase}${suffixText}`;
    if (!used.has(candidate.toLowerCase())) {
      return candidate;
    }
    suffix += 1;
  }
}
