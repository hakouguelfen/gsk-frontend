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

// Mock data for lead time by root cause
const mockLeadTimeData = [
  {
    rootCause: "Equipment Issue",
    avgLeadTime: 12.5,
  },
  { rootCause: "Production Issue - erreur de granulation", avgLeadTime: 6.8 },
  {
    rootCause: "Production Issue - inhomogénéité du matéria",
    avgLeadTime: 9.2,
  },
  { rootCause: "Process Issue - slow dissolution", avgLeadTime: 7.1 },
  { rootCause: "Process Issue - segregation in blends", avgLeadTime: 15.3 },
  { rootCause: "Process Issue - risk of sticking", avgLeadTime: 8.9 },
  {
    rootCause: "Lab Error - erreur de préparation",
    avgLeadTime: 11.4,
  },
  { rootCause: "Lab Issue - sample contamination", avgLeadTime: 10.2 },
  { rootCause: "Unknown", avgLeadTime: 16.2 },
];

export function LeadTimeByRootCauseChart() {
  const data = {
    labels: mockLeadTimeData.map((item) => item.rootCause),
    datasets: [
      {
        label: "Lead Time moyen (jours)",
        data: mockLeadTimeData.map((item) => item.avgLeadTime),
        backgroundColor: [
          "rgba(239, 68, 68, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(168, 85, 247, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(236, 72, 153, 0.8)",
          "rgba(20, 184, 166, 0.8)",
          "rgba(156, 163, 175, 0.8)",
        ],
        borderColor: [
          "rgba(239, 68, 68, 1)",
          "rgba(34, 197, 94, 1)",
          "rgba(59, 130, 246, 1)",
          "rgba(168, 85, 247, 1)",
          "rgba(245, 158, 11, 1)",
          "rgba(236, 72, 153, 1)",
          "rgba(20, 184, 166, 1)",
          "rgba(156, 163, 175, 1)",
        ],
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
            `${context.dataset.label}: ${context.parsed.y.toFixed(1)} jours`,
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
          callback: (value) => value + "j",
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
      },
    },
  };

  return (
    <div className="h-96">
      <Bar data={data} options={options} />
    </div>
  );
}
