import { readFileSync } from "fs";
import { initializeApp, cert, getApps, type App } from "firebase-admin/app";
import { getMessaging, type Messaging } from "firebase-admin/messaging";
import type { ServiceAccount } from "firebase-admin";

let firebaseCredentials: ServiceAccount | Record<string, string> | undefined;

if (process.env.PROJECT_ID && process.env.CLIENT_EMAIL && process.env.PRIVATE_KEY) {
  firebaseCredentials = {
    projectId: process.env.PROJECT_ID,
    clientEmail: process.env.CLIENT_EMAIL,
    privateKey: process.env.PRIVATE_KEY.replace(/\\n/g, "\n"),
  };
} else {
  try {
    const serviceAccountPath = new URL(
      "./social-media-app-5c437-firebase-adminsdk-fbsvc-de8cc43bf6.json",
      import.meta.url,
    );
    firebaseCredentials = JSON.parse(readFileSync(serviceAccountPath, "utf-8"));
  } catch {
    console.warn("Firebase credentials not found — push notifications disabled.");
  }
}

let app: App | undefined;
let messaging: Messaging | null = null;

if (firebaseCredentials) {
  app = !getApps().length
    ? initializeApp({
        credential: cert(firebaseCredentials as ServiceAccount),
      })
    : getApps()[0];
  messaging = getMessaging(app);
} else {
  console.warn("Firebase is not configured. Continuing without FCM.");
}

export { messaging };
export default app;
