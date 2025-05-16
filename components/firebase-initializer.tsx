"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { initializeApp, getApps } from "firebase/app"
import { firebaseConfig } from "@/lib/firebase/firebase-config"

export function FirebaseInitializer({ children }: { children: React.ReactNode }) {
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (!getApps().length) {
      try {
        initializeApp(firebaseConfig)
        console.log("Firebase initialized successfully")
      } catch (error) {
        console.error("Firebase initialization error:", error)
      }
    }
    setInitialized(true)
  }, [])

  if (!initialized) {
    return <div>Initializing application...</div>
  }

  return <>{children}</>
}
