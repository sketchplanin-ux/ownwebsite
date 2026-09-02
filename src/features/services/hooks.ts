"use client";

import {
  useInfiniteQuery,
  useQuery,
  type UseQueryResult,
} from "@tanstack/react-query";

import {
  getFeaturedServices,
  getPublishedServiceBySlug,
  getPublishedServicesPage,
  normalizeFeaturedServiceLimit,
  normalizePublicServiceSlug,
  normalizeServicePageSize,
  type ServicePageCursor,
} from "@/features/services/repository";
import type { Service } from "@/types/service";

export const serviceQueryKeys = {
  all: ["public", "services"] as const,
  featured: (limit: number) =>
    [...serviceQueryKeys.all, "featured", limit] as const,
  list: (pageSize: number) =>
    [...serviceQueryKeys.all, "list", pageSize] as const,
  detail: (slug: string) =>
    [...serviceQueryKeys.all, "detail", slug] as const,
};

export function useFeaturedServices(
  limit?: number,
): UseQueryResult<Service[], Error> {
  const boundedLimit = normalizeFeaturedServiceLimit(limit);

  return useQuery<Service[], Error>({
    queryKey: serviceQueryKeys.featured(boundedLimit),
    queryFn: () => getFeaturedServices(boundedLimit),
    staleTime: 5 * 60_000,
  });
}

export function usePublishedServices(pageSize?: number) {
  const boundedPageSize = normalizeServicePageSize(pageSize);

  return useInfiniteQuery({
    queryKey: serviceQueryKeys.list(boundedPageSize),
    queryFn: ({ pageParam }) =>
      getPublishedServicesPage({
        pageSize: boundedPageSize,
        cursor: pageParam,
      }),
    initialPageParam: null as ServicePageCursor | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    staleTime: 5 * 60_000,
  });
}

export function usePublishedServiceBySlug(
  candidateSlug: string | null | undefined,
): UseQueryResult<Service | null, Error> {
  const slug = normalizePublicServiceSlug(candidateSlug);

  return useQuery<Service | null, Error>({
    queryKey: serviceQueryKeys.detail(slug ?? "invalid"),
    queryFn: () => getPublishedServiceBySlug(slug),
    enabled: slug !== null,
    staleTime: 5 * 60_000,
  });
}

export const useServices = usePublishedServices;
export const useServiceBySlug = usePublishedServiceBySlug;
