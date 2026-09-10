import type { NextConfig } from "next";

// This app is a static export, so every value the browser needs is inlined at
// build time. Listing the variables here lets `.env` (and the Vercel project
// settings) use plain names instead of the `NEXT_PUBLIC_` prefix: Next.js
// replaces `process.env.<KEY>` with the build-time value for each key below.
// Everything listed here ships to the browser, so only public values belong in
// this list — never a service-account key, API secret, or SMTP password.
const publicRuntimeKeys = [
  "FIREBASE_API_KEY",
  "FIREBASE_AUTH_DOMAIN",
  "FIREBASE_PROJECT_ID",
  "FIREBASE_STORAGE_BUCKET",
  "FIREBASE_MESSAGING_SENDER_ID",
  "FIREBASE_APP_ID",
  "FIREBASE_MEASUREMENT_ID",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_UPLOAD_PRESET",
  "SITE_URL",
  "WHATSAPP_NUMBER",
] as const;

const publicEnv = Object.fromEntries(
  publicRuntimeKeys.map((key) => [key, process.env[key] ?? ""]),
);

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  reactStrictMode: true,
  env: publicEnv,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
