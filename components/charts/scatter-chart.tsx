"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"
import { createScatterChartConfig, createChartOptions } from "@/lib/utils/chart-utils"

// Register Chart.js components
Chart.register(...registerables)

interface ScatterChartProps {
  datasets: { label: string; data: { x: number; y: number }[] }[]
  title?: string
  xAxisTitle?: string
  yAxisTitle?: string
  height?: number
  className?: string
}

export function ScatterChart({
  datasets,
  title = "",
  xAxisTitle = "",
  yAxisTitle = "",
  height = 300,
  className = "",
}: ScatterChartProps) {
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

    const data = createScatterChartConfig(datasets)
    const options = {
      ...createChartOptions(title, yAxisTitle),
      scales: {
        x: {
          title: {
            display: !!xAxisTitle,
            text: xAxisTitle,
          },
        },
        y: {
          title: {
            display: !!yAxisTitle,
            text: yAxisTitle,
          },
        },
      },
    }

    chartInstance.current = new Chart(ctx, {
      type: "scatter",
      data,
      options,
    })

    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [datasets, title, xAxisTitle, yAxisTitle])

  return (
    <div className={`w-full ${className}`} style={{ height: `${height}px` }}>
      <canvas ref={chartRef} />
    </div>
  )
}
