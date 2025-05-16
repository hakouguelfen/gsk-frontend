"use client"

import { useEffect, useState } from "react"
import { initFCM, requestNotificationPermission } from "@/lib/firebase/fcm"
import { useToast } from "@/components/ui/use-toast"

export function FCMClient() {
  const [fcmInitialized, setFcmInitialized] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const initializeMessaging = async () => {
      try {
        // Initialize FCM
        const initialized = await initFCM()
        setFcmInitialized(initialized)

        if (initialized) {
          // Request permission
          const token = await requestNotificationPermission()

          if (token) {
            toast({
              title: "Notifications enabled",
              description: "You will now receive notifications for important updates.",
              duration: 5000,
            })
          }
        }
      } catch (error) {
        console.error("Error initializing FCM:", error)
      }
    }

    initializeMessaging()
  }, [toast])

  return null // This component doesn't render anything
}
