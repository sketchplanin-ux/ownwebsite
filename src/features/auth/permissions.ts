import type { AdminRole } from "@/types/auth";

export const PERMISSIONS = Object.freeze({
  MANAGE_CONTENT: "manage:content",
  MANAGE_SERVICES: "manage:services",
  MANAGE_PROJECTS: "manage:projects",
  MANAGE_BLOGS: "manage:blogs",
  MANAGE_BANNERS: "manage:banners",
  MANAGE_OFFERS: "manage:offers",
  VIEW_LEADS: "view:leads",
  MANAGE_LEADS: "manage:leads",
  MANAGE_SETTINGS: "manage:settings",
  MANAGE_ADMINS: "manage:admins",
} as const);

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const ALL_PERMISSIONS = Object.freeze(Object.values(PERMISSIONS)) as readonly Permission[];

export const ROLE_PERMISSIONS: Readonly<Record<AdminRole, readonly Permission[]>> =
  Object.freeze({
    SUPER_ADMIN: ALL_PERMISSIONS,
    ADMIN: Object.freeze([
      PERMISSIONS.MANAGE_CONTENT,
      PERMISSIONS.MANAGE_SERVICES,
      PERMISSIONS.MANAGE_PROJECTS,
      PERMISSIONS.MANAGE_BLOGS,
      PERMISSIONS.MANAGE_BANNERS,
      PERMISSIONS.MANAGE_OFFERS,
      PERMISSIONS.VIEW_LEADS,
      PERMISSIONS.MANAGE_LEADS,
      PERMISSIONS.MANAGE_SETTINGS,
    ]),
    EDITOR: Object.freeze([
      PERMISSIONS.MANAGE_SERVICES,
      PERMISSIONS.MANAGE_PROJECTS,
      PERMISSIONS.MANAGE_BLOGS,
      PERMISSIONS.MANAGE_BANNERS,
      PERMISSIONS.MANAGE_OFFERS,
      PERMISSIONS.VIEW_LEADS,
    ]),
  });

export function getPermissionsForRole(
  role: AdminRole | null | undefined,
): readonly Permission[] {
  return role ? ROLE_PERMISSIONS[role] : [];
}

export function hasPermission(
  role: AdminRole | null | undefined,
  permission: Permission,
): boolean {
  return getPermissionsForRole(role).includes(permission);
}

export function hasAnyPermission(
  role: AdminRole | null | undefined,
  permissions: readonly Permission[],
): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

export function hasEveryPermission(
  role: AdminRole | null | undefined,
  permissions: readonly Permission[],
): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

