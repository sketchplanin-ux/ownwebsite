"use client";

import {
  useInfiniteQuery,
  useQuery,
  type UseQueryResult,
} from "@tanstack/react-query";

import {
  getFeaturedProjects,
  getPublishedProjectBySlug,
  getPublishedProjectCategories,
  getPublishedProjectsPage,
  normalizeFeaturedProjectLimit,
  normalizeProjectCategory,
  normalizeProjectCategoryLimit,
  normalizeProjectPageSize,
  normalizePublicProjectSlug,
  type ProjectPageCursor,
} from "@/features/projects/repository";
import type { Project, ProjectCategory } from "@/types/project";

export const projectQueryKeys = {
  all: ["public", "projects"] as const,
  categories: (limit: number) =>
    [...projectQueryKeys.all, "categories", limit] as const,
  featured: (limit: number) =>
    [...projectQueryKeys.all, "featured", limit] as const,
  list: (category: string | null, pageSize: number) =>
    [...projectQueryKeys.all, "list", category ?? "all", pageSize] as const,
  detail: (slug: string) =>
    [...projectQueryKeys.all, "detail", slug] as const,
};

export function useFeaturedProjects(
  limit?: number,
): UseQueryResult<Project[], Error> {
  const boundedLimit = normalizeFeaturedProjectLimit(limit);

  return useQuery<Project[], Error>({
    queryKey: projectQueryKeys.featured(boundedLimit),
    queryFn: () => getFeaturedProjects(boundedLimit),
    staleTime: 5 * 60_000,
  });
}

export function usePublishedProjects(
  selectedCategory?: string | null,
  pageSize?: number,
) {
  const category = normalizeProjectCategory(selectedCategory);
  const boundedPageSize = normalizeProjectPageSize(pageSize);

  return useInfiniteQuery({
    queryKey: projectQueryKeys.list(category, boundedPageSize),
    queryFn: ({ pageParam }) =>
      getPublishedProjectsPage({
        category,
        cursor: pageParam,
        pageSize: boundedPageSize,
      }),
    initialPageParam: null as ProjectPageCursor | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    staleTime: 5 * 60_000,
  });
}

export function usePublishedProjectCategories(
  limit?: number,
): UseQueryResult<ProjectCategory[], Error> {
  const boundedLimit = normalizeProjectCategoryLimit(limit);

  return useQuery<ProjectCategory[], Error>({
    queryKey: projectQueryKeys.categories(boundedLimit),
    queryFn: () => getPublishedProjectCategories(boundedLimit),
    staleTime: 10 * 60_000,
  });
}

export function usePublishedProjectBySlug(
  candidateSlug: string | null | undefined,
): UseQueryResult<Project | null, Error> {
  const slug = normalizePublicProjectSlug(candidateSlug);

  return useQuery<Project | null, Error>({
    queryKey: projectQueryKeys.detail(slug ?? "invalid"),
    queryFn: () => getPublishedProjectBySlug(slug),
    enabled: slug !== null,
    staleTime: 5 * 60_000,
  });
}

export const useProjects = usePublishedProjects;
export const useProjectCategories = usePublishedProjectCategories;
export const useProjectBySlug = usePublishedProjectBySlug;
