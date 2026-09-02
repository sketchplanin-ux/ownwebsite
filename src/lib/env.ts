import { z } from "zod";

const publicEnvironmentSchema = z.object({
  firebaseApiKey: z.string().min(1),
  firebaseAuthDomain: z.string().min(1),
  firebaseProjectId: z.string().min(1),
  firebaseStorageBucket: z.string().min(1),
  firebaseMessagingSenderId: z.string().min(1),
  firebaseAppId: z.string().min(1),
  firebaseMeasurementId: z.string().optional(),
  mediaBaseUrl: z.url(),
  mediaUploadUrl: z.url(),
  siteUrl: z.url().or(z.literal("")),
  whatsappNumber: z.string(),
});

const parsedEnvironment = publicEnvironmentSchema.safeParse({
  firebaseApiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  firebaseAuthDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  firebaseProjectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  firebaseStorageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  firebaseMessagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  firebaseAppId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  firebaseMeasurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  mediaBaseUrl: process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL,
  mediaUploadUrl: process.env.NEXT_PUBLIC_MEDIA_UPLOAD_URL,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
});

if (!parsedEnvironment.success) {
  const invalidFields = parsedEnvironment.error.issues
    .map((issue) => issue.path.join("."))
    .join(", ");

  throw new Error(
    `Invalid public environment configuration. Check: ${invalidFields}`,
  );
}

export const publicEnvironment = Object.freeze(parsedEnvironment.data);

/** Hostname that serves R2 objects, used to gate image transformation URLs. */
export const mediaHostname = new URL(publicEnvironment.mediaBaseUrl).hostname
  .toLowerCase();
