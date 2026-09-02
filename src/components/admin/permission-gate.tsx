"use client";

import type { ReactNode } from "react";

import type { Permission } from "@/features/auth/permissions";
import { useAdmin } from "@/hooks/use-admin";

interface PermissionGateProps {
  children: ReactNode;
  permissions: Permission | readonly Permission[];
  mode?: "all" | "any";
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
}

export function PermissionGate({
  children,
  permissions,
  mode = "all",
  fallback = null,
  loadingFallback = null,
}: PermissionGateProps) {
  const admin = useAdmin();

  if (admin.isLoading) {
    return loadingFallback;
  }

  const requiredPermissions = Array.isArray(permissions)
    ? permissions
    : [permissions];
  const allowed =
    mode === "any"
      ? admin.canAny(requiredPermissions)
      : admin.canAll(requiredPermissions);

  return allowed ? children : fallback;
}

