"use client"

import { useQuery } from "@tanstack/react-query"

import {
  getPublishedBlogBySlug,
  getPublishedBlogs,
  normalizeBlogLimit,
} from "@/features/blogs/api"
import { isValidSlug } from "@/lib/slug"

const blogQueryKeys = {
  all: ["blogs", "public"] as const,
  detail: (slug: string) => ["blogs", "public", "detail", slug] as const,
  list: (resultLimit: number) =>
    ["blogs", "public", "list", resultLimit] as const,
}

function usePublishedBlogs(resultLimit = 12) {
  const safeLimit = normalizeBlogLimit(resultLimit)

  return useQuery({
    queryKey: blogQueryKeys.list(safeLimit),
    queryFn: () => getPublishedBlogs(safeLimit),
  })
}

function useLatestBlogs(resultLimit = 3) {
  const safeLimit = normalizeBlogLimit(resultLimit, 3)

  return useQuery({
    queryKey: blogQueryKeys.list(safeLimit),
    queryFn: () => getPublishedBlogs(safeLimit),
  })
}

function usePublishedBlog(slug: string) {
  const normalizedSlug = slug.trim()
  const canQuery = isValidSlug(normalizedSlug)

  return useQuery({
    queryKey: blogQueryKeys.detail(normalizedSlug),
    queryFn: () => getPublishedBlogBySlug(normalizedSlug),
    enabled: canQuery,
  })
}

export {
  blogQueryKeys,
  useLatestBlogs,
  usePublishedBlog,
  usePublishedBlogs,
}
