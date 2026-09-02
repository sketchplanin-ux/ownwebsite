import type { AuditedDocument, JsonValue, SeoFields } from "./common";

export type BlogStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface TipTapMark {
  type: string;
  attrs?: Record<string, JsonValue>;
}

export interface TipTapNode {
  type: string;
  attrs?: Record<string, JsonValue>;
  content?: TipTapNode[];
  marks?: TipTapMark[];
  text?: string;
}

export interface TipTapDocument extends TipTapNode {
  type: "doc";
}

export interface Blog extends AuditedDocument, SeoFields {
  title: string;
  slug: string;
  excerpt: string;
  content: TipTapDocument;
  featuredImageUrl: string;
  featuredImagePublicId?: string;
  featuredImageAlt: string;
  author: string;
  category?: string;
  status: BlogStatus;
  publishedAt?: import("./common").FirestoreTimestamp;
}

export type BlogInput = Omit<Blog, "id" | "createdAt" | "updatedAt">;
