import { describe, expect, it } from "vitest";

import {
  phoneNumberSchema,
  verificationCodeSchema,
} from "@/features/auth/login-schema";

describe("phoneNumberSchema", () => {
  it.each(["+919876543210", "+14155552671", "+4407911123456"])(
    "accepts the international number %s",
    (phoneNumber) => {
      expect(phoneNumberSchema.safeParse({ phoneNumber }).success).toBe(true);
    },
  );

  it("trims surrounding whitespace before validating", () => {
    const result = phoneNumberSchema.safeParse({
      phoneNumber: "  +919876543210  ",
    });

    expect(result.success).toBe(true);
    expect(result.data?.phoneNumber).toBe("+919876543210");
  });

  it.each([
    ["", "an empty value"],
    ["9876543210", "a number without a country code"],
    ["+0119876543210", "a country code starting with zero"],
    ["+91 98765 43210", "spaces between digits"],
    ["+91-98765-43210", "separators between digits"],
    ["+9198765", "fewer digits than E.164 allows"],
    ["+9198765432109876", "more digits than E.164 allows"],
    ["+91abcdefghij", "non-digit characters"],
  ])("rejects %s (%s)", (phoneNumber) => {
    expect(phoneNumberSchema.safeParse({ phoneNumber }).success).toBe(false);
  });
});

describe("verificationCodeSchema", () => {
  it("accepts a 6-digit code", () => {
    expect(verificationCodeSchema.safeParse({ code: "123456" }).success).toBe(
      true,
    );
  });

  it.each([
    ["12345", "five digits"],
    ["1234567", "seven digits"],
    ["12345a", "a non-digit character"],
    ["", "an empty value"],
  ])("rejects %s (%s)", (code) => {
    expect(verificationCodeSchema.safeParse({ code }).success).toBe(false);
  });
});
