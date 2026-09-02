import { describe, expect, it } from "vitest";

import {
  createServiceFormValues,
  serviceFormSchema,
  toServiceInput,
} from "@/features/admin-services/schema";

describe("service admin schema", () => {
  it("maps a valid form into a trimmed Firestore input", () => {
    const values = {
      ...createServiceFormValues(),
      title: " Architecture Design ",
      slug: "architecture-design",
      shortDescription: " A complete architecture design service. ",
      description: " A complete description of the architecture design service. ",
      images: [{ url: "https://res.cloudinary.com/demo/image/upload/a.jpg", publicId: "sketchplan/a", alt: "" }],
      imageAlt: " Architectural model ",
      features: [{ value: " Planning " }, { value: "" }],
    };
    const parsed = serviceFormSchema.parse(values);
    expect(toServiceInput(parsed)).toMatchObject({
      title: "Architecture Design",
      features: ["Planning"],
      imageAlt: "Architectural model",
    });
  });

  it("rejects an unsafe slug and missing image", () => {
    expect(
      serviceFormSchema.safeParse({
        ...createServiceFormValues(),
        title: "Architecture",
        slug: "Architecture Design",
        shortDescription: "A sufficiently descriptive summary.",
        description: "A sufficiently detailed description for this service.",
        imageAlt: "Architecture",
      }).success,
    ).toBe(false);
  });
});
