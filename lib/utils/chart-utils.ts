import type { ChartData, ChartOptions } from "chart.js"
import { formatNumber, validateNumber } from "./data-validation"

/**
 * Generates a color palette for charts
 * @param count Number of colors needed
 * @returns Array of color strings
 */
export function generateColorPalette(count: number): string[] {
  const baseColors = [
    "rgba(75, 192, 192, 0.7)", // teal
    "rgba(54, 162, 235, 0.7)", // blue
    "rgba(153, 102, 255, 0.7)", // purple
    "rgba(255, 159, 64, 0.7)", // orange
    "rgba(255, 99, 132, 0.7)", // red
    "rgba(255, 206, 86, 0.7)", // yellow
    "rgba(201, 203, 207, 0.7)", // gray
    "rgba(100, 255, 132, 0.7)", // green
  ]

  // If we need more colors than in our base palette, generate them
  if (count <= baseColors.length) {
    return baseColors.slice(0, count)
  }

  // Generate additional colors
  const colors = [...baseColors]
  for (let i = baseColors.length; i < count; i++) {
    const r = Math.floor(Math.random() * 255)
    const g = Math.floor(Math.random() * 255)
    const b = Math.floor(Math.random() * 255)
    colors.push(`rgba(${r}, ${g}, ${b}, 0.7)`)
  }

  return colors
}

/**
 * Creates a time series chart configuration
 * @param labels Time labels for x-axis
 * @param datasets Data series to display
 * @param title Chart title
 * @returns Chart configuration
 */
export function createTimeSeriesConfig(
  labels: string[],
  datasets: { label: string; data: number[] }[],
  title: string,
): ChartData {
  const colors = generateColorPalette(datasets.length)

  return {
    labels,
    datasets: datasets.map((dataset, index) => ({
      label: dataset.label,
      data: dataset.data.map((value) => validateNumber(value)),
      backgroundColor: colors[index % colors.length],
      borderColor: colors[index % colors.length].replace("0.7", "1"),
      borderWidth: 1,
      tension: 0.4,
    })),
  }
}

/**
 * Creates standard chart options with customizations
 * @param title Chart title
 * @param yAxisTitle Y-axis title
 * @param stacked Whether the chart should be stacked
 * @returns Chart options
 */
export function createChartOptions(title: string, yAxisTitle = "", stacked = false): ChartOptions {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${formatNumber(context.raw)}`,
        },
      },
      legend: {
        position: "top",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        stacked,
        title: {
          display: !!yAxisTitle,
          text: yAxisTitle,
        },
      },
      x: {
        stacked,
      },
    },
  }
}

/**
 * Creates a bar chart configuration
 * @param labels Category labels
 * @param data Data values
 * @param label Dataset label
 * @returns Chart configuration
 */
export function createBarChartConfig(labels: string[], data: number[], label: string): ChartData {
  return {
    labels,
    datasets: [
      {
        label,
        data: data.map((value) => validateNumber(value)),
        backgroundColor: generateColorPalette(data.length),
        borderWidth: 1,
      },
    ],
  }
}

/**
 * Creates a multi-series bar chart configuration
 * @param labels Category labels
 * @param datasets Multiple data series
 * @returns Chart configuration
 */
export function createMultiBarChartConfig(labels: string[], datasets: { label: string; data: number[] }[]): ChartData {
  const colors = generateColorPalette(datasets.length)

  return {
    labels,
    datasets: datasets.map((dataset, index) => ({
      label: dataset.label,
      data: dataset.data.map((value) => validateNumber(value)),
      backgroundColor: colors[index % colors.length],
      borderWidth: 1,
    })),
  }
}

/**
 * Creates a pie chart configuration
 * @param labels Segment labels
 * @param data Data values
 * @param title Chart title
 * @returns Chart configuration
 */
export function createPieChartConfig(labels: string[], data: number[], title: string): ChartData {
  return {
    labels,
    datasets: [
      {
        label: title,
        data: data.map((value) => validateNumber(value)),
        backgroundColor: generateColorPalette(data.length),
        borderWidth: 1,
      },
    ],
  }
}

/**
 * Creates a scatter plot configuration
 * @param datasets Data points with x,y coordinates
 * @returns Chart configuration
 */
export function createScatterChartConfig(datasets: { label: string; data: { x: number; y: number }[] }[]): ChartData {
  const colors = generateColorPalette(datasets.length)

  return {
    datasets: datasets.map((dataset, index) => ({
      label: dataset.label,
      data: dataset.data.map((point) => ({
        x: validateNumber(point.x),
        y: validateNumber(point.y),
      })),
      backgroundColor: colors[index % colors.length],
      borderColor: colors[index % colors.length].replace("0.7", "1"),
      borderWidth: 1,
      pointRadius: 5,
      pointHoverRadius: 7,
    })),
  }
}
