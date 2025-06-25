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

// Mock data based on your dataset structure
const mockOOSData = [
  { month: "Jan 2024", count: 45 },
  { month: "Fév 2024", count: 52 },
  { month: "Mar 2024", count: 38 },
  { month: "Avr 2024", count: 61 },
  { month: "Mai 2024", count: 47 },
  { month: "Jun 2024", count: 55 },
  { month: "Jul 2024", count: 43 },
  { month: "Aoû 2024", count: 58 },
  { month: "Sep 2024", count: 49 },
  { month: "Oct 2024", count: 67 },
  { month: "Nov 2024", count: 52 },
  { month: "Déc 2024", count: 41 },
];

export function OOSEvolutionChart() {
  const data = {
    labels: mockOOSData.map((item) => item.month),
    datasets: [
      {
        label: "Nombre d'OOS",
        data: mockOOSData.map((item) => item.count),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "rgb(59, 130, 246)",
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
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 1,
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
        },
      },
      x: {
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
    },
  };

  return (
    <div className="h-80">
      <Line data={data} options={options} />
    </div>
  );
}
