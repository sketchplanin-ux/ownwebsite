import {
  deleteField,
  orderBy,
  serverTimestamp,
  where,
  type DocumentData,
  type FieldValue,
  type WithFieldValue,
} from "firebase/firestore";

import { COLLECTIONS } from "@/firebase/collections";
import {
  createDocument,
  readCollection,
  readDocument,
  removeDocument,
  updateDocument,
} from "@/firebase/firestore";
import type { Blog, BlogInput } from "@/types/blog";
import type { FirestoreTimestamp } from "@/types/common";

import type { AdminBlogInput } from "./schema";

type StoredBlog = Omit<Blog, "id">;

export const ADMIN_BLOG_READ_LIMIT = 100;

export class AdminBlogConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminBlogConflictError";
  }
}

function normalizeDocumentId(value: string): string {
  const documentId = value.trim();
  if (
    !documentId ||
    documentId.includes("/") ||
    /[\u0000-\u001f\u007f]/.test(documentId)
  ) {
    throw new Error("The requested blog identifier is invalid.");
  }
  return documentId;
}

export async function getAdminBlogs(): Promise<Blog[]> {
  return readCollection<StoredBlog>(COLLECTIONS.blogs, {
    constraints: [orderBy("updatedAt", "desc")],
    maxResults: ADMIN_BLOG_READ_LIMIT,
  });
}

export async function getAdminBlog(blogId: string): Promise<Blog | null> {
  return readDocument<StoredBlog>(
    COLLECTIONS.blogs,
    normalizeDocumentId(blogId),
  );
}

async function blogSlugAvailable(
  slug: string,
  excludedBlogId?: string,
): Promise<boolean> {
  const matches = await readCollection<StoredBlog>(COLLECTIONS.blogs, {
    constraints: [where("slug", "==", slug)],
    maxResults: 2,
  });
  return matches.every((blog) => blog.id === excludedBlogId);
}

function createPublicationValue(
  input: AdminBlogInput,
): AdminBlogInput["publishedAt"] | FieldValue | undefined {
  if (input.status === "DRAFT") {
    return undefined;
  }
  if (input.status === "PUBLISHED") {
    return input.publishedAt ?? serverTimestamp();
  }
  return input.publishedAt;
}

export async function createAdminBlog(input: AdminBlogInput): Promise<string> {
  if (!(await blogSlugAvailable(input.slug))) {
    throw new AdminBlogConflictError(
      "Another blog post already uses this slug. Choose a different slug.",
    );
  }

  const blogFields = { ...input };
  delete blogFields.publishedAt;
  const publicationValue = createPublicationValue(input);
  const payload: WithFieldValue<BlogInput> = {
    ...blogFields,
    ...(publicationValue ? { publishedAt: publicationValue } : {}),
  };
  return createDocument<BlogInput>(COLLECTIONS.blogs, payload);
}

export async function updateAdminBlog(
  blogId: string,
  input: AdminBlogInput,
  existingPublishedAt?: FirestoreTimestamp,
): Promise<void> {
  const documentId = normalizeDocumentId(blogId);
  if (!(await blogSlugAvailable(input.slug, documentId))) {
    throw new AdminBlogConflictError(
      "Another blog post already uses this slug. Choose a different slug.",
    );
  }

  const publicationValue =
    input.status === "DRAFT"
      ? deleteField()
      : input.status === "PUBLISHED"
        ? (input.publishedAt ?? existingPublishedAt ?? serverTimestamp())
        : (input.publishedAt ?? existingPublishedAt ?? deleteField());

  // Firestore's recursive UpdateData type cannot represent TipTap's recursive
  // JSON node shape without hitting TypeScript's instantiation depth limit.
  // The form schema validates the complete document before this boundary.
  await updateDocument<DocumentData>(COLLECTIONS.blogs, documentId, {
    ...input,
    publishedAt: publicationValue,
    ...(!input.featuredImagePublicId
      ? { featuredImagePublicId: deleteField() }
      : {}),
    ...(!input.category ? { category: deleteField() } : {}),
    ...(!input.metaTitle ? { metaTitle: deleteField() } : {}),
    ...(!input.metaDescription ? { metaDescription: deleteField() } : {}),
  });
}

export async function deleteAdminBlog(blogId: string): Promise<void> {
  await removeDocument(COLLECTIONS.blogs, normalizeDocumentId(blogId));
}
