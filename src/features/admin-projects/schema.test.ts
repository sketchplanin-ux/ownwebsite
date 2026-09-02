import { describe, expect, it } from "vitest";

import { projectFormValuesToInput } from "./mappers";
import {
  projectCategoryFormSchema,
  projectFormSchema,
  type ProjectFormValues,
} from "./schema";
import type { ProjectCategory } from "@/types/project";

const validProject: ProjectFormValues = {
  title: "Courtyard House",
  slug: "courtyard-house",
  shortDescription: "A compact residential project.",
  description: "A considered project description.",
  categoryId: "residential",
  location: "",
  clientName: "",
  projectType: "Residential",
  completionDate: "2026-08-02",
  coverImageUrl: "https://cdn.test.example/sketchplan/cover.webp",
  coverImagePublicId: "sketchplan/projects/cover",
  coverImageAlt: "Courtyard house exterior",
  galleryImages: [
    {
      url: "https://cdn.test.example/sketchplan/gallery-1.webp",
      publicId: "sketchplan/projects/gallery-1",
      alt: "Courtyard view",
      displayOrder: 0,
    },
  ],
  featured: true,
  published: false,
  displayOrder: 2,
  metaTitle: "Courtyard House",
  metaDescription: "A compact residential project by SKETCHPLAN.",
};

const timestamp = {
  seconds: 0,
  nanoseconds: 0,
  toDate: () => new Date(0),
};

const category: ProjectCategory = {
  id: "residential",
  name: "Residential",
  slug: "residential",
  published: true,
  displayOrder: 1,
  createdAt: timestamp,
  updatedAt: timestamp,
};

describe("admin project schemas", () => {
  it("accepts a complete valid project", () => {
    expect(projectFormSchema.safeParse(validProject).success).toBe(true);
  });

  it("rejects non-HTTPS media URLs", () => {
    const result = projectFormSchema.safeParse({
      ...validProject,
      coverImageUrl: "http://cdn.test.example/sketchplan/cover.webp",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid date-only completion values", () => {
    const result = projectFormSchema.safeParse({
      ...validProject,
      completionDate: "2026-02-31",
    });
    expect(result.success).toBe(false);
  });

  it("validates category slugs", () => {
    const result = projectCategoryFormSchema.safeParse({
      name: "Residential",
      slug: "Residential spaces",
      description: "",
      displayOrder: 1,
      published: true,
    });
    expect(result.success).toBe(false);
  });

  it("maps category identity and normalized gallery order", () => {
    const input = projectFormValuesToInput(
      {
        ...validProject,
        galleryImages: [
          { ...validProject.galleryImages[0], displayOrder: 14 },
          {
            url: "https://cdn.test.example/sketchplan/gallery-2.webp",
            publicId: "",
            alt: "Interior view",
            displayOrder: 3,
          },
        ],
      },
      [category],
    );

    expect(input.category).toBe("Residential");
    expect(input.galleryImages.map((image) => image.displayOrder)).toEqual([
      0, 1,
    ]);
    expect(input.galleryImages[1]).not.toHaveProperty("publicId");
  });
});
