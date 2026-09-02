"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getGeneralSettings,
  getSeoSettings,
  getSocialSettings,
} from "@/features/settings/api";

const SETTINGS_STALE_TIME = 10 * 60 * 1_000;

export const settingsQueryKeys = Object.freeze({
  all: ["site-settings"] as const,
  general: ["site-settings", "general"] as const,
  social: ["site-settings", "social"] as const,
  seo: ["site-settings", "seo"] as const,
});

export function useGeneralSettings() {
  return useQuery({
    queryKey: settingsQueryKeys.general,
    queryFn: getGeneralSettings,
    staleTime: SETTINGS_STALE_TIME,
  });
}

export function useSocialSettings() {
  return useQuery({
    queryKey: settingsQueryKeys.social,
    queryFn: getSocialSettings,
    staleTime: SETTINGS_STALE_TIME,
  });
}

export function useSeoSettings() {
  return useQuery({
    queryKey: settingsQueryKeys.seo,
    queryFn: getSeoSettings,
    staleTime: SETTINGS_STALE_TIME,
  });
}
