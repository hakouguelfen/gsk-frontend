"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

// Mock data for HPLC equipment OOS occurrences
const mockEquipmentOOSData = [
  { equipmentId: "HPLC-001", oosCount: 13 },
  { equipmentId: "HPLC-002", oosCount: 28 },
  { equipmentId: "HPLC-003", oosCount: 15 },
  { equipmentId: "HPLC-004", oosCount: 35 },
  { equipmentId: "HPLC-005", oosCount: 27 },
];

export function EquipmentOOSHistogram() {
  // Sort data by OOS count for better visualization
  const sortedData = mockEquipmentOOSData;

  const data = {
    labels: sortedData.map((item) => item.equipmentId),
    datasets: [
      {
        label: "Nombre d'OOS",
        data: sortedData.map((item) => item.oosCount),
        backgroundColor: sortedData.map((item) => {
          // Color coding based on OOS count (red for high, yellow for medium, green for low)
          if (item.oosCount >= 30) return "rgba(239, 68, 68, 0.8)"; // Red for high
          if (item.oosCount >= 20) return "rgba(245, 158, 11, 0.8)"; // Orange for medium
          return "rgba(34, 197, 94, 0.8)"; // Green for low
        }),
        borderColor: sortedData.map((item) => {
          if (item.oosCount >= 30) return "rgba(239, 68, 68, 1)";
          if (item.oosCount >= 20) return "rgba(245, 158, 11, 1)";
          return "rgba(34, 197, 94, 1)";
        }),
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "rgba(59, 130, 246, 0.8)",
        borderWidth: 1,
        callbacks: {
          label: (context) =>
            `${context.dataset.label}: ${context.parsed.y} occurrences`,
          afterLabel: (context) => {
            const count = context.parsed.y;
            if (count >= 30) return "⚠️ Niveau critique";
            if (count >= 20) return "⚡ Niveau élevé";
            return "✅ Niveau acceptable";
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          font: {
            size: 11,
          },
          stepSize: 5,
        },
        title: {
          display: true,
          text: "Nombre d'OOS",
          font: {
            size: 12,
            weight: "bold",
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 10,
          },
          maxRotation: 45,
          minRotation: 45,
        },
        title: {
          display: true,
          text: "HPLC Equipement",
          font: {
            size: 12,
            weight: "bold",
          },
        },
      },
    },
  };

  return (
    <div className="h-96">
      <Bar data={data} options={options} />
    </div>
  );
}
