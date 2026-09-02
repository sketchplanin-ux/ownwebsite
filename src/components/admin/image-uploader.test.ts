import { describe, expect, it } from "vitest";

import {
  createSafeFileStem,
  parseCloudinaryPayload,
} from "@/components/admin/image-uploader";

describe("Cloudinary upload response validation", () => {
  const validPayload = {
    secure_url: "https://res.cloudinary.com/demo/image/upload/sketchplan/example.webp",
    public_id: "sketchplan/example",
    width: 1200,
    height: 800,
    format: "webp",
    bytes: 500_000,
  };

  it("accepts a bounded HTTPS image response", () => {
    expect(parseCloudinaryPayload(validPayload)).toMatchObject({
      secureUrl: validPayload.secure_url,
      publicId: validPayload.public_id,
      format: "webp",
    });
  });

  it("rejects an insecure URL or disallowed response format", () => {
    expect(
      parseCloudinaryPayload({ ...validPayload, secure_url: "http://example.com/a.webp" }),
    ).toBeNull();
    expect(parseCloudinaryPayload({ ...validPayload, format: "gif" })).toBeNull();
  });

  it("creates a safe ASCII file stem", () => {
    expect(createSafeFileStem("My Plan (Final)!.png")).toBe("my-plan-final");
  });
});
