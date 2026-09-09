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
  /** Phone number awaiting an SMS code, or null when no challenge is open. */
  pendingPhoneNumber: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  sendPhoneCode: (
    phoneNumber: string,
    recaptchaContainer: HTMLElement,
  ) => Promise<void>;
  confirmPhoneCode: (code: string) => Promise<void>;
  cancelPhoneLogin: () => void;
  logout: () => Promise<void>;
  refreshAdmin: () => Promise<void>;
}
