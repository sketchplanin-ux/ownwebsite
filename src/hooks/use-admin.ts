"use client";

import { useCallback, useMemo } from "react";

import {
  getPermissionsForRole,
  hasAnyPermission,
  hasEveryPermission,
  hasPermission,
  type Permission,
} from "@/features/auth/permissions";
import { useAuth } from "@/hooks/use-auth";

export function useAdmin() {
  const auth = useAuth();
  const role = auth.adminUser?.role;
  const permissions = useMemo(() => getPermissionsForRole(role), [role]);

  const can = useCallback(
    (permission: Permission) =>
      auth.isAuthenticated && hasPermission(role, permission),
    [auth.isAuthenticated, role],
  );

  const canAny = useCallback(
    (requiredPermissions: readonly Permission[]) =>
      auth.isAuthenticated && hasAnyPermission(role, requiredPermissions),
    [auth.isAuthenticated, role],
  );

  const canAll = useCallback(
    (requiredPermissions: readonly Permission[]) =>
      auth.isAuthenticated && hasEveryPermission(role, requiredPermissions),
    [auth.isAuthenticated, role],
  );

  return {
    ...auth,
    admin: auth.adminUser,
    role: role ?? null,
    permissions,
    can,
    canAny,
    canAll,
  };
}

