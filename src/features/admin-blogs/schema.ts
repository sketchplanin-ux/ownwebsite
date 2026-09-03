import { Timestamp } from "firebase/firestore";
import { z } from "zod";

import { toDate } from "@/lib/date";
import { isValidSlug } from "@/lib/slug";
import { isSafeHttpUrl } from "@/lib/url";
import type { Blog, BlogInput, TipTapDocument, TipTapNode } from "@/types/blog";

const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f]/;
const DATETIME_LOCAL_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;
const ALLOWED_NODE_TYPES = new Set([
  "doc",
  "text",
  "paragraph",
  "heading",
  "bulletList",
  "orderedList",
  "listItem",
  "blockquote",
  "codeBlock",
  "hardBreak",
  "horizontalRule",
  "image",
]);
const ALLOWED_MARK_TYPES = new Set([
  "bold",
  "strong",
  "italic",
  "em",
  "strike",
  "underline",
  "code",
  "link",
]);

export const EMPTY_TIPTAP_DOCUMENT: TipTapDocument = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isJsonValue(value: unknown, depth = 0): boolean {
  if (depth > 12) {
    return false;
  }
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean" ||
    (typeof value === "number" && Number.isFinite(value))
  ) {
    return true;
  }
  if (Array.isArray(value)) {
    return value.length <= 500 && value.every((item) => isJsonValue(item, depth + 1));
  }
  if (isRecord(value)) {
    return (
      Object.keys(value).length <= 100 &&
      Object.values(value).every((item) => isJsonValue(item, depth + 1))
    );
  }
  return false;
}

function validateTipTapNode(
  value: unknown,
  depth: number,
  counter: { nodes: number },
): value is TipTapNode {
  if (!isRecord(value) || depth > 20 || counter.nodes >= 5_000) {
    return false;
  }
  counter.nodes += 1;

  if (typeof value.type !== "string" || !ALLOWED_NODE_TYPES.has(value.type)) {
    return false;
  }
  if (value.text !== undefined && typeof value.text !== "string") {
    return false;
  }
  if (typeof value.text === "string" && value.text.length > 100_000) {
    return false;
  }
  if (value.attrs !== undefined && !isJsonValue(value.attrs)) {
    return false;
  }
  if (
    value.marks !== undefined &&
    (!Array.isArray(value.marks) ||
      value.marks.length > 50 ||
      !value.marks.every(
        (mark) =>
          isRecord(mark) &&
          typeof mark.type === "string" &&
          ALLOWED_MARK_TYPES.has(mark.type) &&
          (mark.attrs === undefined || isJsonValue(mark.attrs)),
      ))
  ) {
    return false;
  }
  if (
    value.content !== undefined &&
    (!Array.isArray(value.content) ||
      !value.content.every((node) =>
        validateTipTapNode(node, depth + 1, counter),
      ))
  ) {
    return false;
  }

  return true;
}

export function isTipTapDocument(value: unknown): value is TipTapDocument {
  if (!isRecord(value) || value.type !== "doc") {
    return false;
  }
  try {
    if (JSON.stringify(value).length > 200_000) {
      return false;
    }
  } catch {
    return false;
  }
  return validateTipTapNode(value, 0, { nodes: 0 });
}

