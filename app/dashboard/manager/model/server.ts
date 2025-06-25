import { doc, updateDoc } from "firebase/firestore";
import {
  getFirestoreInstance,
  type ModelFeedback,
} from "@/lib/firebase/firestore";

export const updateFeedBackContent = async (
  updates: Partial<ModelFeedback>,
) => {
  try {
    const db = getFirestoreInstance();
    const docRef = doc(db, "modelFeedback", updates.id ?? "");

    await updateDoc(docRef, updates);
  } catch (error) {
    console.error("Error getting documents:", error);
    throw error;
  }
};
