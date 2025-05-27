import { getFirestoreInstance } from "@/lib/firebase/firestore";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export const savePrediction = async (data: any) => {
  try {
    const db = getFirestoreInstance()
    const docRef = await addDoc(collection(db, "predictions"), {
      ...data,
      createdAt: serverTimestamp(),
    })
    return docRef.id
  } catch (error) {
    console.error("Error submitting model feedback:", error)
    throw error
  }
}
