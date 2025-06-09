"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"
import { createTimeSeriesConfig, createChartOptions } from "@/lib/utils/chart-utils"

// Register Chart.js components
Chart.register(...registerables)

interface LineChartProps {
  labels: string[]
  datasets: { label: string; data: number[] }[]
  title?: string
  yAxisTitle?: string
  height?: number
  className?: string
}

export function LineChart({
  labels,
  datasets,
  title = "",
  yAxisTitle = "",
  height = 300,
  className = "",
}: LineChartProps) {
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

    const data = createTimeSeriesConfig(labels, datasets, title)
    const options = createChartOptions(title, yAxisTitle)

    chartInstance.current = new Chart(ctx, {
      type: "line",
      data,
      options,
    })

    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [labels, datasets, title, yAxisTitle])

  return (
    <div className={`w-full ${className}`} style={{ height: `${height}px` }}>
      <canvas ref={chartRef} />
    </div>
  )
}
