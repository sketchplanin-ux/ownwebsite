import type { FirestoreTimestamp } from "@/types/common";

export type DateInput =
  | FirestoreTimestamp
  | Date
  | string
  | number
  | null
  | undefined;

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function isValidDate(value: Date): boolean {
  return Number.isFinite(value.getTime());
}

function hasTimestampShape(value: unknown): value is FirestoreTimestamp {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<FirestoreTimestamp>;
  return (
    typeof candidate.seconds === "number" &&
    Number.isFinite(candidate.seconds) &&
    typeof candidate.nanoseconds === "number" &&
    Number.isFinite(candidate.nanoseconds) &&
    typeof candidate.toDate === "function"
  );
}

function hasTimestampSeconds(
  value: unknown,
): value is { seconds: number; nanoseconds?: number } {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as { seconds?: unknown; nanoseconds?: unknown };
  return (
    typeof candidate.seconds === "number" &&
    Number.isFinite(candidate.seconds) &&
    (candidate.nanoseconds === undefined ||
      (typeof candidate.nanoseconds === "number" &&
        Number.isFinite(candidate.nanoseconds)))
  );
}

/** Converts Firestore timestamps and common display inputs without throwing. */
export function toDate(value: DateInput | unknown): Date | null {
  if (value instanceof Date) {
    return isValidDate(value) ? new Date(value.getTime()) : null;
  }

  if (hasTimestampShape(value)) {
    try {
      const converted = value.toDate();
      return converted instanceof Date && isValidDate(converted)
        ? new Date(converted.getTime())
        : null;
    } catch {
      return null;
    }
  }

  if (hasTimestampSeconds(value)) {
    const nanoseconds = value.nanoseconds ?? 0;
    if (nanoseconds < 0 || nanoseconds >= 1_000_000_000) {
      return null;
    }

    const converted = new Date(value.seconds * 1_000 + nanoseconds / 1_000_000);
    return isValidDate(converted) ? converted : null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const converted = new Date(value);
    return isValidDate(converted) ? converted : null;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const converted = new Date(value);
    return isValidDate(converted) ? converted : null;
  }

  return null;
}

/** Parses a YYYY-MM-DD value in local time, preventing UTC day shifts. */
export function parseDateOnly(value: string): Date | null {
  const match = DATE_ONLY_PATTERN.exec(value);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  const parsed = new Date(year, monthIndex, day);

  return parsed.getFullYear() === year &&
    parsed.getMonth() === monthIndex &&
    parsed.getDate() === day
    ? parsed
    : null;
}

export function isDateOnly(value: string): boolean {
  return parseDateOnly(value) !== null;
}

export function formatDateOnly(value: Date): string | null {
  if (!isValidDate(value)) {
    return null;
  }

  const year = String(value.getFullYear()).padStart(4, "0");
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDate(
  value: DateInput | unknown,
  options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
  },
  locale = "en-IN",
  fallback = "—",
): string {
  const date = toDate(value);
  if (!date) {
    return fallback;
  }

  try {
    return new Intl.DateTimeFormat(locale, options).format(date);
  } catch {
    return fallback;
  }
}

export function toIsoString(value: DateInput | unknown): string | null {
  const date = toDate(value);
  return date ? date.toISOString() : null;
}

/** Invalid provided bounds fail closed instead of making content public. */
export function isWithinSchedule(
  startAt?: DateInput,
  endAt?: DateInput,
  now: Date = new Date(),
): boolean {
  if (!isValidDate(now)) {
    return false;
  }

  const start = startAt == null ? null : toDate(startAt);
  const end = endAt == null ? null : toDate(endAt);

  if ((startAt != null && !start) || (endAt != null && !end)) {
    return false;
  }

  return (!start || now >= start) && (!end || now <= end);
}

export function isScheduledContentVisible(
  active: boolean,
  startAt?: DateInput,
  endAt?: DateInput,
  now: Date = new Date(),
): boolean {
  return active && isWithinSchedule(startAt, endAt, now);
}
