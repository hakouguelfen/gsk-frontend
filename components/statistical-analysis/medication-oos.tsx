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

// Mock data for medications and their OOS occurrences
const mockMedicationOOSData = [
  { medication: "Augmentin 30 ml PPSB pour nourrissant", oosCount: 145 },
  { medication: "Augmentin 60ml PPSB pour enfant", oosCount: 388 },
  { medication: "Augmentin 500mg sachet pour enfant", oosCount: 132 },
  { medication: "Augmentin 1g sachet pour adulte", oosCount: 328 },
  { medication: "Augmentin 1g Comprimé", oosCount: 250 },
  { medication: "Clamoxyl 250 mg PPSB", oosCount: 420 },
  { medication: "Clamoxyl 500 mg PPSB", oosCount: 194 },
  { medication: "Clamoxyl 1g Comprimé", oosCount: 196 },
];
export function MedicationOOSHistogram() {
  // Sort data by OOS count for better visualization
  const sortedData = mockMedicationOOSData;

  const data = {
    labels: sortedData.map((item) => item.medication),
    datasets: [
      {
        label: "Nombre d'OOS",
        data: sortedData.map((item) => item.oosCount),
        backgroundColor: sortedData.map((item) => {
          // Color coding based on OOS count
          if (item.oosCount >= 35) return "rgba(239, 68, 68, 0.8)"; // Red for very high
          if (item.oosCount >= 25) return "rgba(245, 158, 11, 0.8)"; // Orange for high
          if (item.oosCount >= 15) return "rgba(59, 130, 246, 0.8)"; // Blue for medium
          return "rgba(34, 197, 94, 0.8)"; // Green for low
        }),
        borderColor: sortedData.map((item) => {
          if (item.oosCount >= 35) return "rgba(239, 68, 68, 1)";
          if (item.oosCount >= 25) return "rgba(245, 158, 11, 1)";
          if (item.oosCount >= 15) return "rgba(59, 130, 246, 1)";
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
            if (count >= 35) return "🔴 Très critique";
            if (count >= 25) return "🟠 Critique";
            if (count >= 15) return "🔵 Modéré";
            return "🟢 Acceptable";
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
          text: "Médicaments",
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
