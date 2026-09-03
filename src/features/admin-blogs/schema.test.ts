import { describe, expect, it } from "vitest";

import {
  blogFormSchema,
  blogFormValuesToInput,
  isTipTapDocument,
  type BlogFormValues,
} from "./schema";

const validBlog: BlogFormValues = {
  title: "Designing a Courtyard Home",
  slug: "designing-a-courtyard-home",
  excerpt: "A practical guide to planning a calm, climate-aware courtyard home.",
  content: {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Courtyards can bring daylight and ventilation deep into a home.",
          },
        ],
      },
    ],
  },
  featuredImageUrl:
    "https://res.cloudinary.com/example/image/upload/courtyard.webp",
  featuredImagePublicId: "sketchplan/blog/courtyard",
  featuredImageAlt: "A planted courtyard in a contemporary home",
  author: "SKETCHPLAN Studio",
  category: "Residential design",
  status: "PUBLISHED",
  publishedAt: "2026-08-02T14:30",
  metaTitle: "Designing a Courtyard Home",
  metaDescription: "Practical ideas for a climate-aware courtyard home.",
};

describe("admin blog schema", () => {
  it("accepts a complete blog post", () => {
    expect(blogFormSchema.safeParse(validBlog).success).toBe(true);
  });

  it("rejects an empty rich-text document", () => {
    const result = blogFormSchema.safeParse({
      ...validBlog,
      content: { type: "doc", content: [{ type: "paragraph" }] },
    });
    expect(result.success).toBe(false);
  });

  it("rejects unsupported rich-text nodes and unsafe image URLs", () => {
    expect(
      isTipTapDocument({
        type: "doc",
        content: [{ type: "script", content: [] }],
      }),
    ).toBe(false);
    expect(
      blogFormSchema.safeParse({
        ...validBlog,
        featuredImageUrl: "javascript:alert(1)",
      }).success,
    ).toBe(false);
  });

  it("rejects calendar dates that JavaScript would silently normalize", () => {
    expect(
      blogFormSchema.safeParse({
        ...validBlog,
        publishedAt: "2026-02-31T14:30",
      }).success,
    ).toBe(false);
  });

  it("trims values, omits blanks, and creates a Firestore timestamp", () => {
    const input = blogFormValuesToInput({
      ...validBlog,
      category: " ",
      featuredImagePublicId: " ",
      metaDescription: " ",
      title: "  Designing a Courtyard Home  ",
    });

    expect(input.title).toBe("Designing a Courtyard Home");
    expect(input).not.toHaveProperty("category");
    expect(input).not.toHaveProperty("featuredImagePublicId");
    expect(input).not.toHaveProperty("metaDescription");
    expect(input.publishedAt?.toDate()).toEqual(
      new Date("2026-08-02T14:30"),
    );
  });
});
