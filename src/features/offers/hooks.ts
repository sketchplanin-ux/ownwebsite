"use client";

import { useQuery } from "@tanstack/react-query";

import { getActiveOffers } from "@/features/offers/api";

export const offerQueryKeys = Object.freeze({
  all: ["offers"] as const,
  active: ["offers", "active"] as const,
});

export function useActiveOffers() {
  return useQuery({
    queryKey: offerQueryKeys.active,
    queryFn: () => getActiveOffers(),
    staleTime: 5 * 60 * 1_000,
  });
}
