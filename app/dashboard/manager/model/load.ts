import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
} from "firebase/firestore";
import {
  getFirestoreInstance,
  type ModelFeedback,
} from "@/lib/firebase/firestore";

export interface ModelPerformance {
  id?: string;
  oldAccuracy: number;
  newAccuracy: number;
}
export const loadModelPerformance = async (): Promise<ModelPerformance> => {
  try {
    const db = getFirestoreInstance();
    const docRef = doc(db, "modelPerformance", "settings");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as ModelPerformance;
    } else {
      throw new Error("Lab data not found");
    }
  } catch (error) {
    console.error("Error getting documents:", error);
    throw error;
  }
};

export const loadFeedbacks = async (): Promise<ModelFeedback[] | null> => {
  try {
    const db = getFirestoreInstance();
    const querySnapshot = await getDocs(collection(db, "modelFeedback"));

    if (querySnapshot.empty) {
      console.log("No documents found");
      return null;
    }

    const documents = querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as ModelFeedback,
    );

    return documents;
  } catch (error) {
    console.error("Error getting documents:", error);
    throw error;
  }
};

export const countFeedbacks = async (): Promise<number> => {
  try {
    const db = getFirestoreInstance();
    const coll = collection(db, "modelFeedback");
    const snapshot = await getCountFromServer(coll);
    return snapshot.data().count;
  } catch (error) {
    console.error("Error getting model feedback:", error);
    return 0;
  }
};
