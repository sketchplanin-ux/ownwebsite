import { z } from "zod";

import { isDateOnly } from "@/lib/date";
import { isValidSlug } from "@/lib/slug";

const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f]/;

function isSecureHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.username === "" &&
      url.password === ""
    );
  } catch {
    return false;
  }
}

const cleanText = (label: string, maximum: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(maximum, `${label} must be ${maximum} characters or fewer.`)
    .refine(
      (value) => !CONTROL_CHARACTER_PATTERN.test(value),
      `${label} contains unsupported characters.`,
    );

const optionalText = (label: string, maximum: number) =>
  z
    .string()
    .trim()
    .max(maximum, `${label} must be ${maximum} characters or fewer.`)
    .refine(
      (value) => !CONTROL_CHARACTER_PATTERN.test(value),
      `${label} contains unsupported characters.`,
    );

const publicIdSchema = optionalText("Image object key", 300);
const imageUrlSchema = z
  .string()
  .trim()
  .min(1, "A secure image URL is required.")
  .max(2_048, "Image URL is too long.")
  .refine(isSecureHttpUrl, "Enter a valid HTTPS image URL.");

export const projectGalleryImageSchema = z.object({
  url: imageUrlSchema,
  publicId: publicIdSchema,
  alt: cleanText("Image alt text", 180),
  displayOrder: z
    .number()
    .int("Image order must be a whole number.")
    .min(0, "Image order cannot be negative.")
    .max(999, "Image order must be 999 or less."),
});

export const projectFormSchema = z.object({
  title: cleanText("Title", 140),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required.")
    .max(160, "Slug must be 160 characters or fewer.")
    .refine(isValidSlug, "Use letters, numbers, and single hyphens only."),
  shortDescription: optionalText("Short description", 320),
  description: cleanText("Description", 20_000),
  categoryId: cleanText("Category", 180),
  location: optionalText("Location", 180),
  clientName: optionalText("Client name", 180),
  projectType: optionalText("Project type", 180),
  completionDate: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || isDateOnly(value),
      "Enter a valid completion date.",
    ),
  coverImageUrl: imageUrlSchema,
  coverImagePublicId: publicIdSchema,
  coverImageAlt: cleanText("Cover image alt text", 180),
  galleryImages: z
    .array(projectGalleryImageSchema)
    .max(30, "A project can contain at most 30 gallery images."),
  featured: z.boolean(),
  published: z.boolean(),
  displayOrder: z
    .number()
    .int("Display order must be a whole number.")
    .min(0, "Display order cannot be negative.")
    .max(9_999, "Display order must be 9999 or less."),
  metaTitle: optionalText("Meta title", 180),
  metaDescription: optionalText("Meta description", 320),
});

export const projectCategoryFormSchema = z.object({
  name: cleanText("Category name", 100),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required.")
    .max(100, "Slug must be 100 characters or fewer.")
    .refine(isValidSlug, "Use letters, numbers, and single hyphens only."),
  description: optionalText("Description", 500),
  displayOrder: z
    .number()
    .int("Display order must be a whole number.")
    .min(0, "Display order cannot be negative.")
    .max(9_999, "Display order must be 9999 or less."),
  published: z.boolean(),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;
export type ProjectCategoryFormValues = z.infer<
  typeof projectCategoryFormSchema
>;

export const EMPTY_PROJECT_FORM: Readonly<ProjectFormValues> = Object.freeze({
  title: "",
  slug: "",
  shortDescription: "",
  description: "",
  categoryId: "",
  location: "",
  clientName: "",
  projectType: "",
  completionDate: "",
  coverImageUrl: "",
  coverImagePublicId: "",
  coverImageAlt: "",
  galleryImages: [],
  featured: false,
  published: false,
  displayOrder: 0,
  metaTitle: "",
  metaDescription: "",
});

export const EMPTY_PROJECT_CATEGORY_FORM: Readonly<ProjectCategoryFormValues> =
  Object.freeze({
    name: "",
    slug: "",
    description: "",
    displayOrder: 0,
    published: true,
  });
