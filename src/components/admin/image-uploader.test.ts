import { describe, expect, it } from "vitest";

import {
  createSafeFileStem,
  parseMediaUploadPayload,
} from "@/components/admin/image-uploader";

describe("R2 upload response validation", () => {
  const validPayload = {
    url: "https://cdn.test.example/sketchplan/example-a1b2c3d4e5f6.webp",
    key: "sketchplan/example-a1b2c3d4e5f6.webp",
    contentType: "image/webp",
    bytes: 500_000,
  };

  it("accepts a bounded HTTPS response from the media host", () => {
    expect(parseMediaUploadPayload(validPayload)).toMatchObject({
      url: validPayload.url,
      key: validPayload.key,
      contentType: "image/webp",
    });
  });

  it("rejects an insecure URL or a host that is not the media bucket", () => {
    expect(
      parseMediaUploadPayload({ ...validPayload, url: "http://cdn.test.example/a.webp" }),
    ).toBeNull();
    expect(
      parseMediaUploadPayload({
        ...validPayload,
        url: "https://attacker.example/sketchplan/a.webp",
      }),
    ).toBeNull();
  });

  it("rejects a disallowed content type, object prefix, or extension", () => {
    expect(
      parseMediaUploadPayload({ ...validPayload, contentType: "image/gif" }),
    ).toBeNull();
    expect(
      parseMediaUploadPayload({
        ...validPayload,
        url: "https://cdn.test.example/elsewhere/example.webp",
        key: "elsewhere/example.webp",
      }),
    ).toBeNull();
    expect(
      parseMediaUploadPayload({
        ...validPayload,
        url: "https://cdn.test.example/sketchplan/example.svg",
        key: "sketchplan/example.svg",
      }),
    ).toBeNull();
  });

  it("creates a safe ASCII file stem", () => {
    expect(createSafeFileStem("My Plan (Final)!.png")).toBe("my-plan-final");
  });
});
