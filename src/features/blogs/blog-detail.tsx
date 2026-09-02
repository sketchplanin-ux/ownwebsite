"use client"

import { CalendarDaysIcon, ChevronLeftIcon } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

import { EmptyState } from "@/components/common/empty-state"
import { ErrorState } from "@/components/common/error-state"
import { LoadingState } from "@/components/common/loading-state"
import { JsonLd } from "@/components/website/json-ld"
import { ResponsiveImage } from "@/components/website/responsive-image"
import { usePublishedBlog } from "@/features/blogs/hooks"
import { TipTapContent } from "@/features/blogs/tiptap-content"
import { formatDate, toIsoString } from "@/lib/date"
import { isValidSlug } from "@/lib/slug"
import { isSafeHttpUrl } from "@/lib/url"
import type { Blog } from "@/types/blog"

function resolvePublicUrl(path: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "")
  return siteUrl ? `${siteUrl}${path}` : path
}

function createBlogStructuredData(blog: Blog) {
  const articlePath = `/blog/view/?slug=${encodeURIComponent(blog.slug)}`
  const articleUrl = resolvePublicUrl(articlePath)
  const publishedAt = toIsoString(blog.publishedAt)
  const updatedAt = toIsoString(blog.updatedAt)
  const image = isSafeHttpUrl(blog.featuredImageUrl)
    ? blog.featuredImageUrl
    : undefined

  return [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: blog.title,
      description: blog.metaDescription?.trim() || blog.excerpt,
      mainEntityOfPage: articleUrl,
      ...(image ? { image } : {}),
      ...(publishedAt ? { datePublished: publishedAt } : {}),
      ...(updatedAt ? { dateModified: updatedAt } : {}),
      author: {
        "@type": "Person",
        name: blog.author.trim() || "SKETCHPLAN",
      },
      publisher: {
        "@type": "Organization",
        name: "SKETCHPLAN",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: resolvePublicUrl("/"),
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Journal",
          item: resolvePublicUrl("/blog/"),
        },
        {
          "@type": "ListItem",
          position: 3,
          name: blog.title,
          item: articleUrl,
        },
      ],
    },
  ]
}

function BlogDetail() {
  const searchParams = useSearchParams()
  const slug = searchParams.get("slug")?.trim() ?? ""
  const validSlug = isValidSlug(slug)
  const { data: blog, error, isError, isLoading, refetch } =
    usePublishedBlog(slug)

  if (!validSlug) {
    return (
      <EmptyState
        title="Choose an article"
        description="This article link is incomplete. Return to the journal to choose a published story."
        action={
          <Link className="font-semibold underline underline-offset-4" href="/blog/">
            Browse the journal
          </Link>
        }
      />
    )
  }

  if (isLoading) {
    return <LoadingState variant="page" message="Loading article…" />
  }

  if (isError) {
    return (
      <ErrorState
        title="This article could not be loaded"
        description={error.message}
        onRetry={() => void refetch()}
      />
    )
  }

  if (!blog) {
    return (
      <EmptyState
        title="Article not found"
        description="It may have been unpublished or the link may no longer be current."
        action={
          <Link className="font-semibold underline underline-offset-4" href="/blog/">
            Browse published articles
          </Link>
        }
      />
    )
  }

  const publishedLabel = formatDate(blog.publishedAt, undefined, "en-IN", "")

  return (
    <article className="mx-auto w-full max-w-5xl">
      <JsonLd data={createBlogStructuredData(blog)} />

      <Link
        href="/blog/"
        className="mb-10 inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ChevronLeftIcon aria-hidden="true" className="size-4" />
        Back to journal
      </Link>

      <header className="mx-auto max-w-3xl text-center">
        {blog.category && (
          <p className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
            {blog.category}
          </p>
        )}
        <h1 className="mt-4 text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
          {blog.title}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-pretty text-muted-foreground">
          {blog.excerpt}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
          <span>{blog.author}</span>
          {publishedLabel && (
            <span className="inline-flex items-center gap-1.5">
              <CalendarDaysIcon aria-hidden="true" className="size-4" />
              {publishedLabel}
            </span>
          )}
        </div>
      </header>

      {blog.featuredImageUrl && (
        <ResponsiveImage
          src={blog.featuredImageUrl}
          alt={blog.featuredImageAlt || blog.title}
          sizes="(max-width: 1024px) 100vw, 1024px"
          className="mt-12 aspect-[16/9] w-full rounded-2xl object-cover"
        />
      )}

      <TipTapContent
        document={blog.content}
        className="mx-auto mt-12 max-w-3xl"
      />
    </article>
  )
}

export { BlogDetail, createBlogStructuredData }
