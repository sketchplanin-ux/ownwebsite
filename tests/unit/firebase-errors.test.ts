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

  it("does not expose unknown raw error messages", () => {
    const error = mapFirebaseError(
      new Error("internal implementation detail"),
      "Please try again.",
    );

    expect(error.message).toBe("Please try again.");
    expect(error.message).not.toContain("internal implementation detail");
  });
});
