"use client"

import * as React from "react"
import { SearchIcon } from "lucide-react"

import { EmptyState } from "@/components/common/empty-state"
import { ErrorState } from "@/components/common/error-state"
import { LoadingState } from "@/components/common/loading-state"
import { Input } from "@/components/ui/input"
import { BlogCard } from "@/features/blogs/blog-card"
import { usePublishedBlogs } from "@/features/blogs/hooks"
import type { Blog } from "@/types/blog"

interface BlogGridProps {
  blogs: readonly Blog[]
  headingLevel?: 2 | 3
}

function BlogGrid({ blogs, headingLevel = 2 }: BlogGridProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {blogs.map((blog) => (
        <BlogCard key={blog.id} blog={blog} headingLevel={headingLevel} />
      ))}
    </div>
  )
}

function searchableText(blog: Blog) {
  return [blog.title, blog.excerpt, blog.author, blog.category ?? ""]
    .join(" ")
    .toLocaleLowerCase("en-IN")
}

function BlogListing() {
  const [search, setSearch] = React.useState("")
  const { data: blogs = [], error, isError, isLoading, refetch } =
    usePublishedBlogs(18)
  const normalizedSearch = search.trim().toLocaleLowerCase("en-IN")
  const visibleBlogs = React.useMemo(
    () =>
      normalizedSearch
        ? blogs.filter((blog) => searchableText(blog).includes(normalizedSearch))
        : blogs,
    [blogs, normalizedSearch]
  )

  if (isLoading) {
    return <LoadingState message="Loading journal articles…" />
  }

  if (isError) {
    return (
      <ErrorState
        title="The journal could not be loaded"
        description={error.message}
        onRetry={() => void refetch()}
      />
    )
  }

  if (blogs.length === 0) {
    return (
      <EmptyState
        title="No articles published yet"
        description="New architecture and design stories will appear here once published."
      />
    )
  }

  return (
    <div className="space-y-8">
      <div className="relative max-w-xl">
        <label htmlFor="blog-search" className="sr-only">
          Search loaded articles
        </label>
        <SearchIcon
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          id="blog-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search the latest articles"
          className="h-11 pl-10"
        />
      </div>

      {visibleBlogs.length > 0 ? (
        <BlogGrid blogs={visibleBlogs} />
      ) : (
        <EmptyState
          title="No matching articles"
          description="Try another word or clear the search to see the loaded articles."
        />
      )}
    </div>
  )
}

export { BlogGrid, BlogListing, type BlogGridProps }
