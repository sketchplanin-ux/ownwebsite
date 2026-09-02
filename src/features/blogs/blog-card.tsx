import { ArrowUpRightIcon, CalendarDaysIcon } from "lucide-react"
import Link from "next/link"

import { ResponsiveImage } from "@/components/website/responsive-image"
import { formatDate } from "@/lib/date"
import { cn } from "@/lib/utils"
import type { Blog } from "@/types/blog"

interface BlogCardProps {
  blog: Blog
  className?: string
  headingLevel?: 2 | 3
}

function BlogCard({ blog, className, headingLevel = 2 }: BlogCardProps) {
  const href = `/blog/view/?slug=${encodeURIComponent(blog.slug)}`
  const publishedLabel = formatDate(blog.publishedAt, undefined, "en-IN", "")
  const Heading = headingLevel === 3 ? "h3" : "h2"

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-transform hover:-translate-y-1",
        className
      )}
    >
      {blog.featuredImageUrl ? (
        <ResponsiveImage
          src={blog.featuredImageUrl}
          alt={blog.featuredImageAlt || blog.title}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="aspect-[16/10] w-full object-cover"
        />
      ) : (
        <div aria-hidden="true" className="aspect-[16/10] bg-muted" />
      )}

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {blog.category && <span>{blog.category}</span>}
          {publishedLabel && (
            <span className="inline-flex items-center gap-1.5">
              <CalendarDaysIcon aria-hidden="true" className="size-3.5" />
              {publishedLabel}
            </span>
          )}
        </div>

        <Heading className="text-xl leading-snug font-semibold text-balance">
          <Link
            href={href}
            className="rounded-sm outline-none after:absolute focus-visible:ring-2 focus-visible:ring-ring"
          >
            {blog.title}
          </Link>
        </Heading>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
          {blog.excerpt}
        </p>

        <Link
          href={href}
          aria-label={`Read ${blog.title}`}
          className="mt-6 inline-flex w-fit items-center gap-1.5 rounded-sm text-sm font-semibold outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
        >
          Read article
          <ArrowUpRightIcon aria-hidden="true" className="size-4" />
        </Link>
      </div>
    </article>
  )
}

export { BlogCard, type BlogCardProps }
