"use client";

import { PERMISSIONS } from "@/features/auth/permissions";
import { useAdmin } from "@/hooks/use-admin";

import {
  AdminBlogsAccessDenied,
  AdminBlogsAccessLoading,
} from "./access-state";
import { BlogForm } from "./blog-form";

export function BlogCreateScreen() {
  const admin = useAdmin();
  const canManage = admin.can(PERMISSIONS.MANAGE_BLOGS);

  if (admin.isLoading) {
    return <AdminBlogsAccessLoading />;
  }
  if (!canManage) {
    return <AdminBlogsAccessDenied />;
  }

  return <BlogForm />;
}
