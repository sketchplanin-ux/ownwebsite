"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";

import {
  createAdminProject,
  createAdminProjectCategory,
  deleteAdminProject,
  deleteAdminProjectCategory,
  getAdminProject,
  getAdminProjectCategories,
  getAdminProjects,
  updateAdminProject,
  updateAdminProjectCategory,
} from "./api";
import type {
  Project,
  ProjectCategory,
  ProjectCategoryInput,
  ProjectInput,
} from "@/types/project";

export const adminProjectQueryKeys = Object.freeze({
  all: ["admin", "projects"] as const,
  list: ["admin", "projects", "list"] as const,
  detail: (projectId: string) =>
    ["admin", "projects", "detail", projectId] as const,
  categories: ["admin", "project-categories"] as const,
});

function useInvalidateProjectData() {
  const queryClient = useQueryClient();
  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: adminProjectQueryKeys.all }),
      queryClient.invalidateQueries({
        queryKey: adminProjectQueryKeys.categories,
      }),
      queryClient.invalidateQueries({ queryKey: ["public", "projects"] }),
      queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
    ]);
  };
}

export function useAdminProjects(
  enabled = true,
): UseQueryResult<Project[], Error> {
  return useQuery({
    queryKey: adminProjectQueryKeys.list,
    queryFn: getAdminProjects,
    enabled,
    staleTime: 60_000,
  });
}

export function useAdminProject(
  projectId: string,
  enabled = true,
): UseQueryResult<Project | null, Error> {
  return useQuery({
    queryKey: adminProjectQueryKeys.detail(projectId),
    queryFn: () => getAdminProject(projectId),
    enabled: enabled && projectId.trim().length > 0,
    staleTime: 60_000,
  });
}

export function useAdminProjectCategories(
  enabled = true,
): UseQueryResult<ProjectCategory[], Error> {
  return useQuery({
    queryKey: adminProjectQueryKeys.categories,
    queryFn: getAdminProjectCategories,
    enabled,
    staleTime: 60_000,
  });
}

export function useCreateAdminProject() {
  const invalidate = useInvalidateProjectData();
  return useMutation({
    mutationFn: createAdminProject,
    onSuccess: invalidate,
  });
}

export function useUpdateAdminProject() {
  const invalidate = useInvalidateProjectData();
  return useMutation({
    mutationFn: ({ projectId, input }: { projectId: string; input: ProjectInput }) =>
      updateAdminProject(projectId, input),
    onSuccess: invalidate,
  });
}

export function useDeleteAdminProject() {
  const invalidate = useInvalidateProjectData();
  return useMutation({
    mutationFn: deleteAdminProject,
    onSuccess: invalidate,
  });
}

export function useCreateAdminProjectCategory() {
  const invalidate = useInvalidateProjectData();
  return useMutation({
    mutationFn: createAdminProjectCategory,
    onSuccess: invalidate,
  });
}

export function useUpdateAdminProjectCategory() {
  const invalidate = useInvalidateProjectData();
  return useMutation({
    mutationFn: ({
      categoryId,
      input,
    }: {
      categoryId: string;
      input: ProjectCategoryInput;
    }) => updateAdminProjectCategory(categoryId, input),
    onSuccess: invalidate,
  });
}

export function useDeleteAdminProjectCategory() {
  const invalidate = useInvalidateProjectData();
  return useMutation({
    mutationFn: deleteAdminProjectCategory,
    onSuccess: invalidate,
  });
}
