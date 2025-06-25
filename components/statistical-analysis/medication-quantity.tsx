"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

// Mock data for medications with excipients and active principles quantities
const mockMedicationQuantitiesData = [
  {
    medication: "Augmentin 30 ml PPSB pour nourrissant",
    excipients: 450,
    activeIngredients: 500,
  },
  {
    medication: "Augmentin 60ml PPSB pour enfant",
    excipients: 380,
    activeIngredients: 400,
  },
  {
    medication: "Augmentin 500mg sachet pour enfant",
    excipients: 220,
    activeIngredients: 250,
  },
  {
    medication: "Augmentin 1g sachet pour adulte",
    excipients: 350,
    activeIngredients: 100,
  },
  {
    medication: "Augmentin 1g Comprimé",
    excipients: 180,
    activeIngredients: 20,
  },
  {
    medication: "Clamoxyl 250 mg PPSB",
    excipients: 150,
    activeIngredients: 250,
  },
  {
    medication: "Clamoxyl 500 mg PPSB",
    excipients: 280,
    activeIngredients: 20,
  },
  {
    medication: "Clamoxyl 1g Comprimé",
    excipients: 200,
    activeIngredients: 50,
  },
];
export function MedicationQuantitiesLineChart() {
  const data = {
    labels: mockMedicationQuantitiesData.map((item) => item.medication),
    datasets: [
      {
        label: "Quantité Excipients (mg)",
        data: mockMedicationQuantitiesData.map((item) => item.excipients),
        borderColor: "rgba(59, 130, 246, 1)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 3,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: "rgba(59, 130, 246, 1)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: "Quantité Principes Actifs (mg)",
        data: mockMedicationQuantitiesData.map(
          (item) => item.activeIngredients,
        ),
        borderColor: "rgba(239, 68, 68, 1)",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        borderWidth: 3,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: "rgba(239, 68, 68, 1)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          font: {
            size: 12,
          },
          usePointStyle: true,
          pointStyle: "circle",
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
            `${context.dataset.label}: ${context.parsed.y} mg`,
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
          callback: (value) => value + " mg",
        },
        title: {
          display: true,
          text: "Quantité (mg)",
          font: {
            size: 12,
            weight: "bold",
          },
        },
      },
      x: {
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
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
    interaction: {
      mode: "index",
      intersect: false,
    },
  };

  return (
    <div className="h-96">
      <Line data={data} options={options} />
    </div>
  );
}
