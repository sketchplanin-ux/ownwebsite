"use client";

import { useQuery } from "@tanstack/react-query";

import { getDashboardData } from "@/features/dashboard/api";

export const dashboardQueryKey = ["admin", "dashboard"] as const;

export function useDashboardData() {
  return useQuery({
    queryKey: dashboardQueryKey,
    queryFn: getDashboardData,
    staleTime: 60_000,
  });
}
