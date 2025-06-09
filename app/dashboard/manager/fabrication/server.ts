import { getFirestoreInstance, ROLES, sendNotification } from "@/lib/firebase/firestore"
import { addDoc, collection, getDocs, query, where } from "firebase/firestore"

interface FabricationProcess {
    id?: string
    batchNumber: string
    dateTime: string
    product_name: string
    product_type: string
    isAnalyzed: boolean
    isFabricated: boolean
    createdAt: Date
    createdBy: string
}

export const addFabricationProcess = async (data: Omit<FabricationProcess, "id" | "createdAt">) => {
    try {
        const db = getFirestoreInstance()
        const docRef = await addDoc(collection(db, "fabricationProcesses"), data)

        // Get all production analysts to notify them
        const usersSnapshot = await getDocs(
            query(collection(db, "users"), where("role", "==", ROLES.PRODUCTION_ANALYST), where("status", "==", "active")),
        )
        const productionAnalysts = usersSnapshot.docs.map((doc) => doc.id)

        // If we have production analysts, send them a notification
        if (productionAnalysts.length > 0) {
            await sendNotification({
                subject: `Fabrication Initiated for ${data.product_name} (Batch: ${data.batchNumber})`,
                message: `The fabrication process for ${data.product_name} (Batch: ${data.batchNumber}) has been initiated. You will be notified once the process is complete and relevant data becomes available.`,
                priority: "high",
                sender: "Manager",
                recipients: productionAnalysts,
                relatedData: {
                    type: "fabrication",
                    labDataId: "None",
                    productionDataId: docRef.id,
                    batchNumber: data.batchNumber,
                },
            })
        }
        return docRef.id
    } catch (error) {
        console.error("Error adding lab data:", error)
        throw error
    }
}
