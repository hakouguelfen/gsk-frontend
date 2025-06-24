import { collection, getDocs, limit, query, where } from "firebase/firestore";
import type { PredictionResult } from "@/components/ai-analysis-modal";
import {
  getFirestoreInstance,
  ROLES,
  sendNotification,
} from "@/lib/firebase/firestore";

const extract_evidence = (
  outOfRangeValues: Record<string, any>,
): Array<string> => {
  const result = Object.entries(outOfRangeValues).map(
    ([key, obj]) => `${key} is ${obj.value}: [${obj.status}]`,
  );

  return result;
};

const checkUser = (rootCause: string) => {
  if (rootCause === "Unknown") {
    return null;
  }
  if (
    ["Lab Error", "Lab Issue", "Equipment Issue"].includes(
      rootCause.split("-")[0],
    )
  ) {
    return ROLES.LAB_ANALYST;
  }

  return ROLES.PRODUCTION_ANALYST;
};

const pushNotification = async (prediction: PredictionResult) => {
  const db = getFirestoreInstance();

  // LAB_ANALYST
  const labSnapshot = await getDocs(
    query(
      collection(db, "users"),
      where("role", "==", ROLES.LAB_ANALYST),
      where("status", "==", "active"),
    ),
  );
  const lab = labSnapshot.docs.map((doc) => doc.id);
  // PRODUCTION_ANALYST
  const usersSnapshot = await getDocs(
    query(
      collection(db, "users"),
      where("role", "==", ROLES.LAB_ANALYST),
      where("status", "==", "active"),
    ),
  );
  const prod = usersSnapshot.docs.map((doc) => doc.id);
  const toBlame =
    checkUser(prediction.rootCause) === ROLES.LAB_ANALYST ? lab : prod;

  if (toBlame.length > 0) {
    await sendNotification({
      subject: `CAPA Required for ${prediction.product} (Batch: ${prediction.batchNumber}) - Root Cause Identified`,
      message: `Root cause analysis for ${prediction.product} (Batch: ${prediction.batchNumber}) has been completed. Please implement the required Corrective and Preventive Action and provide feedback once completed.`,
      capa: prediction.capa,
      priority: "high",
      sender: ROLES.MANAGER,
      recipients: toBlame,
      relatedData: {
        type: "capa",
        labDataId: "none",
        productionDataId: "none",
        batchNumber: prediction.batchNumber,
      },
    });
  }
};

export const predictRootCause = async (
  batchNumber: string,
): Promise<PredictionResult> => {
  try {
    const response = await fetch(`http://localhost:3000/${batchNumber}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const prediction: PredictionResult = await response.json();

    await pushNotification(prediction);

    return prediction;
    // return {
    //   ...prediction,
    //   evidence: extract_evidence(prediction.evidence),
    // };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const loadPredictions = async (): Promise<PredictionResult[]> => {
  try {
    const db = getFirestoreInstance();
    const q = query(collection(db, "predictions"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      ...(doc.data() as PredictionResult),
    }));
  } catch (error) {
    console.error("Error getting model feedback:", error);
    return [];
  }
};

export const findPrediction = async (
  batchNumber: string,
): Promise<PredictionResult | null> => {
  try {
    const db = getFirestoreInstance();
    const q = query(
      collection(db, "predictions"),
      where("batchNumber", "==", batchNumber),
      limit(1),
    );
    const querySnapshot = await getDocs(q);

    const doc = querySnapshot.docs[0];
    return {
      ...doc.data(),
    } as PredictionResult;
  } catch (error) {
    console.error("Error getting model feedback:", error);
    return null;
  }
};
