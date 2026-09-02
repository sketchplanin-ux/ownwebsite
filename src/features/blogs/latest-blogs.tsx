"use client"

import Link from "next/link"

import { EmptyState } from "@/components/common/empty-state"
import { ErrorState } from "@/components/common/error-state"
import { LoadingState } from "@/components/common/loading-state"
import { Button } from "@/components/ui/button"
import { SectionHeading } from "@/components/website/section-heading"
import { BlogGrid } from "@/features/blogs/blog-listing"
import { useLatestBlogs } from "@/features/blogs/hooks"
import { cn } from "@/lib/utils"

interface LatestBlogsProps {
  className?: string
  limit?: number
  showHeading?: boolean
}

function LatestBlogs({
  className,
  limit = 3,
  showHeading = true,
}: LatestBlogsProps) {
  const { data: blogs = [], error, isError, isLoading, refetch } =
    useLatestBlogs(limit)

  return (
    <section
      className={cn("space-y-8", className)}
      aria-labelledby={showHeading ? "latest-blogs-title" : undefined}
      aria-label={showHeading ? undefined : "Latest articles"}
    >
      {showHeading && (
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            id="latest-blogs-title"
            eyebrow="Journal"
            title="Ideas, materials, and places"
            description="Notes from our work across architecture, interiors, and planning."
          />
          <Button asChild variant="outline">
            <Link href="/blog/">View all articles</Link>
          </Button>
        </div>
      )}

      {isLoading && <LoadingState message="Loading recent articles…" />}
      {isError && (
        <ErrorState
          title="Recent articles could not be loaded"
          description={error.message}
          onRetry={() => void refetch()}
        />
      )}
      {!isLoading && !isError && blogs.length === 0 && (
        <EmptyState
          title="No articles published yet"
          description="Our latest studio notes will appear here once published."
        />
      )}
      {!isLoading && !isError && blogs.length > 0 && (
        <BlogGrid blogs={blogs} headingLevel={showHeading ? 3 : 2} />
      )}
    </section>
  )
}

export { LatestBlogs, type LatestBlogsProps }
