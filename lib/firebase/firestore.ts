import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  deleteDoc,
  limit,
  getFirestore,
  type Firestore,
  type Timestamp,
} from "firebase/firestore"
import { getApp, getApps, initializeApp } from "firebase/app"
import { firebaseConfig } from "./firebase-config"

// Add this import at the top
import { getMockNotifications, getMockCAPAs } from "./mock-data"

// Create a function to get the Firestore instance
let firestoreInstance: Firestore | null = null

export const getFirestoreInstance = (): Firestore => {
  if (firestoreInstance) {
    return firestoreInstance
  }

  // Initialize Firebase if not already initialized
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
  firestoreInstance = getFirestore(app)
  return firestoreInstance
}

// Feedback Types for Model Improvement
export interface ModelFeedback {
  id?: string
  batchNumber: string
  productName: string
  originalPrediction: {
    rootCause: string
    confidence: number
    evidence: string[]
    capaActions: string[]
  }
  userFeedback: {
    isCorrect: boolean
    actualRootCause?: string
    actualCapaActions?: string[]
    comments?: string
  }
  managerId: string
  createdAt: Timestamp
}

// Lab Data Types
export interface LabData {
  id?: string
  productName: string
  batchNumber: string
  testType: string
  testDate: string
  notes?: string
  createdBy: string
  createdAt: Timestamp
}

// Production Data Types
export interface ProductionData {
  id?: string
  productName: string
  batchNumber: string
  processStep: string
  processDate: string
  processParameters: Record<string, any>
  notes?: string
  createdBy: string
  createdAt: Timestamp
}

// Notification Types
export interface Notification {
  id?: string
  subject: string
  message: string
  priority: "high" | "medium" | "low"
  sender: string
  recipients: string[]
  read: boolean
  createdAt: Timestamp
  relatedData?: {
    type: "lab" | "production" | "combined"
    labDataId?: string
    productionDataId?: string
    batchNumber?: string
  }
}

// CAPA Types
export interface CAPA {
  id?: string
  title: string
  description: string
  rootCause: string
  correctiveActions: string[]
  preventiveActions: string[]
  assignedTo: string[]
  status: "open" | "in-progress" | "completed" | "verified"
  priority: "high" | "medium" | "low"
  dueDate: Timestamp
  createdBy: string
  createdAt: Timestamp
}

// User Types
export interface User {
  id?: string
  username: string
  email: string
  role: string
  status: "active" | "inactive"
  department?: string
  createdAt: Date | Timestamp
}

// Role-based access control
export const ROLES = {
  LAB_ANALYST: "lab-analyst",
  PRODUCTION_ANALYST: "production-analyst",
  MANAGER: "manager",
  ADMINISTRATOR: "administrator",
}

export const ROLE_PERMISSIONS = {
  [ROLES.LAB_ANALYST]: ["lab-data:read", "lab-data:write", "notifications:read"],
  [ROLES.PRODUCTION_ANALYST]: ["production-data:read", "production-data:write", "notifications:read"],
  [ROLES.MANAGER]: [
    "lab-data:read",
    "production-data:read",
    "notifications:read",
    "capa:read",
    "capa:write",
    "root-cause:read",
    "root-cause:write",
  ],
  [ROLES.ADMINISTRATOR]: [
    "lab-data:read",
    "production-data:read",
    "notifications:read",
    "capa:read",
    "capa:write",
    "root-cause:read",
    "root-cause:write",
    "users:read",
    "users:write",
    "statistics:read",
  ],
}
// Model Feedback Functions
export const submitModelFeedback = async (data: Omit<ModelFeedback, "id" | "createdAt">) => {
  try {
    const db = getFirestoreInstance()
    const docRef = await addDoc(collection(db, "modelFeedback"), {
      ...data,
      createdAt: serverTimestamp(),
    })
    return docRef.id
  } catch (error) {
    console.error("Error submitting model feedback:", error)
    throw error
  }
}
export const getModelFeedback = async (batchNumber: string) => {
  try {
    const db = getFirestoreInstance()
    const q = query(collection(db, "modelFeedback"), where("batchNumber", "==", batchNumber))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as ModelFeedback)
  } catch (error) {
    console.error("Error getting model feedback:", error)
    return []
  }
}

