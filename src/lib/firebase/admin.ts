// src/lib/firebase/admin.ts
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK (singleton pattern)
function initAdmin() {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (!serviceAccount) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT environment variable is not set. Please add it to your .env.local file."
    );
  }

  try {
    const credentials = JSON.parse(serviceAccount);

    return admin.initializeApp({
      credential: admin.credential.cert(credentials),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  } catch (error) {
    console.error("Failed to initialize Firebase Admin:", error);
    throw new Error(
      "Failed to parse Firebase service account credentials. Make sure the JSON is valid."
    );
  }
}

export function getAdminAuth() {
  return initAdmin().auth();
}

export function getAdminFirestore() {
  return initAdmin().firestore();
}
