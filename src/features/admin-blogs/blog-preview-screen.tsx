"use client";

import {
  ArrowLeft,
  CalendarDays,
  Edit3,
  ExternalLink,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { StatusBadge } from "@/components/common/status-badge";
import { ResponsiveImage } from "@/components/website/responsive-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PERMISSIONS } from "@/features/auth/permissions";
import { TipTapContent } from "@/features/blogs/tiptap-content";
import { useAdmin } from "@/hooks/use-admin";
import { ADMIN_ROUTES, PUBLIC_ROUTES } from "@/lib/constants";
import { formatDate } from "@/lib/date";

import {
  AdminBlogsAccessDenied,
  AdminBlogsAccessLoading,
} from "./access-state";
import { useAdminBlog } from "./hooks";

function BackToBlogsAction() {
  return (
    <Button asChild variant="outline">
      <Link href={ADMIN_ROUTES.blogs}>
        <ArrowLeft aria-hidden="true" />
        Back to blogs
      </Link>
    </Button>
  );
}

export function BlogPreviewScreen() {
  const searchParams = useSearchParams();
  const blogId = searchParams.get("id")?.trim() ?? "";
  const admin = useAdmin();
  const canManage = admin.can(PERMISSIONS.MANAGE_BLOGS);
  const blogQuery = useAdminBlog(blogId, canManage && Boolean(blogId));

  if (admin.isLoading) {
    return <AdminBlogsAccessLoading />;
  }
  if (!canManage) {
    return <AdminBlogsAccessDenied />;
  }
  if (!blogId) {
    return (
      <EmptyState
        title="No blog post selected"
        description="Open a post from the blog list to preview it."
        action={<BackToBlogsAction />}
      />
    );
  }
  if (blogQuery.isPending) {
    return <LoadingState variant="page" message="Loading blog preview…" />;
  }
  if (blogQuery.isError) {
    return (
      <ErrorState
        title="Blog preview unavailable"
        description={blogQuery.error.message}
        onRetry={() => void blogQuery.refetch()}
      />
    );
  }
  if (!blogQuery.data) {
    return (
      <EmptyState
        title="Blog post not found"
        description="This post may have been deleted or the link may be invalid."
        action={<BackToBlogsAction />}
      />
    );
  }

  const blog = blogQuery.data;

  return (
    <article className="space-y-8">
      <header className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={blog.status} />
            {blog.category?.trim() ? (
              <Badge variant="outline">{blog.category}</Badge>
            ) : null}
          </div>
          <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">
            {blog.title}
          </h2>
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            /{blog.slug}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={ADMIN_ROUTES.blogs}>
              <ArrowLeft aria-hidden="true" />
              Back
            </Link>
          </Button>
          {blog.status === "PUBLISHED" ? (
            <Button asChild variant="outline">
              <Link
                href={`${PUBLIC_ROUTES.blogDetails}?slug=${encodeURIComponent(blog.slug)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink aria-hidden="true" />
                Public view
              </Link>
            </Button>
          ) : null}
          <Button asChild>
            <Link
              href={`${ADMIN_ROUTES.blogs}edit/?id=${encodeURIComponent(blog.id)}`}
            >
              <Edit3 aria-hidden="true" />
              Edit post
            </Link>
          </Button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl">
        <header className="mx-auto max-w-3xl text-center">
          {blog.category?.trim() ? (
            <p className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
              {blog.category}
            </p>
          ) : null}
          <h1 className="mt-4 text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            {blog.title}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-pretty text-muted-foreground">
            {blog.excerpt}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <UserRound aria-hidden="true" className="size-4" />
              {blog.author}
            </span>
            {blog.publishedAt ? (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays aria-hidden="true" className="size-4" />
                {formatDate(blog.publishedAt)}
              </span>
            ) : null}
          </div>
        </header>

        <ResponsiveImage
          src={blog.featuredImageUrl}
          alt={blog.featuredImageAlt}
          sizes="(max-width: 1024px) 100vw, 1024px"
          className="mt-12 aspect-[16/9] w-full rounded-2xl object-cover"
        />

        <TipTapContent
          document={blog.content}
          className="mx-auto mt-12 max-w-3xl"
        />
      </div>

      <Card className="mx-auto w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Record and search metadata</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-5 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">SEO title</dt>
              <dd className="mt-1 font-medium">
                {blog.metaTitle?.trim() || "Uses article title"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Last updated</dt>
              <dd className="mt-1 font-medium">{formatDate(blog.updatedAt)}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">SEO description</dt>
              <dd className="mt-1 leading-6">
                {blog.metaDescription?.trim() || "Uses article excerpt"}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">Featured image alt text</dt>
              <dd className="mt-1 leading-6">{blog.featuredImageAlt}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </article>
  );
}
