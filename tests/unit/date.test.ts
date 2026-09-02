import { describe, expect, it } from "vitest";

import {
  formatDateOnly,
  isScheduledContentVisible,
  isWithinSchedule,
  parseDateOnly,
  toDate,
} from "@/lib/date";

describe("date utilities", () => {
  it("converts a Firestore-compatible timestamp", () => {
    const expected = new Date("2026-08-02T12:30:00.000Z");
    const timestamp = {
      seconds: expected.getTime() / 1_000,
      nanoseconds: 0,
      toDate: () => expected,
    };

    expect(toDate(timestamp)?.toISOString()).toBe(expected.toISOString());
  });

  it("returns null instead of throwing for malformed values", () => {
    expect(toDate("not-a-date")).toBeNull();
    expect(
      toDate({ seconds: 1, nanoseconds: 0, toDate: () => new Date("bad") }),
    ).toBeNull();
  });

  it("round-trips valid date-only values in local time", () => {
    const parsed = parseDateOnly("2024-02-29");
    expect(parsed).not.toBeNull();
    expect(parsed && formatDateOnly(parsed)).toBe("2024-02-29");
    expect(parseDateOnly("2023-02-29")).toBeNull();
  });

  it("evaluates optional scheduling bounds inclusively", () => {
    const now = new Date("2026-08-02T10:00:00.000Z");
    expect(
      isWithinSchedule(
        new Date("2026-08-02T10:00:00.000Z"),
        new Date("2026-08-03T10:00:00.000Z"),
        now,
      ),
    ).toBe(true);
    expect(
      isWithinSchedule(undefined, new Date("2026-08-01T10:00:00.000Z"), now),
    ).toBe(false);
    expect(isScheduledContentVisible(false, undefined, undefined, now)).toBe(
      false,
    );
  });

  it("fails closed when a provided schedule bound is invalid", () => {
    expect(isWithinSchedule("invalid", undefined, new Date())).toBe(false);
  });
});
