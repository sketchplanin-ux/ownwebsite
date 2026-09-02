import { orderBy, where } from "firebase/firestore"

import { COLLECTIONS } from "@/firebase/collections"
import { readCollection } from "@/firebase/firestore"
import { isValidSlug } from "@/lib/slug"
import type { Blog } from "@/types/blog"

const DEFAULT_BLOG_LIMIT = 12
const MAX_BLOG_LIMIT = 24

type StoredBlog = Omit<Blog, "id">

function normalizeBlogLimit(
  requestedLimit: number | undefined,
  fallback = DEFAULT_BLOG_LIMIT
): number {
  const safeFallback = Number.isFinite(fallback)
    ? Math.min(MAX_BLOG_LIMIT, Math.max(1, Math.floor(fallback)))
    : DEFAULT_BLOG_LIMIT

  if (requestedLimit === undefined || !Number.isFinite(requestedLimit)) {
    return safeFallback
  }

  return Math.min(MAX_BLOG_LIMIT, Math.max(1, Math.floor(requestedLimit)))
}

async function getPublishedBlogs(requestedLimit?: number): Promise<Blog[]> {
  const maxResults = normalizeBlogLimit(requestedLimit)

  return readCollection<StoredBlog>(COLLECTIONS.blogs, {
    constraints: [
      where("status", "==", "PUBLISHED"),
      orderBy("publishedAt", "desc"),
    ],
    maxResults,
  })
}

async function getPublishedBlogBySlug(slug: string): Promise<Blog | null> {
  const normalizedSlug = slug.trim()
  if (!isValidSlug(normalizedSlug)) {
    return null
  }

  const matches = await readCollection<StoredBlog>(COLLECTIONS.blogs, {
    constraints: [
      where("status", "==", "PUBLISHED"),
      where("slug", "==", normalizedSlug),
    ],
    maxResults: 1,
  })

  return matches[0] ?? null
}

export {
  DEFAULT_BLOG_LIMIT,
  MAX_BLOG_LIMIT,
  getPublishedBlogBySlug,
  getPublishedBlogs,
  normalizeBlogLimit,
}
