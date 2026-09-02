import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

import { publicEnvironment } from "@/lib/env";

const firebaseConfig = {
  apiKey: publicEnvironment.firebaseApiKey,
  authDomain: publicEnvironment.firebaseAuthDomain,
  projectId: publicEnvironment.firebaseProjectId,
  storageBucket: publicEnvironment.firebaseStorageBucket,
  messagingSenderId: publicEnvironment.firebaseMessagingSenderId,
  appId: publicEnvironment.firebaseAppId,
  measurementId: publicEnvironment.firebaseMeasurementId,
};

export const firebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(firebaseApp);
export const firestore = getFirestore(firebaseApp);
