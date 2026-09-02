import type { FirestoreTimestamp } from "./common";

export type AdminRole = "SUPER_ADMIN" | "ADMIN" | "EDITOR";

export type AdminPermission =
  | "content:read"
  | "content:write"
  | "leads:read"
  | "leads:write"
  | "settings:write"
  | "admins:manage";

export interface AdminUser {
  uid: string;
  name: string;
  email: string;
  role: AdminRole;
  active: boolean;
  createdAt: FirestoreTimestamp;
  updatedAt?: FirestoreTimestamp;
}

export type AdminAccessState =
  | "LOADING"
  | "UNAUTHENTICATED"
  | "UNAUTHORIZED"
  | "AUTHORIZED";
