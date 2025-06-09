"use client"

import { useState, useMemo } from "react"
import { formatNumber, safeAverage, validateNumber } from "@/lib/utils/data-validation"

interface ProductionAnalystDashboardProps {
  data: any[]
}

export function ProductionAnalystDashboard({ data }: ProductionAnalystDashboardProps) {
  const [selectedProduct, setSelectedProduct] = useState("all")
  const [selectedLot, setSelectedLot] = useState("all")

  // Calculate process performance metrics with validation
  const metrics = useMemo(() => {
    const activeIngredients = data.map(d => validateNumber(d?.activeIngredientQty))
    const excipients = data.map(d => validateNumber(d?.excipientQty))
    const porosities = data.map(d => validateNumber(d?.granulePorosity))
    const moistures = data.map(d => validateNumber(d?.moistureContent))

    return {
      avgActiveIngredient: formatNumber(safeAverage(activeIngredients), 1),
      avgExcipient: formatNumber(safeAverage(excipients), 1),
      avgPorosity: formatNumber(safeAverage(porosities), 1),
      avgMoisture: formatNumber(safeAverage(moistures), 2),
    }
  }, [data])

  // Particle size distribution analysis with validation
  const psdMetrics = useMemo(() => {
    const d10Values = data.map(d => validateNumber(d?.psd_D10))
    const d50Values = data.map(d => validateNumber(d?.psd_D50))
    const d90Values = data.map(d => validateNumber(d?.psd_D90))
    const spanValues = data.map(d => validateNumber(d?.psd_Span))

    return {
      avgD10: formatNumber(safeAverage(d10Values), 1),
      avgD50: formatNumber(safeAverage(d50Values), 1),
      avgD90: formatNumber(safeAverage(d90Values), 1),
      avgSpan: formatNumber(safeAverage(spanValues), 2),
    }
  }, [data])

  // Product performance by type with validation
  const productPerformance = useMemo(() => {
    const productStats = data.reduce((acc, d) => {
      const productType = d?.productType || 'Unknown'

      if (!acc[productType]) {
        acc[productType] = {
          incidents: 0,
          activeIngredients: [],
          moistures: [],
          porosities: [],
          count: 0,
        }
      }

      acc[productType].incidents += 1
      acc[productType].count += 1

      if (d?.activeIngredientQty) acc[productType].activeIngredients.push(validateNumber(d.activeIngredientQty))
      if (d?.moistureContent) acc[productType].moistures.push(validateNumber(d.moistureContent))
      if (d?.granulePorosity) acc[productType].porosities.push(validateNumber(d.granulePorosity))

      return acc
    }, {} as Record<string, {
      incidents: number,
      activeIngredients: number[],
      moistures: number[],
      porosities: number[],
      count: number
    }>)

    return Object.entries(productStats).map(([type, stats]) => ({
      productType: type,
      incidents: stats.incidents,
      avgActiveIngredient: formatNumber(safeAverage(stats.activeIngredients), 1),
      avgMoisture: formatNumber(safeAverage(stats.moistures), 2),
      avgPorosity: formatNumber(safeAverage(stats.porosities), 1),
      qualityScore: stats.incidents < 3 ? "excellent" : stats.incidents < 6 ? "good" : "needs-improvement",
    }))
  }, [data])

  // Process control data
  const processControlData = useMemo(() => {
    // Sort data by date
    const sortedData = [...data].sort((a, b) => {
      const dateA = a?.dateOccurrence instanceof Date
        ? a.dateOccurrence
        : new Date(a?.dateOccurrence || 0)

      const dateB = b?.dateOccurrence instanceof Date
        ? b.dateOccurrence
        : new Date(b?.dateOccurrence || 0)

      return dateA.getTime() - dateB.getTime()
    })

    // Get last 20 records for control chart
    const recentData = sortedData.slice(-20)

    // Calculate control limits for active ingredient
    const activeIngredients = recentData.map(d => validateNumber(d?.activeIngredientQty))
    const avgActiveIngredient = safeAverage(activeIngredients)
    const stdDevActiveIngredient = Math.sqrt(
      activeIngredients.reduce((sum, a) => sum + Math.pow(a - avgActiveIngredient, 2), 0) / activeIngredients.length
    ) || 1 // Prevent NaN

    const uclActiveIngredient = avgActiveIngredient + 3 * stdDevActiveIngredient
    const lclActiveIngredient = avgActiveIngredient - 3 * stdDevActiveIngredient

    // Calculate process capability
    const targetActiveIngredient = 500 // Target value (example)
    const upperSpec = targetActiveIngredient * 1.05 // Upper spec limit (example: +5%)
    const lowerSpec = targetActiveIngredient * 0.95 // Lower spec limit (example: -5%)

    const cp = (upperSpec - lowerSpec) / (6 * stdDevActiveIngredient)
    const cpk = Math.min(
      (upperSpec - avgActiveIngredient) / (3 * stdDevActiveIngredient),
      (avgActiveIngredient - lowerSpec) / (3 * stdDevActiveIngredient)
    )

    return {
      labels: recentData.map((d, i) => `Batch ${i + 1}`),
      activeIngredients,
      centerLine: Array(recentData.length).fill(avgActiveIngredient),
      ucl: Array(recentData.length).fill(uclActiveIngredient),
      lcl: Array(recentData.length).fill(lclActiveIngredient),
      cp: formatNumber(cp, 2),
      cpk: formatNumber(cpk, 2),
    }
  }, [data])

  // PSD analysis data
  const psdAnalysisData = useMemo(() => {
    // Get average PSD values for visualization
    const d10Values = data.map(d => validateNumber(d?.psd_D10))
    const d50Values = data.map(d => validateNumber(d?.psd_D50))
    const d90Values = data.map(d => validateNumber(d?.psd_D90))

    // Create histogram data (simplified)
    const psdDistribution = [
      { size: '0-25 µm', count: d10Values.filter(v => v < 25).length },
      { size: '25-50 µm', count: d10Values.filter(v => v >= 25 && v < 50).length +
                          d50Values.filter(v => v < 50).length },
      { size: '50-75 µm', count: d50Values.filter(v => v >= 50 && v < 75).length },
      { size: '75-100 µm', count: d50Values.filter(v => v >= 75 && v < 100).length +
                           d90Values.filter(v => v < 100).length },
      { size: '100+ µm', count: d90Values.filter(v => v >= 100).length },
    ]

    return {
      distribution: {
        labels: psdDistribution.map(d => d.size),
        data: psdDistribution.map(d => d.count),
      },
      trends: {
        labels: ['D10', 'D50', 'D90'],
        data: [
          Number(psdMetrics.avgD10),
          Number(psdMetrics.avgD50),
          Number(psdMetrics.avgD90)
        ],
      }
    }
  }, [data, psdMetrics])

  // Formulation impact analysis
  const formulationData = useMemo(() => {
    return [
      {
        label: 'Active/Excipient Ratio vs. Moisture',
        data: data.map(d => {
          const active = validateNumber(d?.activeIngredientQty)
          const excipient = validateNumber(d?.excipientQty)
          const ratio = excipient > 0 ? active / excipient : 0

          return {
            x: ratio,
            y: validateNumber(d?.moistureContent),
          }
        })
      },
      {
        label: 'Active/Excipient Ratio vs. Porosity',
        data: data.map(d => {
          const active = validateNumber(d?.activeIngredientQty)
          const excipient = validateNumber(d?.excipientQty)
          const ratio = excipient > 0 ? active / excipient : 0

          return {
            x: ratio,
            y: validateNumber(d?.granulePorosity),
          }
        })
      }
    ]
  }, [data])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      </div>
      </div>
)}
