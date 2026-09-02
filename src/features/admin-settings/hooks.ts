"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getAdminAboutPage,
  getAdminContactPage,
  getAdminGeneralSettings,
  getAdminHomePage,
  getAdminSeoSettings,
  getAdminSocialSettings,
  saveAboutPage,
  saveContactPage,
  saveGeneralSettings,
  saveHomePage,
  saveSeoSettings,
  saveSocialSettings,
} from "@/features/admin-settings/api";
import { pageQueryKeys } from "@/features/pages/hooks";
import { settingsQueryKeys } from "@/features/settings/hooks";

const ADMIN_DOCUMENT_STALE_TIME = 5 * 60 * 1_000;

export const adminSettingsQueryKeys = Object.freeze({
  general: ["admin", "site-settings", "general"] as const,
  social: ["admin", "site-settings", "social"] as const,
  seo: ["admin", "site-settings", "seo"] as const,
});

export const adminPageQueryKeys = Object.freeze({
  home: ["admin", "managed-pages", "home"] as const,
  about: ["admin", "managed-pages", "about"] as const,
  contact: ["admin", "managed-pages", "contact"] as const,
});

export function useAdminGeneralSettings() {
  return useQuery({
    queryKey: adminSettingsQueryKeys.general,
    queryFn: getAdminGeneralSettings,
    staleTime: ADMIN_DOCUMENT_STALE_TIME,
  });
}

export function useAdminSocialSettings() {
  return useQuery({
    queryKey: adminSettingsQueryKeys.social,
    queryFn: getAdminSocialSettings,
    staleTime: ADMIN_DOCUMENT_STALE_TIME,
  });
}

export function useAdminSeoSettings() {
  return useQuery({
    queryKey: adminSettingsQueryKeys.seo,
    queryFn: getAdminSeoSettings,
    staleTime: ADMIN_DOCUMENT_STALE_TIME,
  });
}

export function useSaveGeneralSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveGeneralSettings,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: adminSettingsQueryKeys.general,
        }),
        queryClient.invalidateQueries({ queryKey: settingsQueryKeys.general }),
      ]);
    },
  });
}

export function useSaveSocialSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveSocialSettings,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: adminSettingsQueryKeys.social,
        }),
        queryClient.invalidateQueries({ queryKey: settingsQueryKeys.social }),
      ]);
    },
  });
}

export function useSaveSeoSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveSeoSettings,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminSettingsQueryKeys.seo }),
        queryClient.invalidateQueries({ queryKey: settingsQueryKeys.seo }),
      ]);
    },
  });
}

export function useAdminHomePage() {
  return useQuery({
    queryKey: adminPageQueryKeys.home,
    queryFn: getAdminHomePage,
    staleTime: ADMIN_DOCUMENT_STALE_TIME,
  });
}

export function useAdminAboutPage() {
  return useQuery({
    queryKey: adminPageQueryKeys.about,
    queryFn: getAdminAboutPage,
    staleTime: ADMIN_DOCUMENT_STALE_TIME,
  });
}

export function useAdminContactPage() {
  return useQuery({
    queryKey: adminPageQueryKeys.contact,
    queryFn: getAdminContactPage,
    staleTime: ADMIN_DOCUMENT_STALE_TIME,
  });
}

export function useSaveHomePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveHomePage,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminPageQueryKeys.home }),
        queryClient.invalidateQueries({ queryKey: pageQueryKeys.home }),
      ]);
    },
  });
}

export function useSaveAboutPage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveAboutPage,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminPageQueryKeys.about }),
        queryClient.invalidateQueries({ queryKey: pageQueryKeys.about }),
      ]);
    },
  });
}

export function useSaveContactPage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveContactPage,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminPageQueryKeys.contact }),
        queryClient.invalidateQueries({ queryKey: pageQueryKeys.contact }),
      ]);
    },
  });
}

