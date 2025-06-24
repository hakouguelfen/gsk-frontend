import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  getFirestoreInstance,
  ROLES,
  sendNotification,
} from "@/lib/firebase/firestore";

export async function saveLabAnalysisData(data: any) {
  try {
    const db = getFirestoreInstance();
    const fabricationDataRef = collection(db, "labAnalysisData");

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
      isTested: true,
      updatedAt: new Date().toISOString(),
    });

    const productionDataSnapshot = await getDocs(
      query(
        collection(db, "fabricationData"),
        where("batchNumber", "==", data.batchNumber),
        limit(1),
      ),
    );
    const productionDataId = productionDataSnapshot.docs[0].id;

    // Get all production analysts to notify them
    const usersSnapshot = await getDocs(
      query(
        collection(db, "users"),
        where("role", "==", ROLES.MANAGER),
        where("status", "==", "active"),
      ),
    );
    const managers = usersSnapshot.docs.map((doc) => doc.id);
    // If we have production analysts, send them a notification
    if (managers.length > 0) {
      await sendNotification({
        subject: `Analysis Ready for ${data.product} (Batch: ${data.batchNumber})`,
        message: `Lab analysis data for ${data.product} (Batch: ${data.batchNumber}) has been uploaded. Both production and lab data are now complete and ready for root cause analysis and prediction.`,
        priority: "high",
        sender: ROLES.LAB_ANALYST,
        recipients: managers,
        relatedData: {
          type: "lab",
          labDataId: docRef.id,
          productionDataId: productionDataId,
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
