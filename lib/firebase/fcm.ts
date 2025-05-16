"use client"

import { getMessaging, getToken, onMessage } from "firebase/messaging"
import { getFirebaseApp } from "./firebase-config"
import { toast } from "@/components/ui/use-toast"

// Initialize Firebase Messaging
export const initFCM = async () => {
  try {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      console.log("FCM not supported in this environment")
      return false
    }

    const app = getFirebaseApp()
    const messaging = getMessaging(app)

    // Set up message handler
    onMessage(messaging, (payload) => {
      console.log("Message received:", payload)

      // Show notification using toast
      if (payload.notification) {
        toast({
          title: payload.notification.title || "New Notification",
          description: payload.notification.body,
          duration: 6000,
        })
      }
    })

    return true
  } catch (error) {
    console.error("Error initializing FCM:", error)
    return false
  }
}

// Request notification permission and get FCM token
export const requestNotificationPermission = async () => {
  try {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return null
    }

    // Register service worker
    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
      scope: "/",
    })
    console.log("Service Worker registered with scope:", registration.scope)

    // Request permission
    const permission = await Notification.requestPermission()

    if (permission !== "granted") {
      console.log("Notification permission not granted")
      return null
    }

    // Get FCM token via server API
    const response = await fetch("/api/fcm-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ deviceToken: "placeholder" }),
    })

    if (!response.ok) {
      throw new Error("Failed to get VAPID key from server")
    }

    const data = await response.json()
    const vapidKey = data.vapidKey

    // Get token
    const app = getFirebaseApp()
    const messaging = getMessaging(app)
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    })

    console.log("FCM Token:", token)
    return token
  } catch (error) {
    console.error("Error requesting notification permission:", error)
    return null
  }
}
