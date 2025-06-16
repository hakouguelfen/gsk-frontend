import { getFirestoreInstance } from "@/lib/firebase/firestore"
import { addDoc, collection, doc, updateDoc } from "firebase/firestore"

export async function saveLabAnalysisData(data: any) {
  try {
    const db = getFirestoreInstance()
    const fabricationDataRef = collection(db, "labAnalysisData")

    const docRef = await addDoc(fabricationDataRef, {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    // Update the fabrication process to mark as fabricated
    const fabricationProcessRef = doc(db, "fabricationProcesses", data.processId)
    await updateDoc(fabricationProcessRef, {
      isTested: true,
      updatedAt: new Date().toISOString(),
    })

    return docRef.id
  } catch (error) {
    console.error("Error saving fabrication data:", error)
    throw error
  }
}
