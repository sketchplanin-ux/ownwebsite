import {
  GoogleAuthProvider,
  RecaptchaVerifier,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut,
  type ConfirmationResult,
  type NextOrObserver,
  type Unsubscribe,
  type User,
  type UserCredential,
} from "firebase/auth";
import { doc, getDoc, type DocumentData } from "firebase/firestore";

import { COLLECTIONS } from "@/firebase/collections";
import { firebaseAuth, firestore } from "@/firebase/config";
import {
  createFirebaseError,
  logFirebaseError,
  mapFirebaseError,
} from "@/firebase/errors";
import type { AdminRole, AdminUser } from "@/types/auth";

const ADMIN_ROLES = new Set<AdminRole>(["SUPER_ADMIN", "ADMIN", "EDITOR"]);

export type AdminAccessResult =
  | { status: "authorized"; adminUser: AdminUser }
  | { status: "inactive"; adminUser: AdminUser }
  | { status: "unauthorized"; adminUser: null };

function hasOwn(data: DocumentData, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(data, key);
}

function parseAdminUser(uid: string, data: DocumentData): AdminUser {
  const role = data.role;

  if (
    typeof data.name !== "string" ||
    data.name.trim().length === 0 ||
    typeof data.email !== "string" ||
    data.email.trim().length === 0 ||
    typeof role !== "string" ||
    !ADMIN_ROLES.has(role as AdminRole) ||
    typeof data.active !== "boolean" ||
    !hasOwn(data, "createdAt")
  ) {
    throw createFirebaseError("auth/admin-profile-invalid");
  }

  return {
    uid,
    name: data.name,
    email: data.email,
    role: role as AdminRole,
    active: data.active,
    createdAt: data.createdAt,
    ...(hasOwn(data, "updatedAt") ? { updatedAt: data.updatedAt } : {}),
  };
}

export async function loginWithEmailAndPassword(
  email: string,
  password: string,
): Promise<UserCredential> {
  try {
    return await signInWithEmailAndPassword(
      firebaseAuth,
      email.trim(),
      password,
    );
  } catch (error) {
    logFirebaseError("Admin sign-in", error);
    throw mapFirebaseError(error, "Unable to sign in. Please try again.");
  }
}

export async function loginWithGoogle(): Promise<UserCredential> {
  // A fresh provider per attempt keeps the account chooser from being skipped
  // after a failed or cancelled popup.
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  try {
    return await signInWithPopup(firebaseAuth, provider);
  } catch (error) {
    logFirebaseError("Google sign-in", error);
    throw mapFirebaseError(
      error,
      "Unable to sign in with Google. Please try again.",
    );
  }
}

export function createRecaptchaVerifier(
  container: HTMLElement | string,
): RecaptchaVerifier {
  return new RecaptchaVerifier(firebaseAuth, container, { size: "invisible" });
}

export async function requestPhoneVerificationCode(
  phoneNumber: string,
  verifier: RecaptchaVerifier,
): Promise<ConfirmationResult> {
  try {
    return await signInWithPhoneNumber(
      firebaseAuth,
      phoneNumber.trim(),
      verifier,
    );
  } catch (error) {
    logFirebaseError("Phone verification code request", error);
    throw mapFirebaseError(
      error,
      "Unable to send the verification code. Please try again.",
    );
  }
}

export async function confirmPhoneVerificationCode(
  confirmation: ConfirmationResult,
  code: string,
): Promise<UserCredential> {
  try {
    return await confirmation.confirm(code.trim());
  } catch (error) {
    logFirebaseError("Phone verification code confirmation", error);
    throw mapFirebaseError(
      error,
      "Unable to verify that code. Please try again.",
    );
  }
}

export async function logoutAdmin(): Promise<void> {
  try {
    await signOut(firebaseAuth);
  } catch (error) {
    logFirebaseError("Admin sign-out", error);
    throw mapFirebaseError(error, "Unable to sign out. Please try again.");
  }
}

export function subscribeToAuthState(
  observer: NextOrObserver<User>,
  onError?: (error: Error) => void,
): Unsubscribe {
  return onAuthStateChanged(firebaseAuth, observer, onError);
}

export async function getAdminUser(uid: string): Promise<AdminUser | null> {
  try {
    const snapshot = await getDoc(
      doc(firestore, COLLECTIONS.admins, uid),
    );

    return snapshot.exists() ? parseAdminUser(uid, snapshot.data()) : null;
  } catch (error) {
    logFirebaseError("Admin profile lookup", error);
    throw mapFirebaseError(
      error,
      "Unable to verify admin access. Please try again.",
    );
  }
}

export async function getAdminAccess(uid: string): Promise<AdminAccessResult> {
  const adminUser = await getAdminUser(uid);

  if (!adminUser) {
    return { status: "unauthorized", adminUser: null };
  }

  if (!adminUser.active) {
    return { status: "inactive", adminUser };
  }

  return { status: "authorized", adminUser };
}