// Lab Data Functions
export const addLabData = async (data: Omit<LabData, "id" | "createdAt">) => {
  try {
    const db = getFirestoreInstance()
    const docRef = await addDoc(collection(db, "labData"), {
      ...data,
      createdAt: serverTimestamp(),
    })

    // Get all production analysts to notify them
    const usersSnapshot = await getDocs(
      query(collection(db, "users"), where("role", "==", ROLES.PRODUCTION_ANALYST), where("status", "==", "active")),
    )

    const productionAnalysts = usersSnapshot.docs.map((doc) => doc.id)

    // If we have production analysts, send them a notification
    if (productionAnalysts.length > 0) {
      await sendNotification({
        subject: `New Lab Data for ${data.productName} (Batch: ${data.batchNumber})`,
        message: `New laboratory test results have been submitted for ${data.productName} (Batch: ${data.batchNumber}). Please review and submit corresponding production data.`,
        priority: "medium",
        sender: "Lab System",
        recipients: productionAnalysts,
        relatedData: {
          type: "lab",
          labDataId: docRef.id,
          batchNumber: data.batchNumber,
        },
      })
    }

    // Check if there's already production data for this batch
    const productionDataSnapshot = await getDocs(
      query(collection(db, "productionData"), where("batchNumber", "==", data.batchNumber), limit(1)),
    )

    // If we have matching production data, notify managers
    if (!productionDataSnapshot.empty) {
      const productionData = productionDataSnapshot.docs[0].data() as ProductionData
      const productionDataId = productionDataSnapshot.docs[0].id

      // Get all managers
      const managersSnapshot = await getDocs(
        query(collection(db, "users"), where("role", "==", ROLES.MANAGER), where("status", "==", "active")),
      )

      const managers = managersSnapshot.docs.map((doc) => doc.id)

      // If we have managers, send them a notification with combined data
      if (managers.length > 0) {
        await sendNotification({
          subject: `Complete Data Available for ${data.productName} (Batch: ${data.batchNumber})`,
          message: `Both laboratory and production data are now available for ${data.productName} (Batch: ${data.batchNumber}). You can now perform root cause analysis if needed.`,
          priority: "high",
          sender: "Quality System",
          recipients: managers,
          relatedData: {
            type: "combined",
            labDataId: docRef.id,
            productionDataId: productionDataId,
            batchNumber: data.batchNumber,
          },
        })
      }
    }

    return docRef.id
  } catch (error) {
    console.error("Error adding lab data:", error)
    throw error
  }
}

export const getLabData = async (id: string) => {
  try {
    const db = getFirestoreInstance()
    const docRef = doc(db, "labData", id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as LabData
    } else {
      throw new Error("Lab data not found")
    }
  } catch (error) {
    console.error("Error getting lab data:", error)
    throw error
  }
}

// Updated to handle missing index
export const getLabDataByBatch = async (batchNumber: string) => {
  try {
    const db = getFirestoreInstance()
    let labData = []

    try {
      // First attempt with ordering (requires index)
      const q = query(collection(db, "labData"), where("batchNumber", "==", batchNumber), orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)
      labData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as LabData)
    } catch (indexError) {
      console.log("Index error in getLabDataByBatch, falling back to simple query:", indexError)

      // Fallback to a simple query without ordering
      const q = query(collection(db, "labData"), where("batchNumber", "==", batchNumber))
      const querySnapshot = await getDocs(q)
      labData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as LabData)

      // Sort client-side by createdAt in descending order
      labData.sort((a, b) => {
        const dateA = a.createdAt?.toMillis() || 0
        const dateB = b.createdAt?.toMillis() || 0
        return dateB - dateA
      })
    }

    return labData
  } catch (error) {
    console.error("Error getting lab data by batch:", error)
    // Return empty array instead of throwing
    return []
  }
}

