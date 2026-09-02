"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getAboutPage,
  getContactPage,
  getHomePage,
} from "@/features/pages/api";

const PAGE_STALE_TIME = 10 * 60 * 1_000;

export const pageQueryKeys = Object.freeze({
  all: ["managed-pages"] as const,
  home: ["managed-pages", "home"] as const,
  about: ["managed-pages", "about"] as const,
  contact: ["managed-pages", "contact"] as const,
});

export function useHomePage() {
  return useQuery({
    queryKey: pageQueryKeys.home,
    queryFn: getHomePage,
    staleTime: PAGE_STALE_TIME,
  });
}

export function useAboutPage() {
  return useQuery({
    queryKey: pageQueryKeys.about,
    queryFn: getAboutPage,
    staleTime: PAGE_STALE_TIME,
  });
}

export function useContactPage() {
  return useQuery({
    queryKey: pageQueryKeys.contact,
    queryFn: getContactPage,
    staleTime: PAGE_STALE_TIME,
  });
}
