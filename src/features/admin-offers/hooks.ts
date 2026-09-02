"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { OfferInput } from "@/types/offer";

import {
  createAdminOffer,
  deleteAdminOffer,
  getAdminOffer,
  getAdminOffers,
  updateAdminOffer,
} from "./api";

export const adminOfferQueryKeys = Object.freeze({
  all: ["admin", "offers"] as const,
  list: ["admin", "offers", "list"] as const,
  detail: (offerId: string) => ["admin", "offers", "detail", offerId] as const,
});

function useInvalidateOffers() {
  const queryClient = useQueryClient();
  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: adminOfferQueryKeys.all }),
      queryClient.invalidateQueries({ queryKey: ["offers"] }),
      queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
    ]);
  };
}

export function useAdminOffers(enabled = true) {
  return useQuery({
    queryKey: adminOfferQueryKeys.list,
    queryFn: getAdminOffers,
    enabled,
    staleTime: 60_000,
  });
}

export function useAdminOffer(offerId: string, enabled = true) {
  return useQuery({
    queryKey: adminOfferQueryKeys.detail(offerId),
    queryFn: () => getAdminOffer(offerId),
    enabled: enabled && Boolean(offerId.trim()),
    staleTime: 60_000,
  });
}

export function useCreateAdminOffer() {
  const invalidate = useInvalidateOffers();
  return useMutation({ mutationFn: createAdminOffer, onSuccess: invalidate });
}

export function useUpdateAdminOffer() {
  const invalidate = useInvalidateOffers();
  return useMutation({
    mutationFn: ({ offerId, input }: { offerId: string; input: OfferInput }) =>
      updateAdminOffer(offerId, input),
    onSuccess: invalidate,
  });
}

export function useDeleteAdminOffer() {
  const invalidate = useInvalidateOffers();
  return useMutation({ mutationFn: deleteAdminOffer, onSuccess: invalidate });
}
