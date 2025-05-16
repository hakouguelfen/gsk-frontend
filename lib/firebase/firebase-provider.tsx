"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { initializeApp, getApps, getApp } from "firebase/app"
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth"
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore"
import { firebaseConfig } from "./firebase-config"
import { ROLES, ROLE_PERMISSIONS, hasPermission } from "./firestore"

// Define types
export type UserRole = "lab-analyst" | "production-analyst" | "manager" | "administrator"

interface FirebaseUser extends User {
  role?: UserRole
  permissions?: string[]
}

interface FirebaseContextType {
  user: FirebaseUser | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, role: UserRole) => Promise<void>
  signOut: () => Promise<void>
  hasPermission: (permission: string) => boolean
  setUserRole: (role: UserRole) => void
}

// Create context
const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined)

// Initialize Firebase app function
const initializeFirebaseApp = () => {
  if (!firebaseConfig.apiKey) {
    console.error("Firebase API key is missing")
    return null
  }

  try {
    return !getApps().length ? initializeApp(firebaseConfig) : getApp()
  } catch (error) {
    console.error("Firebase initialization error:", error)
    return null
  }
}

// Provider component
export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [app, setApp] = useState<any>(null)
  const [auth, setAuth] = useState<any>(null)
  const [db, setDb] = useState<any>(null)

  // Initialize Firebase
  useEffect(() => {
    const app = initializeFirebaseApp()
    if (app) {
      setApp(app)
      setAuth(getAuth(app))
      setDb(getFirestore(app))
    } else {
      setError("Firebase could not be initialized. Check your environment variables.")
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Check if Firebase auth is initialized
    if (!auth) {
      return () => {}
    }

    console.log("Setting up auth state listener")

    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        console.log("Auth state changed:", user ? "User logged in" : "No user")

        if (user) {
          try {
            // Get user role from Firestore if available
            let role: UserRole | undefined

            // First check if we have a user document in Firestore
            if (db) {
              const userDoc = await getDoc(doc(db, "users", user.uid))

              if (userDoc.exists()) {
                // Use role from Firestore
                role = userDoc.data().role as UserRole
              } else {
                // Fallback to localStorage
                role = (localStorage.getItem("userRole") as UserRole) || ROLES.LAB_ANALYST

                // Store the role in Firestore for future reference
                try {
                  await setDoc(doc(db, "users", user.uid), {
                    email: user.email,
                    role: role,
                    username: user.email?.split("@")[0] || "user",
                    status: "active",
                    createdAt: new Date(),
                  })
                } catch (err) {
                  console.error("Error storing user role in Firestore:", err)
                }
              }
            } else {
              // Fallback to localStorage if Firestore is not available
              role = (localStorage.getItem("userRole") as UserRole) || ROLES.LAB_ANALYST
            }

            // Create user with role and permissions
            const userWithRole = user as FirebaseUser
            userWithRole.role = role
            userWithRole.permissions = ROLE_PERMISSIONS[role] || []

            setUser(userWithRole)
          } catch (error) {
            console.error("Error getting user role:", error)

            // Fallback to localStorage
            const role = (localStorage.getItem("userRole") as UserRole) || ROLES.LAB_ANALYST

            const userWithRole = user as FirebaseUser
            userWithRole.role = role
            userWithRole.permissions = ROLE_PERMISSIONS[role] || []

            setUser(userWithRole)
          }
        } else {
          setUser(null)
        }

        setLoading(false)
      },
      (error) => {
        console.error("Auth state change error:", error)
        setError("Authentication error: " + error.message)
        setLoading(false)
      },
    )

    return () => {
      console.log("Cleaning up auth state listener")
      unsubscribe()
    }
  }, [auth, db])

  // Sign in function
  const signIn = async (email: string, password: string) => {
    if (!auth) {
      throw new Error("Firebase authentication is not initialized")
    }

    try {
      console.log("Signing in with email:", email)
      await signInWithEmailAndPassword(auth, email, password)
      console.log("Sign in successful")
    } catch (error) {
      console.error("Error signing in:", error)
      throw error
    }
  }

  // Sign up function
  const signUp = async (email: string, password: string, role: UserRole) => {
    if (!auth || !db) {
      throw new Error("Firebase is not initialized")
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      // Store role in localStorage
      localStorage.setItem("userRole", role)

      // Store the user's role in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: email,
        role: role,
        username: email.split("@")[0],
        status: "active",
        createdAt: new Date(),
      })
    } catch (error) {
      console.error("Error signing up:", error)
      throw error
    }
  }

  // Sign out function
  const signOut = async () => {
    if (!auth) {
      throw new Error("Firebase authentication is not initialized")
    }

    try {
      await firebaseSignOut(auth)
      // Clear role from localStorage
      localStorage.removeItem("userRole")
    } catch (error) {
      console.error("Error signing out:", error)
      throw error
    }
  }

  // Set user role function
  const setUserRole = async (role: UserRole) => {
    if (!user || !db) {
      throw new Error("User not authenticated or Firestore not initialized")
    }

    try {
      // Update role in localStorage
      localStorage.setItem("userRole", role)

      // Update role in Firestore
      await setDoc(
        doc(db, "users", user.uid),
        {
          role: role,
        },
        { merge: true },
      )

      // Update user state
      setUser((prevUser) => {
        if (!prevUser) return null

        const updatedUser = { ...prevUser }
        updatedUser.role = role
        updatedUser.permissions = ROLE_PERMISSIONS[role] || []

        return updatedUser
      })
    } catch (error) {
      console.error("Error setting user role:", error)
      throw error
    }
  }

  // Check if user has permission
  const checkPermission = (permission: string): boolean => {
    if (!user || !user.role) {
      return false
    }

    return hasPermission(user.role, permission)
  }

  const value = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    hasPermission: checkPermission,
    setUserRole,
  }

  return <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>
}

// Custom hook to use the Firebase context
export const useFirebase = () => {
  const context = useContext(FirebaseContext)
  if (context === undefined) {
    throw new Error("useFirebase must be used within a FirebaseProvider")
  }
  return context
}
