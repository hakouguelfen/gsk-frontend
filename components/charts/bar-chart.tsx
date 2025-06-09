"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"
import { createBarChartConfig, createMultiBarChartConfig, createChartOptions } from "@/lib/utils/chart-utils"

// Register Chart.js components
Chart.register(...registerables)

interface BarChartProps {
  labels: string[]
  datasets: { label: string; data: number[] }[] | number[]
  title?: string
  yAxisTitle?: string
  height?: number
  stacked?: boolean
  className?: string
  singleDatasetLabel?: string
}

export function BarChart({
  labels,
  datasets,
  title = "",
  yAxisTitle = "",
  height = 300,
  stacked = false,
  className = "",
  singleDatasetLabel = "Value",
}: BarChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    // Create new chart
    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    let data
    if (Array.isArray(datasets) && datasets.length > 0 && typeof datasets[0] === "number") {
      // Single dataset as array of numbers
      data = createBarChartConfig(labels, datasets as number[], singleDatasetLabel)
    } else {
      // Multiple datasets
      data = createMultiBarChartConfig(labels, datasets as { label: string; data: number[] }[])
    }

    const options = createChartOptions(title, yAxisTitle, stacked)

    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data,
      options,
    })

    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [labels, datasets, title, yAxisTitle, stacked, singleDatasetLabel])

  return (
    <div className={`w-full ${className}`} style={{ height: `${height}px` }}>
      <canvas ref={chartRef} />
    </div>
  )
}
