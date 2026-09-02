import { describe, expect, it } from "vitest";

import {
  hasEveryPermission,
  hasPermission,
  PERMISSIONS,
} from "@/features/auth/permissions";

describe("admin permissions", () => {
  it("grants a super admin every defined permission", () => {
    expect(
      Object.values(PERMISSIONS).every((permission) =>
        hasPermission("SUPER_ADMIN", permission),
      ),
    ).toBe(true);
  });

  it("allows an admin to manage leads and settings but not admins", () => {
    expect(hasPermission("ADMIN", PERMISSIONS.MANAGE_LEADS)).toBe(true);
    expect(hasPermission("ADMIN", PERMISSIONS.MANAGE_SETTINGS)).toBe(true);
    expect(hasPermission("ADMIN", PERMISSIONS.MANAGE_ADMINS)).toBe(false);
  });

  it("limits editors to content modules and read-only lead access", () => {
    expect(
      hasEveryPermission("EDITOR", [
        PERMISSIONS.MANAGE_SERVICES,
        PERMISSIONS.MANAGE_PROJECTS,
        PERMISSIONS.VIEW_LEADS,
      ]),
    ).toBe(true);
    expect(hasPermission("EDITOR", PERMISSIONS.MANAGE_LEADS)).toBe(false);
    expect(hasPermission("EDITOR", PERMISSIONS.MANAGE_SETTINGS)).toBe(false);
  });

  it("fails closed when a role is absent", () => {
    expect(hasPermission(null, PERMISSIONS.MANAGE_CONTENT)).toBe(false);
  });
});
