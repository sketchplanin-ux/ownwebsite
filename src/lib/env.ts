import { z } from "zod";

const publicEnvironmentSchema = z.object({
  firebaseApiKey: z.string().min(1),
  firebaseAuthDomain: z.string().min(1),
  firebaseProjectId: z.string().min(1),
  firebaseStorageBucket: z.string().min(1),
  firebaseMessagingSenderId: z.string().min(1),
  firebaseAppId: z.string().min(1),
  firebaseMeasurementId: z.string().optional(),
  cloudinaryCloudName: z.string().min(1),
  // Optional on purpose: a blank preset disables the admin image uploader,
  // which re-checks it at upload time. It must not stop the app from booting.
  cloudinaryUploadPreset: z.string().default(""),
  siteUrl: z.url().or(z.literal("")),
  whatsappNumber: z.string(),
});

const parsedEnvironment = publicEnvironmentSchema.safeParse({
  firebaseApiKey: process.env.FIREBASE_API_KEY,
  firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
  firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  firebaseAppId: process.env.FIREBASE_APP_ID,
  firebaseMeasurementId: process.env.FIREBASE_MEASUREMENT_ID,
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryUploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
  siteUrl: process.env.SITE_URL ?? "",
  whatsappNumber: process.env.WHATSAPP_NUMBER ?? "",
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
