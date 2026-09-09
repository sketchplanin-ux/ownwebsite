"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  ConfirmationResult,
  RecaptchaVerifier,
  User,
  UserCredential,
} from "firebase/auth";

import {
  confirmPhoneVerificationCode,
  createRecaptchaVerifier,
  getAdminAccess,
  loginWithEmailAndPassword,
  loginWithGoogle as signInWithGoogleAccount,
  logoutAdmin,
  requestPhoneVerificationCode,
  subscribeToAuthState,
} from "@/firebase/auth";
import {
  createFirebaseError,
  getFirebaseErrorMessage,
  logFirebaseError,
  mapFirebaseError,
} from "@/firebase/errors";
import type {
  AuthContextValue,
  AuthStatus,
} from "@/features/auth/types";
import type { AdminUser } from "@/types/auth";

interface AuthState {
  firebaseUser: User | null;
  adminUser: AdminUser | null;
  status: AuthStatus;
  error: string | null;
}

const INITIAL_AUTH_STATE: AuthState = {
  firebaseUser: null,
  adminUser: null,
  status: "loading",
  error: null,
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<AuthState>(INITIAL_AUTH_STATE);
  const [pendingPhoneNumber, setPendingPhoneNumber] = useState<string | null>(
    null,
  );
  const sessionVersionRef = useRef(0);
  const accessRequestRef = useRef<{
    uid: string;
    promise: ReturnType<typeof getAdminAccess>;
  } | null>(null);
  const rejectionRef = useRef<"inactive" | "unauthorized" | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);
  const phoneChallengeRef = useRef<ConfirmationResult | null>(null);

  const clearPrivateSessionData = useCallback(() => {
    accessRequestRef.current = null;
    queryClient.clear();
  }, [queryClient]);

  const clearPhoneChallenge = useCallback(() => {
    try {
      recaptchaRef.current?.clear();
    } catch (error) {
      // The widget's container can already be gone when the form unmounts.
      logFirebaseError("reCAPTCHA teardown", error);
    }

    recaptchaRef.current = null;
    phoneChallengeRef.current = null;
    setPendingPhoneNumber(null);
  }, []);

  useEffect(() => clearPhoneChallenge, [clearPhoneChallenge]);

  const requestAdminAccess = useCallback((uid: string) => {
    if (accessRequestRef.current?.uid === uid) {
      return accessRequestRef.current.promise;
    }

    const promise = getAdminAccess(uid);
    accessRequestRef.current = { uid, promise };
    return promise;
  }, []);

  const verifyAdmin = useCallback(
    async (firebaseUser: User, sessionVersion: number): Promise<void> => {
      try {
        const access = await requestAdminAccess(firebaseUser.uid);

        if (sessionVersion !== sessionVersionRef.current) {
          if (access.status === "unauthorized") {
            throw createFirebaseError("auth/admin-not-found");
          }

          if (access.status === "inactive") {
            throw createFirebaseError("auth/admin-inactive");
          }

          return;
        }

        if (access.status === "authorized") {
          setState({
            firebaseUser,
            adminUser: access.adminUser,
            status: "authenticated",
            error: null,
          });
          return;
        }

        const error = createFirebaseError(
          access.status === "inactive"
            ? "auth/admin-inactive"
            : "auth/admin-not-found",
        );

        rejectionRef.current = access.status;
        clearPrivateSessionData();

        try {
          await logoutAdmin();
        } finally {
          setState({
            firebaseUser: null,
            adminUser: null,
            status: access.status,
            error: error.message,
          });
        }

        throw error;
      } catch (error) {
        const friendlyError = mapFirebaseError(
          error,
          "Unable to verify admin access. Please try again.",
        );

        if (sessionVersion === sessionVersionRef.current) {
          setState((currentState) => {
            if (
              currentState.status === "inactive" ||
              currentState.status === "unauthorized"
            ) {
              return currentState;
            }

            return {
              firebaseUser,
              adminUser: null,
              status: "error",
              error: friendlyError.message,
            };
          });
        }

        throw friendlyError;
      }
    },
    [clearPrivateSessionData, requestAdminAccess],
  );

  useEffect(() => {
    return subscribeToAuthState(
      (firebaseUser) => {
        const sessionVersion = ++sessionVersionRef.current;

        if (!firebaseUser) {
          const rejection = rejectionRef.current;
          rejectionRef.current = null;
          accessRequestRef.current = null;
          setState({
            firebaseUser: null,
            adminUser: null,
            status: rejection ?? "unauthenticated",
            error:
              rejection === "inactive"
                ? getFirebaseErrorMessage(
                    createFirebaseError("auth/admin-inactive"),
                  )
                : rejection === "unauthorized"
                  ? getFirebaseErrorMessage(
                      createFirebaseError("auth/admin-not-found"),
                    )
                  : null,
          });
          return;
        }

        setState({
          firebaseUser,
          adminUser: null,
          status: "loading",
          error: null,
        });

        void verifyAdmin(firebaseUser, sessionVersion).catch(() => {
          // verifyAdmin stores the user-safe error in context for the UI.
        });
      },
      (error) => {
        logFirebaseError("Authentication state listener", error);
        const friendlyError = mapFirebaseError(
          error,
          "Unable to restore your session. Please refresh the page.",
        );
        setState({
          firebaseUser: null,
          adminUser: null,
          status: "error",
          error: friendlyError.message,
        });
      },
    );
  }, [verifyAdmin]);

  // Shared tail for every sign-in method: reset session state, run the
  // provider-specific sign-in, then gate on the admins/{uid} profile.
  const completeSignIn = useCallback(
    async (signIn: () => Promise<UserCredential>): Promise<void> => {
      rejectionRef.current = null;
      accessRequestRef.current = null;
      setState({
        firebaseUser: null,
        adminUser: null,
        status: "loading",
        error: null,
      });

      try {
        const credential = await signIn();
        await verifyAdmin(credential.user, sessionVersionRef.current);
      } catch (error) {
        const friendlyError = mapFirebaseError(
          error,
          "Unable to sign in. Please try again.",
        );

        setState((currentState) => {
          if (
            currentState.status === "inactive" ||
            currentState.status === "unauthorized" ||
            currentState.status === "error"
          ) {
            return currentState;
          }

          return {
            firebaseUser: null,
            adminUser: null,
            status: "unauthenticated",
            error: friendlyError.message,
          };
        });

        throw friendlyError;
      }
    },
    [verifyAdmin],
  );

  const login = useCallback(
    (email: string, password: string): Promise<void> =>
      completeSignIn(() => loginWithEmailAndPassword(email, password)),
    [completeSignIn],
  );

  const loginWithGoogle = useCallback(
    (): Promise<void> => completeSignIn(signInWithGoogleAccount),
    [completeSignIn],
  );

  const sendPhoneCode = useCallback(
    async (phoneNumber: string, recaptchaContainer: HTMLElement) => {
      // Each attempt gets a fresh verifier: a solved reCAPTCHA token cannot be
      // reused, so a stale one makes every retry fail.
      clearPhoneChallenge();
      const verifier = createRecaptchaVerifier(recaptchaContainer);
      recaptchaRef.current = verifier;

      try {
        phoneChallengeRef.current = await requestPhoneVerificationCode(
          phoneNumber,
          verifier,
        );
        setPendingPhoneNumber(phoneNumber.trim());
      } catch (error) {
        clearPhoneChallenge();
        throw mapFirebaseError(
          error,
          "Unable to send the verification code. Please try again.",
        );
      }
    },
    [clearPhoneChallenge],
  );

  const confirmPhoneCode = useCallback(
    async (code: string): Promise<void> => {
      const challenge = phoneChallengeRef.current;

      if (!challenge) {
        throw createFirebaseError("auth/phone-challenge-missing");
      }

      try {
        await completeSignIn(() =>
          confirmPhoneVerificationCode(challenge, code),
        );
      } finally {
        clearPhoneChallenge();
      }
    },
    [clearPhoneChallenge, completeSignIn],
  );

  const logout = useCallback(async (): Promise<void> => {
    rejectionRef.current = null;
    ++sessionVersionRef.current;
    clearPhoneChallenge();

    try {
      await logoutAdmin();
    } finally {
      clearPrivateSessionData();
      setState({
        firebaseUser: null,
        adminUser: null,
        status: "unauthenticated",
        error: null,
      });
    }
  }, [clearPhoneChallenge, clearPrivateSessionData]);

  const refreshAdmin = useCallback(async (): Promise<void> => {
    if (!state.firebaseUser) {
      setState({
        firebaseUser: null,
        adminUser: null,
        status: "unauthenticated",
        error: null,
      });
      return;
    }

    accessRequestRef.current = null;
    const sessionVersion = ++sessionVersionRef.current;
    setState((currentState) => ({
      ...currentState,
      adminUser: null,
      status: "loading",
      error: null,
    }));
    await verifyAdmin(state.firebaseUser, sessionVersion);
  }, [state.firebaseUser, verifyAdmin]);

  const value = useMemo<AuthContextValue>(
    () => ({
      firebaseUser: state.firebaseUser,
      adminUser: state.adminUser,
      status: state.status,
      isLoading: state.status === "loading",
      isAuthenticated:
        state.status === "authenticated" && state.adminUser?.active === true,
      error: state.error,
      pendingPhoneNumber,
      login,
      loginWithGoogle,
      sendPhoneCode,
      confirmPhoneCode,
      cancelPhoneLogin: clearPhoneChallenge,
      logout,
      refreshAdmin,
    }),
    [
      clearPhoneChallenge,
      confirmPhoneCode,
      login,
      loginWithGoogle,
      logout,
      pendingPhoneNumber,
      refreshAdmin,
      sendPhoneCode,
      state,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
