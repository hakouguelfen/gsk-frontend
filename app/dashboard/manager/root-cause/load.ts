import { PredictionResult } from "@/components/ai-analysis-modal";
import { getFirestoreInstance } from "@/lib/firebase/firestore";
import { collection, getDocs, query } from "firebase/firestore";

const extract_evidence = (outOfRangeValues: Record<string, any>): Array<string> => {
  const result = Object.entries(outOfRangeValues).map(([key, obj]) =>
      `${key} is ${obj.value}: [${obj.status}]`
  );

  return result;
}

export const predictRootCause = async (batchNumber: any) => {
  try {
    const response = await fetch(`http://localhost:3000/${batchNumber}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const prediction = await response.json()

    return {
      batchNumber: batchNumber,
      product: null,
      rootCause: prediction["root cause"],
      confidence: prediction["accuracy"],
      evidence: extract_evidence(prediction["out_of_range"]),
      similarCases: [
        "CAPA-2023-089: HPLC calibration issue in Quality Control lab",
        "CAPA-2022-156: Analytical equipment drift in production testing",
      ],
      capaActions: [
        "Perform immediate recalibration of HPLC system",
        "Implement preventive maintenance schedule with stricter adherence",
        "Install automated calibration monitoring system",
        "Retrain analysts on equipment qualification procedures",
        "Review all recent analytical results from this equipment",
      ],
      riskLevel: "medium" as const,
    };
  } catch (error) {
    throw error
  }
}

export const loadPredictions = async (): Promise<PredictionResult[]> => {
  try {
    const db = getFirestoreInstance()
    const q = query(collection(db, "predictions"))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({ ...doc.data() as PredictionResult }) )
  } catch (error) {
    console.error("Error getting model feedback:", error)
    return []
  }
}

