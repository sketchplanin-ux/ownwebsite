import { afterEach, describe, expect, it, vi } from "vitest";

import { logger, sanitizeLogData } from "@/lib/logger";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("logger", () => {
  it("redacts nested credentials and handles circular data", () => {
    const data: Record<string, unknown> = {
      email: "admin@example.com",
      password: "private",
      nested: { authToken: "secret" },
    };
    data.circular = data;

    expect(sanitizeLogData(data)).toEqual({
      email: "admin@example.com",
      password: "[REDACTED]",
      nested: { authToken: "[REDACTED]" },
      circular: "[Circular]",
    });
  });

  it("does not emit technical details in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    logger.error("failed", new Error("detail"));
    expect(spy).not.toHaveBeenCalled();
  });
});
