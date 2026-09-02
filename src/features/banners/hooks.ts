"use client";

import { useQuery } from "@tanstack/react-query";

import { getActiveBanners } from "@/features/banners/api";

export const bannerQueryKeys = Object.freeze({
  all: ["banners"] as const,
  active: ["banners", "active"] as const,
});

export function useActiveBanners() {
  return useQuery({
    queryKey: bannerQueryKeys.active,
    queryFn: () => getActiveBanners(),
    staleTime: 5 * 60 * 1_000,
  });
}
