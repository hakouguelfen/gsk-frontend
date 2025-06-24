import {
  getFirestoreInstance,
  ROLES,
  sendNotification,
} from "@/lib/firebase/firestore";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

export async function saveFabricationData(data: any) {
  try {
    const db = getFirestoreInstance();
    const fabricationDataRef = collection(db, "fabricationData");

    const docRef = await addDoc(fabricationDataRef, {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Update the fabrication process to mark as fabricated
    const fabricationProcessRef = doc(
      db,
      "fabricationProcesses",
      data.processId,
    );
    await updateDoc(fabricationProcessRef, {
      isFabricated: true,
      updatedAt: new Date().toISOString(),
    });

    // Get all production analysts to notify them
    const usersSnapshot = await getDocs(
      query(
        collection(db, "users"),
        where("role", "==", ROLES.LAB_ANALYST),
        where("status", "==", "active"),
      ),
    );
    const labAnalysts = usersSnapshot.docs.map((doc) => doc.id);

    // If we have production analysts, send them a notification
    if (labAnalysts.length > 0) {
      await sendNotification({
        subject: `Lab Data Required for ${data.product} (Batch: ${data.batchNumber})`,
        message: `Production data for ${data.product} (Batch: ${data.batchNumber}) has been uploaded by the production analyst. Please upload the corresponding lab analysis data to complete the batch documentation.`,
        priority: "high",
        sender: ROLES.PRODUCTION_ANALYST,
        recipients: labAnalysts,
        relatedData: {
          type: "production",
          labDataId: docRef.id,
          productionDataId: "none",
          batchNumber: data.batchNumber,
        },
      });
    }

    return docRef.id;
  } catch (error) {
    console.error("Error saving fabrication data:", error);
    throw error;
  }
}
