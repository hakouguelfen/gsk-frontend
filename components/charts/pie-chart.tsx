"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"
import { createPieChartConfig } from "@/lib/utils/chart-utils"

// Register Chart.js components
Chart.register(...registerables)

interface PieChartProps {
  labels: string[]
  data: number[]
  title?: string
  height?: number
  className?: string
  doughnut?: boolean
}

export function PieChart({ labels, data, title = "", height = 300, className = "", doughnut = false }: PieChartProps) {
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

    const chartData = createPieChartConfig(labels, data, title)

    chartInstance.current = new Chart(ctx, {
      type: doughnut ? "doughnut" : "pie",
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: !!title,
            text: title,
            font: {
              size: 16,
            },
          },
        },
      },
    })

    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [labels, data, title, doughnut])

  return (
    <div className={`w-full ${className}`} style={{ height: `${height}px` }}>
      <canvas ref={chartRef} />
    </div>
  )
}
