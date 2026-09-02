import { FirebaseError } from "firebase/app";

export interface FriendlyFirebaseError {
  code: string;
  message: string;
}

const DEFAULT_ERROR_MESSAGE =
  "Something went wrong. Please try again in a moment.";

const FIREBASE_ERROR_MESSAGES: Readonly<Record<string, string>> = Object.freeze({
  "auth/invalid-email": "Enter a valid email address.",
  "auth/missing-email": "Enter your email address.",
  "auth/missing-password": "Enter your password.",
  "auth/invalid-credential": "The email or password is incorrect.",
  "auth/user-not-found": "The email or password is incorrect.",
  "auth/wrong-password": "The email or password is incorrect.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/too-many-requests":
    "Too many sign-in attempts. Please wait a while and try again.",
  "auth/network-request-failed":
    "Unable to reach the authentication service. Check your connection and try again.",
  "auth/operation-not-allowed":
    "Email and password sign-in is not available right now.",
  "auth/admin-not-found":
    "This account is not authorized to access the admin area.",
  "auth/admin-inactive":
    "This admin account is inactive. Contact a super administrator for help.",
  "auth/admin-profile-invalid":
    "This admin account is not configured correctly. Contact a super administrator for help.",
  "auth/session-verification-failed":
    "We could not verify your admin access. Please try again.",
  "permission-denied":
    "You do not have permission to perform this action.",
  "firestore/permission-denied":
    "You do not have permission to perform this action.",
  unauthenticated: "Sign in to continue.",
  "firestore/unauthenticated": "Sign in to continue.",
  unavailable:
    "The service is temporarily unavailable. Check your connection and try again.",
  "firestore/unavailable":
    "The service is temporarily unavailable. Check your connection and try again.",
  "deadline-exceeded": "The request took too long. Please try again.",
  "firestore/deadline-exceeded": "The request took too long. Please try again.",
  "resource-exhausted":
    "The service is receiving too many requests. Please try again later.",
  "firestore/resource-exhausted":
    "The service is receiving too many requests. Please try again later.",
  "not-found": "The requested item could not be found.",
  "firestore/not-found": "The requested item could not be found.",
  "already-exists": "An item with these details already exists.",
  "firestore/already-exists": "An item with these details already exists.",
  cancelled: "The request was cancelled. Please try again.",
  "firestore/cancelled": "The request was cancelled. Please try again.",
});

export class FirebaseFriendlyError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "FirebaseFriendlyError";
    this.code = code;
  }
}

function readErrorCode(error: unknown): string | null {
  if (error instanceof FirebaseFriendlyError || error instanceof FirebaseError) {
    return error.code;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return error.code;
  }

  return null;
}

export function mapFirebaseError(
  error: unknown,
  fallbackMessage = DEFAULT_ERROR_MESSAGE,
): FirebaseFriendlyError {
  if (error instanceof FirebaseFriendlyError) {
    return error;
  }

  const code = readErrorCode(error) ?? "firebase/unknown";
  const message = FIREBASE_ERROR_MESSAGES[code] ?? fallbackMessage;

  return new FirebaseFriendlyError(code, message);
}

export function getFirebaseErrorMessage(
  error: unknown,
  fallbackMessage = DEFAULT_ERROR_MESSAGE,
): string {
  return mapFirebaseError(error, fallbackMessage).message;
}

export function createFirebaseError(code: string): FirebaseFriendlyError {
  return new FirebaseFriendlyError(
    code,
    FIREBASE_ERROR_MESSAGES[code] ?? DEFAULT_ERROR_MESSAGE,
  );
}

export function logFirebaseError(context: string, error: unknown): void {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  const code = readErrorCode(error) ?? "firebase/unknown";
  console.error(`[Firebase] ${context} failed (${code}).`);
}

