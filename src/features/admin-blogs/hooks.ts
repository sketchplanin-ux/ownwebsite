"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";

import { blogQueryKeys } from "@/features/blogs/hooks";
import { dashboardQueryKey } from "@/features/dashboard/hooks";
import type { Blog } from "@/types/blog";
import type { FirestoreTimestamp } from "@/types/common";

import {
  createAdminBlog,
  deleteAdminBlog,
  getAdminBlog,
  getAdminBlogs,
  updateAdminBlog,
} from "./api";
import type { AdminBlogInput } from "./schema";

export const adminBlogQueryKeys = Object.freeze({
  all: ["admin", "blogs"] as const,
  list: ["admin", "blogs", "list"] as const,
  detail: (blogId: string) => ["admin", "blogs", "detail", blogId] as const,
});

function useInvalidateBlogData() {
  const queryClient = useQueryClient();
  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: adminBlogQueryKeys.all }),
      queryClient.invalidateQueries({ queryKey: blogQueryKeys.all }),
      queryClient.invalidateQueries({ queryKey: dashboardQueryKey }),
    ]);
  };
}

export function useAdminBlogs(enabled = true): UseQueryResult<Blog[], Error> {
  return useQuery({
    queryKey: adminBlogQueryKeys.list,
    queryFn: getAdminBlogs,
    enabled,
    staleTime: 60_000,
  });
}

export function useAdminBlog(
  blogId: string,
  enabled = true,
): UseQueryResult<Blog | null, Error> {
  return useQuery({
    queryKey: adminBlogQueryKeys.detail(blogId),
    queryFn: () => getAdminBlog(blogId),
    enabled: enabled && blogId.trim().length > 0,
    staleTime: 60_000,
  });
}

export function useCreateAdminBlog() {
  const invalidate = useInvalidateBlogData();
  return useMutation({
    mutationFn: createAdminBlog,
    onSuccess: invalidate,
  });
}

export function useUpdateAdminBlog() {
  const invalidate = useInvalidateBlogData();
  return useMutation({
    mutationFn: ({
      blogId,
      existingPublishedAt,
      input,
    }: {
      blogId: string;
      existingPublishedAt?: FirestoreTimestamp;
      input: AdminBlogInput;
    }) => updateAdminBlog(blogId, input, existingPublishedAt),
    onSuccess: invalidate,
  });
}

export function useDeleteAdminBlog() {
  const invalidate = useInvalidateBlogData();
  return useMutation({
    mutationFn: deleteAdminBlog,
    onSuccess: invalidate,
  });
}
