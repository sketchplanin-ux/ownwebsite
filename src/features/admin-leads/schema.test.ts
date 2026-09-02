import { describe, expect, it } from "vitest";

import { leadUpdateSchema } from "@/features/admin-leads/schema";

describe("leadUpdateSchema", () => {
  it("accepts a supported status and trimmed notes", () => {
    expect(
      leadUpdateSchema.parse({ status: "CONTACTED", adminNotes: "  Called  " }),
    ).toEqual({ status: "CONTACTED", adminNotes: "Called" });
  });

  it("rejects unknown statuses", () => {
    expect(
      leadUpdateSchema.safeParse({ status: "DELETED", adminNotes: "" }).success,
    ).toBe(false);
  });

  it("rejects oversized notes", () => {
    expect(
      leadUpdateSchema.safeParse({
        status: "NEW",
        adminNotes: "x".repeat(10_001),
      }).success,
    ).toBe(false);
  });
});
