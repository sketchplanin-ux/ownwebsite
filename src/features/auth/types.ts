import type { User } from "firebase/auth";

import type { AdminUser } from "@/types/auth";

export type AuthStatus =
  | "loading"
  | "authenticated"
  | "unauthenticated"
  | "unauthorized"
  | "inactive"
  | "error";

export interface AuthContextValue {
  firebaseUser: User | null;
  adminUser: AdminUser | null;
  status: AuthStatus;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAdmin: () => Promise<void>;
}

