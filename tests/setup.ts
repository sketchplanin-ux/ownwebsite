import "@testing-library/jest-dom/vitest";

Object.assign(process.env, {
  FIREBASE_API_KEY: "test-api-key",
  FIREBASE_AUTH_DOMAIN: "test.firebaseapp.com",
  FIREBASE_PROJECT_ID: "test-project",
  FIREBASE_STORAGE_BUCKET: "test.appspot.com",
  FIREBASE_MESSAGING_SENDER_ID: "1234567890",
  FIREBASE_APP_ID: "1:1234567890:web:test",
  CLOUDINARY_CLOUD_NAME: "test-cloud",
  CLOUDINARY_UPLOAD_PRESET: "test-preset",
});
