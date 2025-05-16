import { type NextRequest, NextResponse } from "next/server"
import { getFirebaseAdminApp } from "@/lib/firebase/firebase-admin"

export async function POST(request: NextRequest) {
  try {
    // Get the Firebase Admin app
    const app = getFirebaseAdminApp()

    // Get the messaging service
    const messaging = app.messaging()

    // Parse the request body
    const { deviceToken } = await request.json()

    if (!deviceToken) {
      return NextResponse.json({ error: "Device token is required" }, { status: 400 })
    }

    // Get the VAPID key from environment variables
    const vapidKey = process.env.FIREBASE_VAPID_KEY

    if (!vapidKey) {
      return NextResponse.json({ error: "VAPID key is not configured" }, { status: 500 })
    }

    // Return the VAPID key
    return NextResponse.json({ vapidKey })
  } catch (error) {
    console.error("Error generating FCM token:", error)
    return NextResponse.json({ error: "Failed to generate FCM token" }, { status: 500 })
  }
}