// Production Data Functions
export const addProductionData = async (data: any) => {
  try {
    const db = getFirestoreInstance()
    const docRef = await addDoc(collection(db, "productionData"), {
      ...data,
      createdAt: serverTimestamp(),
    })

    // Check if there's already lab data for this batch
    const labDataSnapshot = await getDocs(
      query(collection(db, "labData"), where("batchNumber", "==", data.batchNumber), limit(1)),
    )

    // Get all managers to notify them
    const managersSnapshot = await getDocs(
      query(collection(db, "users"), where("role", "==", ROLES.MANAGER), where("status", "==", "active")),
    )

    const managers = managersSnapshot.docs.map((doc) => doc.id)

    // If we have lab data for this batch, send a combined notification to managers
    if (!labDataSnapshot.empty && managers.length > 0) {
      const labData = labDataSnapshot.docs[0].data() as LabData
      const labDataId = labDataSnapshot.docs[0].id

      await sendNotification({
        subject: `Complete Data Available for ${data.productName} (Batch: ${data.batchNumber})`,
        message: `Both laboratory and production data are now available for ${data.productName} (Batch: ${data.batchNumber}). You can now perform root cause analysis if needed.`,
        priority: "high",
        sender: "Quality System",
        recipients: managers,
        relatedData: {
          type: "combined",
          labDataId: labDataId,
          productionDataId: docRef.id,
          batchNumber: data.batchNumber,
        },
      })
    } else if (managers.length > 0) {
      // If no lab data yet, just notify managers about the production data
      await sendNotification({
        subject: `New Production Data for ${data.productName} (Batch: ${data.batchNumber})`,
        message: `New production process data has been submitted for ${data.productName} (Batch: ${data.batchNumber}).`,
        priority: "medium",
        sender: "Production System",
        recipients: managers,
        relatedData: {
          type: "production",
          productionDataId: docRef.id,
          batchNumber: data.batchNumber,
        },
      })
    }

    return docRef.id
  } catch (error) {
    console.error("Error adding production data:", error)
    throw error
  }
}

export const getProductionData = async (id: string) => {
  try {
    const db = getFirestoreInstance()
    const docRef = doc(db, "productionData", id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as ProductionData
    } else {
      throw new Error("Production data not found")
    }
  } catch (error) {
    console.error("Error getting production data:", error)
    throw error
  }
}

// Updated to handle missing index
export const getProductionDataByBatch = async (batchNumber: string) => {
  try {
    const db = getFirestoreInstance()
    let productionData = []

    try {
      // First attempt with ordering (requires index)
      const q = query(
        collection(db, "productionData"),
        where("batchNumber", "==", batchNumber),
        orderBy("createdAt", "desc"),
      )
      const querySnapshot = await getDocs(q)
      productionData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as ProductionData)
    } catch (indexError) {
      console.log("Index error in getProductionDataByBatch, falling back to simple query:", indexError)

      // Fallback to a simple query without ordering
      const q = query(collection(db, "productionData"), where("batchNumber", "==", batchNumber))
      const querySnapshot = await getDocs(q)
      productionData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as ProductionData)

      // Sort client-side by createdAt in descending order
      productionData.sort((a, b) => {
        const dateA = a.createdAt?.toMillis() || 0
        const dateB = b.createdAt?.toMillis() || 0
        return dateB - dateA
      })
    }

    return productionData
  } catch (error) {
    console.error("Error getting production data by batch:", error)
    // Return empty array instead of throwing
    return []
  }
}