export function readTipTapText(node: TipTapNode): string {
  if (node.type === "text") {
    return node.text ?? "";
  }
  return (node.content ?? []).map(readTipTapText).join(" ");
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

function isValidDatetimeLocal(value: string): boolean {
  if (value === "") {
    return true;
  }
  const match = DATETIME_LOCAL_PATTERN.exec(value);
  if (!match) {
    return false;
  }
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  const hours = Number(match[4]);
  const minutes = Number(match[5]);
  const parsed = new Date(year, monthIndex, day, hours, minutes);
  return (
    Number.isFinite(parsed.getTime()) &&
    parsed.getFullYear() === year &&
    parsed.getMonth() === monthIndex &&
    parsed.getDate() === day &&
    parsed.getHours() === hours &&
    parsed.getMinutes() === minutes
  );
}

export const blogFormSchema = z.object({
  title: cleanText("Title", 160),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required.")
    .max(160, "Slug must be 160 characters or fewer.")
    .refine(isValidSlug, "Use letters, numbers, and single hyphens only."),
  excerpt: cleanText("Excerpt", 500).refine(
    (value) => value.length >= 20,
    "Excerpt must be at least 20 characters.",
  ),
  // Keep the form-library boundary non-recursive. TipTapDocument is recursive,
  // which otherwise exceeds React Hook Form's path-type instantiation depth.
  // This still performs complete runtime validation before mapping to BlogInput.
  content: z.unknown().superRefine((value, context) => {
    if (!isTipTapDocument(value)) {
      context.addIssue({
        code: "custom",
        message: "Article content is invalid.",
      });
      return;
    }
    if (readTipTapText(value).trim().length < 20) {
      context.addIssue({
        code: "custom",
        message: "Article content must contain at least 20 characters of text.",
      });
    }
  }),
  featuredImageUrl: z
    .string()
    .trim()
    .min(1, "Upload a featured image.")
    .max(2_048, "Featured image URL is too long.")
    .refine(isSafeHttpUrl, "Use a valid HTTP or HTTPS image URL."),
  featuredImagePublicId: optionalText("Cloudinary public ID", 300),
  featuredImageAlt: cleanText("Featured image alternative text", 180),
  author: cleanText("Author", 120),
  category: optionalText("Category", 120),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  publishedAt: z
    .string()
    .trim()
    .refine(isValidDatetimeLocal, "Enter a valid publication date and time."),
  metaTitle: optionalText("SEO title", 70),
  metaDescription: optionalText("SEO description", 200),
});

export type BlogFormValues = z.infer<typeof blogFormSchema>;

function toDatetimeLocal(value: unknown): string {
  const date = toDate(value);
  if (!date) {
    return "";
  }
  const year = String(date.getFullYear()).padStart(4, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function createBlogFormValues(
  blog?: Blog | null,
  defaultAuthor = "",
): BlogFormValues {
  return {
    title: blog?.title ?? "",
    slug: blog?.slug ?? "",
    excerpt: blog?.excerpt ?? "",
    content: blog?.content ?? EMPTY_TIPTAP_DOCUMENT,
    featuredImageUrl: blog?.featuredImageUrl ?? "",
    featuredImagePublicId: blog?.featuredImagePublicId ?? "",
    featuredImageAlt: blog?.featuredImageAlt ?? "",
    author: blog?.author ?? defaultAuthor,
    category: blog?.category ?? "",
    status: blog?.status ?? "DRAFT",
    publishedAt: toDatetimeLocal(blog?.publishedAt),
    metaTitle: blog?.metaTitle ?? "",
    metaDescription: blog?.metaDescription ?? "",
  };
}

export type AdminBlogInput = Omit<BlogInput, "publishedAt"> & {
  publishedAt?: Timestamp;
};

export function blogFormValuesToInput(values: BlogFormValues): AdminBlogInput {
  if (!isTipTapDocument(values.content)) {
    throw new Error("Article content is invalid.");
  }
  const publishedDate = values.publishedAt
    ? new Date(values.publishedAt)
    : null;

  return {
    title: values.title.trim(),
    slug: values.slug.trim(),
    excerpt: values.excerpt.trim(),
    content: values.content,
    featuredImageUrl: values.featuredImageUrl.trim(),
    ...(values.featuredImagePublicId.trim()
      ? { featuredImagePublicId: values.featuredImagePublicId.trim() }
      : {}),
    featuredImageAlt: values.featuredImageAlt.trim(),
    author: values.author.trim(),
    ...(values.category.trim() ? { category: values.category.trim() } : {}),
    status: values.status,
    ...(publishedDate ? { publishedAt: Timestamp.fromDate(publishedDate) } : {}),
    ...(values.metaTitle.trim() ? { metaTitle: values.metaTitle.trim() } : {}),
    ...(values.metaDescription.trim()
      ? { metaDescription: values.metaDescription.trim() }
      : {}),
  };
}
