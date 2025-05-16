import { Timestamp } from "firebase/firestore"
import type { Notification, CAPA } from "./firestore"

// Mock notifications data
export const getMockNotifications = (userId: string): Notification[] => {
  return [
    {
      id: "mock-notification-1",
      subject: "OOS Result for Augmentin Batch A2023-45",
      message:
        "Augmentin 60ml Batch #A2023-45 has an OOS result for pH level. Please review and initiate investigation.",
      priority: "high",
      sender: "system",
      recipients: [userId],
      read: false,
      createdAt: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 30)), // 30 minutes ago
    },
    {
      id: "mock-notification-2",
      subject: "New CAPA Document Available",
      message: "CAPA-2023-089 has been assigned to you. Please review and implement the corrective actions.",
      priority: "medium",
      sender: "system",
      recipients: [userId],
      read: false,
      createdAt: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 120)), // 2 hours ago
    },
    {
      id: "mock-notification-3",
      subject: "Equipment Calibration Due",
      message: "HPLC Unit #3 is due for calibration tomorrow. Please schedule maintenance.",
      priority: "low",
      sender: "system",
      recipients: [userId],
      read: true,
      createdAt: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 60 * 24)), // 1 day ago
    },
  ]
}

// Mock CAPA data
export const getMockCAPAs = (userId: string): CAPA[] => {
  return [
    {
      id: "mock-capa-1",
      title: "pH Deviation in Augmentin 60ml",
      description: "Investigation of pH deviation in Augmentin 60ml Batch #A2023-45",
      rootCause: "Incorrect buffer solution preparation",
      correctiveActions: ["Revise buffer preparation SOP", "Retrain laboratory staff on buffer preparation"],
      preventiveActions: ["Implement double-check system for buffer preparation", "Update quality control checklist"],
      assignedTo: [userId],
      status: "open",
      priority: "high",
      dueDate: Timestamp.fromDate(new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)), // 7 days from now
      createdBy: "system",
      createdAt: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 60 * 24)), // 1 day ago
    },
  ]
}
