"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { BannerInput } from "@/types/banner";

import {
  createAdminBanner,
  deleteAdminBanner,
  getAdminBanner,
  getAdminBanners,
  updateAdminBanner,
} from "./api";

export const adminBannerQueryKeys = Object.freeze({
  all: ["admin", "banners"] as const,
  list: ["admin", "banners", "list"] as const,
  detail: (bannerId: string) =>
    ["admin", "banners", "detail", bannerId] as const,
});

function useInvalidateBanners() {
  const queryClient = useQueryClient();
  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: adminBannerQueryKeys.all }),
      queryClient.invalidateQueries({ queryKey: ["banners"] }),
      queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
    ]);
  };
}

export function useAdminBanners(enabled = true) {
  return useQuery({
    queryKey: adminBannerQueryKeys.list,
    queryFn: getAdminBanners,
    enabled,
    staleTime: 60_000,
  });
}

export function useAdminBanner(bannerId: string, enabled = true) {
  return useQuery({
    queryKey: adminBannerQueryKeys.detail(bannerId),
    queryFn: () => getAdminBanner(bannerId),
    enabled: enabled && Boolean(bannerId.trim()),
    staleTime: 60_000,
  });
}

export function useCreateAdminBanner() {
  const invalidate = useInvalidateBanners();
  return useMutation({ mutationFn: createAdminBanner, onSuccess: invalidate });
}

export function useUpdateAdminBanner() {
  const invalidate = useInvalidateBanners();
  return useMutation({
    mutationFn: ({ bannerId, input }: { bannerId: string; input: BannerInput }) =>
      updateAdminBanner(bannerId, input),
    onSuccess: invalidate,
  });
}

export function useDeleteAdminBanner() {
  const invalidate = useInvalidateBanners();
  return useMutation({ mutationFn: deleteAdminBanner, onSuccess: invalidate });
}
