"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { Button } from "@/components/ui/button";
import { PERMISSIONS } from "@/features/auth/permissions";
import { useAdmin } from "@/hooks/use-admin";
import { ADMIN_ROUTES } from "@/lib/constants";

import {
  AdminBlogsAccessDenied,
  AdminBlogsAccessLoading,
} from "./access-state";
import { BlogForm } from "./blog-form";
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

export function BlogEditScreen() {
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
        description="Open a post from the blog list to edit it."
        action={<BackToBlogsAction />}
      />
    );
  }
  if (blogQuery.isPending) {
    return <LoadingState variant="page" message="Loading blog editor…" />;
  }
  if (blogQuery.isError) {
    return (
      <ErrorState
        title="Blog editor unavailable"
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

  return <BlogForm key={blogQuery.data.id} initialBlog={blogQuery.data} />;
}
