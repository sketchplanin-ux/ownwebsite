"use client";

import { Edit3, Eye, FileText, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { PaginationControls } from "@/components/common/pagination-controls";
import { StatusBadge } from "@/components/common/status-badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getFirebaseErrorMessage } from "@/firebase/errors";
import { PERMISSIONS } from "@/features/auth/permissions";
import { useAdmin } from "@/hooks/use-admin";
import { useDebounce } from "@/hooks/use-debounce";
import { ADMIN_ROUTES } from "@/lib/constants";
import { formatDate } from "@/lib/date";
import type { Blog, BlogStatus } from "@/types/blog";

import {
  AdminBlogsAccessDenied,
  AdminBlogsAccessLoading,
} from "./access-state";
import { ADMIN_BLOG_READ_LIMIT } from "./api";
import { useAdminBlogs, useDeleteAdminBlog } from "./hooks";

const PAGE_SIZE = 10;
const EMPTY_BLOGS: readonly Blog[] = [];

type StatusFilter = "all" | BlogStatus;

function normalizeSearchValue(value: string): string {
  return value.trim().toLocaleLowerCase("en-US");
}

function BlogListLoading() {
  return (
    <div role="status" aria-label="Loading blog posts" className="space-y-4">
      <Skeleton className="h-16 rounded-xl" />
      <Skeleton className="h-96 rounded-xl" />
      <span className="sr-only">Loading blog posts…</span>
    </div>
  );
}

export function BlogsAdminScreen() {
  const admin = useAdmin();
  const canManage = admin.can(PERMISSIONS.MANAGE_BLOGS);
  const blogsQuery = useAdminBlogs(canManage);
  const deleteMutation = useDeleteAdminBlog();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Blog | null>(null);
  const debouncedSearch = useDebounce(search, 250);
  const blogs = blogsQuery.data ?? EMPTY_BLOGS;

  const filteredBlogs = useMemo(() => {
    const term = normalizeSearchValue(debouncedSearch);
    return blogs.filter((blog) => {
      const searchable = [
        blog.title,
        blog.slug,
        blog.excerpt,
        blog.author,
        blog.category,
      ]
        .filter((value): value is string => Boolean(value))
        .join(" ")
        .toLocaleLowerCase("en-US");
      return (
        (!term || searchable.includes(term)) &&
        (status === "all" || blog.status === status)
      );
    });
  }, [blogs, debouncedSearch, status]);
  const pageCount = Math.max(1, Math.ceil(filteredBlogs.length / PAGE_SIZE));
  const visiblePage = Math.min(page, pageCount);
  const visibleBlogs = filteredBlogs.slice(
    (visiblePage - 1) * PAGE_SIZE,
    visiblePage * PAGE_SIZE,
  );

  if (admin.isLoading) {
    return <AdminBlogsAccessLoading />;
  }
  if (!canManage) {
    return <AdminBlogsAccessDenied />;
  }

  const resetFilters = () => {
    setSearch("");
    setStatus("all");
    setPage(1);
  };

  const deleteBlog = async () => {
    if (!deleteTarget || !canManage) {
      return;
    }
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Blog post deleted.");
      setDeleteTarget(null);
    } catch (error) {
      toast.error(
        getFirebaseErrorMessage(
          error,
          "The blog post could not be deleted. Please try again.",
        ),
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
          Manage article drafts, publication, archives, media, and search metadata.
          The list is bounded to the {ADMIN_BLOG_READ_LIMIT} most recently updated
          posts.
        </p>
        <Button asChild>
          <Link href={`${ADMIN_ROUTES.blogs}create/`}>
            <Plus aria-hidden="true" />
            Create post
          </Link>
        </Button>
      </div>

      {blogsQuery.isPending ? <BlogListLoading /> : null}
      {blogsQuery.isError ? (
        <ErrorState
          title="Blog posts unavailable"
          description={blogsQuery.error.message}
          onRetry={() => void blogsQuery.refetch()}
        />
      ) : null}
      {blogsQuery.isSuccess ? (
        <>
          <Card>
            <CardContent className="grid gap-3 p-4 md:grid-cols-[minmax(16rem,1fr)_13rem_auto]">
              <label className="relative block">
                <span className="sr-only">Search blog posts</span>
                <Search
                  aria-hidden="true"
                  className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  type="search"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search title, author, category…"
                  className="pl-8"
                />
              </label>
              <label>
                <span className="sr-only">Blog status</span>
                <select
                  value={status}
                  onChange={(event) => {
                    setStatus(event.target.value as StatusFilter);
                    setPage(1);
                  }}
                  className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="all">All statuses</option>
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </label>
              <Button type="button" variant="outline" onClick={resetFilters}>
                Reset
              </Button>
            </CardContent>
          </Card>

          {blogs.length === 0 ? (
            <EmptyState
              title="No blog posts yet"
              description="Create the first post to begin the publication workflow."
              icon={<FileText />}
              action={
                <Button asChild>
                  <Link href={`${ADMIN_ROUTES.blogs}create/`}>
                    <Plus aria-hidden="true" />
                    Create post
                  </Link>
                </Button>
              }
            />
          ) : filteredBlogs.length === 0 ? (
            <EmptyState
              title="No posts match these filters"
              description="Adjust the search or status filter to see more posts."
              action={
                <Button type="button" variant="outline" onClick={resetFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableCaption>
                    Showing {visibleBlogs.length} of {filteredBlogs.length} matching
                    posts.
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Post</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Published</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleBlogs.map((blog) => (
                      <TableRow key={blog.id}>
                        <TableCell className="min-w-72 whitespace-normal">
                          <p className="font-semibold">{blog.title}</p>
                          <p className="mt-1 font-mono text-xs text-muted-foreground">
                            /{blog.slug}
                          </p>
                          {blog.category?.trim() ? (
                            <Badge variant="outline" className="mt-2">
                              {blog.category}
                            </Badge>
                          ) : null}
                        </TableCell>
                        <TableCell>{blog.author}</TableCell>
                        <TableCell>
                          <StatusBadge status={blog.status} />
                        </TableCell>
                        <TableCell>{formatDate(blog.publishedAt)}</TableCell>
                        <TableCell>{formatDate(blog.updatedAt)}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button asChild variant="ghost" size="icon-sm">
                              <Link
                                href={`${ADMIN_ROUTES.blogs}preview/?id=${encodeURIComponent(blog.id)}`}
                                aria-label={`Preview ${blog.title}`}
                              >
                                <Eye aria-hidden="true" />
                              </Link>
                            </Button>
                            <Button asChild variant="ghost" size="icon-sm">
                              <Link
                                href={`${ADMIN_ROUTES.blogs}edit/?id=${encodeURIComponent(blog.id)}`}
                                aria-label={`Edit ${blog.title}`}
                              >
                                <Edit3 aria-hidden="true" />
                              </Link>
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon-sm"
                              disabled={deleteMutation.isPending}
                              aria-label={`Delete ${blog.title}`}
                              onClick={() => setDeleteTarget(blog)}
                            >
                              <Trash2 aria-hidden="true" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <PaginationControls
                  className="border-t p-4"
                  currentPage={visiblePage}
                  totalPages={pageCount}
                  hasPreviousPage={visiblePage > 1}
                  hasNextPage={visiblePage < pageCount}
                  onPreviousPage={() =>
                    setPage((current) => Math.max(1, current - 1))
                  }
                  onNextPage={() =>
                    setPage((current) => Math.min(pageCount, current + 1))
                  }
                />
              </CardContent>
            </Card>
          )}
        </>
      ) : null}

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) {
            setDeleteTarget(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete blog post?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `“${deleteTarget.title}” and its stored blog record will be permanently deleted. Cloudinary assets are not automatically removed.`
                : "This blog post will be permanently deleted."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={(event) => {
                event.preventDefault();
                void deleteBlog();
              }}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete post"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