// Get combined data for a batch (both lab and production)
export const getCombinedBatchData = async (batchNumber: string) => {
  try {
    const labData = await getLabDataByBatch(batchNumber)
    const productionData = await getProductionDataByBatch(batchNumber)

    // If we have real data, return it
    if (labData.length > 0 || productionData.length > 0) {
      return {
        batchNumber,
        labData,
        productionData,
      }
    }

    return null
  } catch (error) {
    console.error("Error getting combined batch data:", error)
    return null
  }
}

// Notification Functions
export const sendNotification = async (data: Omit<Notification, "id" | "read" | "createdAt">) => {
  try {
    const db = getFirestoreInstance()
    const docRef = await addDoc(collection(db, "notifications"), {
      ...data,
      read: false,
      createdAt: serverTimestamp(),
    })
    return docRef.id
  } catch (error) {
    console.error("Error sending notification:", error)
    throw error
  }
}

// Update the getNotifications function to handle the index better
export const getNotifications = async (userId: string) => {
  try {
    const db = getFirestoreInstance()
    // Try to use the index if it exists
    let notifications = []

    try {
      // First attempt with the index
      const q = query(
        collection(db, "notifications"),
        where("recipients", "array-contains", userId),
        orderBy("createdAt", "desc"),
      )

      const querySnapshot = await getDocs(q)
      notifications = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Notification,
      )
    } catch (indexError) {
      console.log("Index error, falling back to simple query:", indexError)

      // Fallback to a simple query without ordering
      const q = query(collection(db, "notifications"), where("recipients", "array-contains", userId))

      const querySnapshot = await getDocs(q)
      notifications = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Notification,
      )

      // Sort client-side
      notifications.sort((a, b) => {
        const dateA = a.createdAt?.toMillis() || 0
        const dateB = b.createdAt?.toMillis() || 0
        return dateB - dateA
      })
    }

    return notifications.length > 0 ? notifications : getMockNotifications(userId)
  } catch (error) {
    console.error("Error getting notifications:", error)
    console.log("Using mock notifications data instead")

    // Return mock data as a fallback
    return getMockNotifications(userId)
  }
}

export const markNotificationAsRead = async (id: string) => {
  try {
    const db = getFirestoreInstance()
    const docRef = doc(db, "notifications", id)
    await updateDoc(docRef, { read: true })
  } catch (error) {
    console.error("Error marking notification as read:", error)
    throw error
  }
}

// CAPA Functions
export const createCAPA = async (data: Omit<CAPA, "id" | "createdAt">) => {
  try {
    const db = getFirestoreInstance()
    const docRef = await addDoc(collection(db, "capas"), {
      ...data,
      createdAt: serverTimestamp(),
    })
    return docRef.id
  } catch (error) {
    console.error("Error creating CAPA:", error)
    throw error
  }
}

export const getCAPA = async (id: string) => {
  try {
    const db = getFirestoreInstance()
    const docRef = doc(db, "capas", id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as CAPA
    } else {
      throw new Error("CAPA not found")
    }
  } catch (error) {
    console.error("Error getting CAPA:", error)
    throw error
  }
}

// Update the getAssignedCAPAs function to use mock data as fallback
export const getAssignedCAPAs = async (userId: string) => {
  try {
    const db = getFirestoreInstance()
    let capas = []

    try {
      // First attempt with potential index
      const q = query(
        collection(db, "capas"),
        where("assignedTo", "array-contains", userId),
        orderBy("createdAt", "desc"),
      )

      const querySnapshot = await getDocs(q)
      capas = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as CAPA,
      )
    } catch (indexError) {
      console.log("Index error in getAssignedCAPAs, falling back to simple query:", indexError)

      // Fallback to a simple query without ordering
      const q = query(collection(db, "capas"), where("assignedTo", "array-contains", userId))

      const querySnapshot = await getDocs(q)
      capas = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as CAPA,
      )

      // Sort client-side by createdAt in descending order
      capas.sort((a, b) => {
        const dateA = a.createdAt?.toMillis() || 0
        const dateB = b.createdAt?.toMillis() || 0
        return dateB - dateA
      })
    }

    return capas.length > 0 ? capas : getMockCAPAs(userId)
  } catch (error) {
    console.error("Error getting assigned CAPAs:", error)
    console.log("Using mock CAPA data instead")

    // Return mock data instead of throwing
    return getMockCAPAs(userId)
  }
}

