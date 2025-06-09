"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, AlertTriangle, CheckCircle, BarChart3 } from "lucide-react"
import { LineChart } from "@/components/charts/line-chart"
import { BarChart } from "@/components/charts/bar-chart"
import { PieChart } from "@/components/charts/pie-chart"
import { ScatterChart } from "@/components/charts/scatter-chart"
import { ChartErrorBoundary } from "@/components/charts/chart-error-boundary"
import { formatNumber, safeAverage, validateNumber } from "@/lib/utils/data-validation"

interface ManagerDashboardProps {
  data: any[]
  dateRange: string
}

interface QualityTrends {
  labels: any[],
  oos_rates: any[],
  lead_times: any[],
}
interface RootCauseInterface {
  "Process Issue - slow dissolution": string,
  "Unknown": string,
  "Production Issue - inhomogénéité du matériau due à un mélange insuffisant": string,
  "Lab Issue - sample contamination": string,
  "Process Issue - segregation in blends": string,
  "Lab Error - erreur de préparation de standard due à une dilution incorrecte": string,
  "Equipment Issue - dysfonctionnement de l'HPLC dû à une pompe défectueuse": string,
  "Process Issue - risk of sticking": string,
  "Production Issue - erreur de granulation": string,
}


export const loadQualityTrends = async ():Promise<QualityTrends> => {
  try {
    const response = await fetch(`http://localhost:3000/quality_trends`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const trends = await response.json()
    return trends;
  } catch (error) {
    throw error
  }
}

export const loadRootCause = async ():Promise<any> => {
  try {
    const response = await fetch(`http://localhost:3000/root_cause`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const rootcause = await response.json()
    return rootcause;
  } catch (error) {
    throw error
  }
}

export function ManagerDashboard({ data, dateRange }: ManagerDashboardProps) {
  const [selectedMetric, setSelectedMetric] = useState("oos-rate")
  const [selectedProduct, setSelectedProduct] = useState("all")
  const [qualityTrends, setQualityTrends] = useState<QualityTrends>()
  const [rootCause, setRootCause] = useState<{}>()

  useEffect(() => {
      const fetchData = async () => {
        const trends = await loadQualityTrends();
        setQualityTrends(trends);

        const rootcause = await loadRootCause();
        setRootCause(rootcause);
        console.log(rootcause.items((cause:string, _:any) => cause));
      };
      fetchData();
  }, []);

  // Calculate KPIs with validation
  const kpis = useMemo(() => {
    const totalRecords = data.length || 1 // Prevent division by zero
    const oosRecords = data.filter((d) => d?.oosOotType?.includes("OOS")).length
    const capaRequired = data.filter((d) => d?.capaRequired).length

    // Use safe average calculation
    const leadTimes = data.map((d) => validateNumber(d?.leadTime))
    const avgLeadTime = safeAverage(leadTimes)

    return {
      oosRate: formatNumber((oosRecords / totalRecords) * 100, 1),
      capaRate: formatNumber((capaRequired / totalRecords) * 100, 1),
      avgLeadTime: formatNumber(avgLeadTime, 1),
      totalIncidents: totalRecords,
    }
  }, [data])

  // Product performance comparison
  const productPerformance = useMemo(() => {
    const productStats = data.reduce(
      (acc, d) => {
        const product = d?.controlledProduct || "Unknown"

        if (!acc[product]) {
          acc[product] = {
            total: 0,
            oos: 0,
            capaRequired: 0,
            leadTimes: [],
          }
        }

        acc[product].total += 1
        if (d?.oosOotType?.includes("OOS")) acc[product].oos += 1
        if (d?.capaRequired) acc[product].capaRequired += 1
        if (d?.leadTime) acc[product].leadTimes.push(validateNumber(d.leadTime))

        return acc
      },
      {} as Record<string, { total: number; oos: number; capaRequired: number; leadTimes: number[] }>,
    )

    const products = Object.keys(productStats)

    return {
      labels: products,
      oosRates: products.map((product) => {
        const { total, oos } = productStats[product]
        return (oos / total) * 100
      }),
      capaRates: products.map((product) => {
        const { total, capaRequired } = productStats[product]
        return (capaRequired / total) * 100
      }),
      leadTimes: products.map((product) => {
        return safeAverage(productStats[product].leadTimes)
      }),
      incidentCounts: products.map((product) => productStats[product].total),
    }
  }, [data])

  // Equipment risk assessment
  const equipmentRiskData = useMemo(() => {
    const equipmentData = data.reduce(
      (acc, d) => {
        const equipmentId = d?.equipmentId || "Unknown"

        if (!acc[equipmentId]) {
          acc[equipmentId] = {
            incidents: 0,
            ages: [],
          }
        }

        acc[equipmentId].incidents += 1
        if (d?.equipmentAge) acc[equipmentId].ages.push(validateNumber(d.equipmentAge))

        return acc
      },
      {} as Record<string, { incidents: number; ages: number[] }>,
    )

    return Object.entries(equipmentData).map(([id, stats]) => ({
      label: id,
      data: [
        {
          x: safeAverage(stats.ages),
          y: stats.incidents,
        },
      ],
    }))
  }, [data])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* KPI Cards */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">OOS Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{kpis.oosRate}%</div>
            <p className="text-xs text-muted-foreground">
              {Number.parseFloat(kpis.oosRate) > 5 ? "Above target" : "Within target"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CAPA Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{kpis.capaRate}%</div>
            <p className="text-xs text-muted-foreground">Requiring corrective action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Lead Time</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{kpis.avgLeadTime} days</div>
            <p className="text-xs text-muted-foreground">Investigation closure time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.totalIncidents}</div>
            <p className="text-xs text-muted-foreground">In selected period</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Quality Trends</TabsTrigger>
          <TabsTrigger value="pareto">Root Cause Analysis</TabsTrigger>
          <TabsTrigger value="performance">Product Performance</TabsTrigger>
          <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quality Performance Trends</CardTitle>
              <CardDescription>Monthly OOS/OOT rates and investigation lead times</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
                { qualityTrends && (
              <ChartErrorBoundary>
                  <LineChart
                    labels={qualityTrends.labels}
                    datasets={[
                      { label: "OOS Rate (%)", data: qualityTrends.oos_rates },
                      { label: "Avg Lead Time (days)", data: qualityTrends.lead_times },
                    ]}
                    title="Monthly Quality Metrics"
                    yAxisTitle="Value"
                    height={350}
                  />
              </ChartErrorBoundary>
                ) }
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pareto" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Root Causes (Pareto Analysis)</CardTitle>
              <CardDescription>Most frequent root causes requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="h-[300px]">
                  {rootCause && (
                    <ChartErrorBoundary>
                      <PieChart
                        labels={Object.entries(rootCause).map(([cause, _]) => cause)}
                        data={Object.entries(rootCause).map(([_, count]) => Number(count))}
                        title="Root Cause Distribution"
                        height={300}
                        doughnut={true}
                      />
                    </ChartErrorBoundary>
                  )}
                </div>
                <div className="space-y-3">
                  {rootCause && Object.entries(rootCause).map(([cause, countStr], index) => {
                    const count = Number(countStr);
                    const total = Object.values(rootCause).reduce((sum, val) => sum + Number(val), 0);
                    const percentage = total === 0 ? 0 : ((count / total) * 100).toFixed(1);

                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{index + 1}</Badge>
                          <span className="text-sm font-medium">{cause}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold">{count} cases</div>
                          <div className="text-xs text-muted-foreground">{percentage}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Performance Comparison</CardTitle>
              <CardDescription>Quality metrics by product type</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ChartErrorBoundary>
                <BarChart
                  labels={productPerformance.labels}
                  datasets={[
                    { label: "OOS Rate (%)", data: productPerformance.oosRates },
                    { label: "CAPA Rate (%)", data: productPerformance.capaRates },
                    { label: "Incidents", data: productPerformance.incidentCounts },
                  ]}
                  title="Product Quality Metrics"
                  yAxisTitle="Value"
                  height={350}
                />
              </ChartErrorBoundary>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Equipment Risk Assessment</CardTitle>
              <CardDescription>Equipment age vs. failure rate correlation</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ChartErrorBoundary>
                <ScatterChart
                  datasets={equipmentRiskData}
                  title="Equipment Age vs. Incident Count"
                  xAxisTitle="Equipment Age (months)"
                  yAxisTitle="Number of Incidents"
                  height={350}
                />
              </ChartErrorBoundary>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
