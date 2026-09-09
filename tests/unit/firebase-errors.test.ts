import { describe, expect, it } from "vitest";

import {
  FirebaseFriendlyError,
  mapFirebaseError,
} from "@/firebase/errors";

describe("mapFirebaseError", () => {
  it("maps known Firebase codes to safe messages", () => {
    const error = mapFirebaseError({ code: "auth/invalid-credential" });

    expect(error).toBeInstanceOf(FirebaseFriendlyError);
    expect(error.message).toBe("The email or password is incorrect.");
  });

  it.each([
    "auth/popup-closed-by-user",
    "auth/popup-blocked",
    "auth/account-exists-with-different-credential",
    "auth/unauthorized-domain",
    "auth/invalid-phone-number",
    "auth/quota-exceeded",
    "auth/captcha-check-failed",
    "auth/invalid-verification-code",
    "auth/code-expired",
    "auth/phone-challenge-missing",
  ])("maps the Google and phone sign-in code %s", (code) => {
    const error = mapFirebaseError({ code }, "UNUSED FALLBACK");

    expect(error.code).toBe(code);
    expect(error.message).not.toBe("UNUSED FALLBACK");
  });

  it.each(["failed-precondition", "firestore/failed-precondition"])(
    "explains a missing composite index for %s",
    (code) => {
      const error = mapFirebaseError({ code }, "UNUSED FALLBACK");

      expect(error.message).toContain("index");
      expect(error.message).not.toBe("UNUSED FALLBACK");
    },
  );

  it("does not expose unknown raw error messages", () => {
    const error = mapFirebaseError(
      new Error("internal implementation detail"),
      "Please try again.",
    );

    expect(error.message).toBe("Please try again.");
    expect(error.message).not.toContain("internal implementation detail");
  });
});
