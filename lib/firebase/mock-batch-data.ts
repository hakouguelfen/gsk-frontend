// Mock data for testing when Firestore indexes aren't available
export const getMockBatchData = (batchNumber: string) => {
  return {
    batchNumber,
    labData: [
      {
        id: "mock-lab-1",
        productName: "Amoxicillin/Clavulanate",
        batchNumber: batchNumber,
        testType: "HPLC Analysis",
        testDate: "2023-05-15",
        testResults: {
          amoxicillin: 98.2,
          clavulanicAcid: 96.5,
          impurities: 0.3,
        },
        notes: "Standard test performed according to SOP-LAB-001",
        createdBy: "lab-analyst-1",
        createdAt: {
          toMillis: () => Date.now() - 86400000, // 1 day ago
        },
      },
    ],
    productionData: [
      {
        id: "mock-prod-1",
        productName: "Amoxicillin/Clavulanate",
        batchNumber: batchNumber,
        processStep: "Granulation",
        processDate: "2023-05-14",
        processParameters: {
          mixingTime: 45,
          temperature: 28,
          pressure: 2.1,
        },
        notes: "Process completed without issues",
        createdBy: "production-analyst-1",
        createdAt: {
          toMillis: () => Date.now() - 172800000, // 2 days ago
        },
      },
    ],
  }
}
