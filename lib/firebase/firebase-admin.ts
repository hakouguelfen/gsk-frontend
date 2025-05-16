import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { getMessaging } from "firebase-admin/messaging"

// Initialize Firebase Admin
export function getFirebaseAdminApp() {
  const apps = getApps()

  if (apps.length > 0) {
    return apps[0]
  }

  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Firebase Admin credentials are not properly configured")
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  })
}

// Get Firestore Admin
export function getFirestoreAdmin() {
  const app = getFirebaseAdminApp()
  return getFirestore(app)
}

// Get Messaging Admin
export function getMessagingAdmin() {
  const app = getFirebaseAdminApp()
  return getMessaging(app)
}
