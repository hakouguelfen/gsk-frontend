import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { getFirestoreInstance } from "@/lib/firebase/firestore";

export const savePrediction = async (data: any) => {
  try {
    const db = getFirestoreInstance();
    const docRef = await addDoc(collection(db, "predictions"), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error submitting model feedback:", error);
    throw error;
  }
};

export async function setProductAsAnalyzed(processId: string) {
  try {
    const db = getFirestoreInstance();

    const fabricationProcessRef = doc(db, "fabricationProcesses", processId);
    await updateDoc(fabricationProcessRef, {
      isAnalyzed: true,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error saving fabrication data:", error);
    throw error;
  }
}
