import "@testing-library/jest-dom/vitest";

Object.assign(process.env, {
  NEXT_PUBLIC_FIREBASE_API_KEY: "test-api-key",
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "test.firebaseapp.com",
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: "test-project",
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "test.appspot.com",
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "1234567890",
  NEXT_PUBLIC_FIREBASE_APP_ID: "1:1234567890:web:test",
  NEXT_PUBLIC_R2_PUBLIC_BASE_URL: "https://cdn.test.example",
  NEXT_PUBLIC_MEDIA_UPLOAD_URL: "https://media.test.workers.dev/uploads",
});