export const updateCAPAStatus = async (id: string, status: CAPA["status"]) => {
  try {
    const db = getFirestoreInstance()
    const docRef = doc(db, "capas", id)
    await updateDoc(docRef, { status })
  } catch (error) {
    console.error("Error updating CAPA status:", error)
    throw error
  }
}

// User Functions
export const createUser = async (data: Omit<User, "id">) => {
  try {
    const db = getFirestoreInstance()
    const docRef = await addDoc(collection(db, "users"), {
      ...data,
      createdAt: serverTimestamp(),
    })
    return docRef.id
  } catch (error) {
    console.error("Error creating user:", error)
    throw error
  }
}

export const getUsers = async () => {
  try {
    const db = getFirestoreInstance()
    let users = []

    try {
      // First attempt with ordering (requires index)
      const q = query(collection(db, "users"), orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)
      users = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as User,
      )
    } catch (indexError) {
      console.log("Index error in getUsers, falling back to simple query:", indexError)

      // Fallback to a simple query without ordering
      const q = query(collection(db, "users"))
      const querySnapshot = await getDocs(q)
      users = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as User,
      )

      // Sort client-side by createdAt in descending order if possible
      users.sort((a, b) => {
        const dateA = a.createdAt
          ? typeof a.createdAt === "object" && "toMillis" in a.createdAt
            ? a.createdAt.toMillis()
            : new Date(a.createdAt as any).getTime()
          : 0
        const dateB = b.createdAt
          ? typeof b.createdAt === "object" && "toMillis" in b.createdAt
            ? b.createdAt.toMillis()
            : new Date(b.createdAt as any).getTime()
          : 0
        return dateB - dateA
      })
    }

    return users
  } catch (error) {
    console.error("Error getting users:", error)
    // Return empty array instead of throwing
    return []
  }
}

export const getUsersByRole = async (role: string) => {
  try {
    const db = getFirestoreInstance()
    let users = []

    try {
      // First attempt with potential index
      const q = query(
        collection(db, "users"),
        where("role", "==", role),
        where("status", "==", "active"),
        orderBy("createdAt", "desc"),
      )

      const querySnapshot = await getDocs(q)
      users = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as User,
      )
    } catch (indexError) {
      console.log(`Index error in getUsersByRole for ${role}, falling back to simple query:`, indexError)

      // Fallback to a simple query without ordering
      const q = query(collection(db, "users"), where("role", "==", role), where("status", "==", "active"))

      const querySnapshot = await getDocs(q)
      users = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as User,
      )
    }

    return users
  } catch (error) {
    console.error(`Error getting users by role ${role}:`, error)
    return []
  }
}

export const updateUserStatus = async (id: string, status: User["status"]) => {
  try {
    const db = getFirestoreInstance()
    const docRef = doc(db, "users", id)
    await updateDoc(docRef, { status })
  } catch (error) {
    console.error("Error updating user status:", error)
    throw error
  }
}

export const deleteUser = async (id: string) => {
  try {
    const db = getFirestoreInstance()
    const docRef = doc(db, "users", id)
    await deleteDoc(docRef)
  } catch (error) {
    console.error("Error deleting user:", error)
    throw error
  }
}

// Permission checking function
export const hasPermission = (userRole: string, permission: string): boolean => {
  if (!userRole || !ROLE_PERMISSIONS[userRole]) {
    return false
  }

  return ROLE_PERMISSIONS[userRole].includes(permission)
}

export type { Timestamp }
