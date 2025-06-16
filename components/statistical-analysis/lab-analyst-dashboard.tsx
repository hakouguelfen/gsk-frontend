"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Activity, Gauge } from "lucide-react"
import { LineChart } from "@/components/charts/line-chart"
import { BarChart } from "@/components/charts/bar-chart"
import { ScatterChart } from "@/components/charts/scatter-chart"
import { ChartErrorBoundary } from "@/components/charts/chart-error-boundary"
import { formatNumber, safeAverage, validateNumber } from "@/lib/utils/data-validation"

interface LabAnalystStatsDashboardProps {
  data: any[]
}
interface LabAnalystMetrics {
    "avgerage retention time": any,
    "avgerage rsd": any,
    "avgerage hplc pressure": any,
    "avgerage symmetry factor": any,
}
type EquipmentPerformance = {
  equipmentId: string;
  incidents: number;
  avgAge: string;
  avgPressure: string;
  avgRSD: string;
  riskLevel: "low" | "medium" | "high";
}[];
type ControlCharts = {
  labels: string[];
  pressures: number[];
  centerLine: number[];
  ucl: number[];
  lcl: number[];
};

export const findAverageLabData = async ():Promise<LabAnalystMetrics> => {
  try {
    const response = await fetch(`http://localhost:3000/average`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const average = await response.json()
    return average;
  } catch (error) {
    throw error
  }
}

export const loadHplcPerformance = async ():Promise<EquipmentPerformance> => {
  try {
    const response = await fetch(`http://localhost:3000/lab/hplc_performance`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json()
    return data;
  } catch (error) {
    throw error
  }
}

export const loadControlCharts = async ():Promise<ControlCharts> => {
  try {
    const response = await fetch(`http://localhost:3000/lab/control_chart`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json()
    return data;
  } catch (error) {
    throw error
  }
}

export function LabAnalystStatsDashboard({ data }: LabAnalystStatsDashboardProps) {
  const [metrics, setMetrics] = useState<LabAnalystMetrics>()
  const [hplcPerformance, setHplcPerformance] = useState<EquipmentPerformance>([])
  const [controlCharts, setControlCharts] = useState<ControlCharts>({
        labels: [],
        pressures: [],
        centerLine: [],
        ucl: [],
        lcl: []
  })

  useEffect(() => {
      const fetchData = async () => {
        const averageData:LabAnalystMetrics = await findAverageLabData();
        setMetrics(averageData);
        const hplc_data:EquipmentPerformance  = await loadHplcPerformance();
        setHplcPerformance(hplc_data);
        const control_data:ControlCharts  = await loadControlCharts();
        setControlCharts(control_data);
      };
      fetchData();
  }, []);

  // Environmental impact data
  const environmentalData = useMemo(() => {
    // Create datasets for scatter plot
    return [
      {
        label: "Temperature vs. RSD",
        data: data.map((d) => ({
          x: validateNumber(d?.labTemperature),
          y: validateNumber(d?.standardsRSD),
        })),
      },
      {
        label: "Humidity vs. RSD",
        data: data.map((d) => ({
          x: validateNumber(d?.labHumidity),
          y: validateNumber(d?.standardsRSD),
        })),
      },
    ]
  }, [data])

  // Method validation data
  const methodValidationData = useMemo(() => {
    // Calculate method performance statistics
    const rsds = data.map((d) => validateNumber(d?.standardsRSD))
    const symmetries = data.map((d) => validateNumber(d?.symmetryFactor))
    const retentionTimes = data.map((d) => validateNumber(d?.avgRetentionTime))

    const avgRSD = safeAverage(rsds)
    const rsdTarget = 2.0 // Target RSD
    const rsdUpper = 3.0 // Upper limit

    // Calculate process capability
    const rsdStdDev = Math.sqrt(rsds.reduce((sum, r) => sum + Math.pow(r - avgRSD, 2), 0) / rsds.length) || 1 // Prevent NaN

    const cpk = Math.min(
      (rsdUpper - avgRSD) / (3 * rsdStdDev),
      (avgRSD - 0) / (3 * rsdStdDev), // Assuming lower limit is 0
    )

    return {
      precision: formatNumber(avgRSD, 2),
      symmetry: formatNumber(safeAverage(symmetries), 2),
      retention: formatNumber(safeAverage(retentionTimes), 2),
      cpk: formatNumber(cpk, 2),
      recovery: formatNumber(98.5, 1), // Placeholder for recovery rate
    }
  }, [data])

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Retention Time</CardTitle>
                        <Activity className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.["avgerage retention time"]} min</div>
                        <p className="text-xs text-muted-foreground">
                            {Number.parseFloat(metrics?.["avgerage retention time"]) > 10 ? "Above normal" : "Within range"}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Standards RSD</CardTitle>
                        <Gauge className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.["avgerage rsd"]}%</div>
                        <p className="text-xs text-muted-foreground">
                            {Number.parseFloat(metrics?.["avgerage rsd"]) > 2 ? "High variability" : "Good precision"}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">HPLC Pressure</CardTitle>
                        <Gauge className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.["avgerage hplc pressure"]} bar</div>
                        <p className="text-xs text-muted-foreground">System pressure average</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Peak Symmetry</CardTitle>
                        <Activity className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.["avgerage symmetry factor"]}</div>
                        <p className="text-xs text-muted-foreground">
                            {Number.parseFloat(metrics?.["avgerage symmetry factor"]) > 2 ? "Poor symmetry" : "Good peak shape"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="control-charts" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="control-charts">Control Charts</TabsTrigger>
                    <TabsTrigger value="equipment">Equipment Analysis</TabsTrigger>
                    <TabsTrigger value="environmental">Environmental Impact</TabsTrigger>
                    <TabsTrigger value="method-validation">Method Validation</TabsTrigger>
                </TabsList>

                <TabsContent value="control-charts" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>HPLC Pressure Control Chart</CardTitle>
                                <CardDescription>Statistical process control for system pressure</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ChartErrorBoundary>
                                    <LineChart
                                        labels={controlCharts.labels}
                                        datasets={[
                                            { label: "Pressure (bar)", data: controlCharts.pressures },
                                            { label: "Center Line", data: controlCharts.centerLine },
                                            { label: "UCL", data: controlCharts.ucl },
                                            { label: "LCL", data: controlCharts.lcl },
                                        ]}
                                        title="HPLC Pressure Control Chart"
                                        yAxisTitle="Pressure (bar)"
                                        height={250}
                                    />
                                </ChartErrorBoundary>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Retention Time Stability</CardTitle>
                                <CardDescription>Chromatographic method stability over time</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ChartErrorBoundary>
                                    <BarChart
                                        labels={data.slice(-15).map((d, i) => `Run ${i + 1}`)}
                                        datasets={[
                                            {
                                                label: "Retention Time (min)",
                                                data: data.slice(-15).map((d) => validateNumber(d?.avgRetentionTime)),
                                            },
                                        ]}
                                        title="Retention Time Stability"
                                        yAxisTitle="Time (min)"
                                        height={250}
                                    />
                                </ChartErrorBoundary>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="equipment" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Equipment Performance Summary</CardTitle>
                            <CardDescription>Performance metrics by equipment ID</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="h-[300px]">
                                    <ChartErrorBoundary>
                                        <BarChart
                                            labels={hplcPerformance.slice(0, 10).map((e) => e.equipmentId)}
                                            datasets={[
                                                { label: "Incidents", data: hplcPerformance.slice(0, 10).map((e) => e.incidents) },
                                                { label: "Avg RSD (%)", data: hplcPerformance.slice(0, 10).map((e) => Number(e.avgRSD)) },
                                            ]}
                                            title="Equipment Performance"
                                            yAxisTitle="Count / Value"
                                            height={300}
                                        />
                                    </ChartErrorBoundary>
                                </div>
                                <div className="space-y-3 overflow-auto max-h-[300px]">
                                    {hplcPerformance.map((equipment, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-medium">{equipment.equipmentId}</span>
                                                <Badge
                                                    variant={
                                                        equipment.riskLevel === "high"
                                                            ? "destructive"
                                                            : equipment.riskLevel === "medium"
                                                                ? "secondary"
                                                                : "outline"
                                                    }
                                                >
                                                    {equipment.riskLevel} risk
                                                </Badge>
                                            </div>
                                            <div className="text-right text-sm">
                                                <div>Age: {equipment.avgAge} months</div>
                                                <div>Incidents: {equipment.incidents}</div>
                                                <div>RSD: {equipment.avgRSD}%</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="environmental" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Environmental Conditions Impact</CardTitle>
                            <CardDescription>Temperature and humidity correlation with test results</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[400px]">
                            <ChartErrorBoundary>
                                <ScatterChart
                                    datasets={environmentalData}
                                    title="Environmental Factors vs. Method Precision"
                                    xAxisTitle="Temperature (°C) / Humidity (%)"
                                    yAxisTitle="RSD (%)"
                                    height={350}
                                />
                            </ChartErrorBoundary>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="method-validation" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Method Performance Statistics</CardTitle>
                            <CardDescription>Precision, accuracy, and robustness metrics</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="text-center p-4 bg-blue-50 rounded">
                                    <div className="text-2xl font-bold text-blue-600">{methodValidationData.precision}%</div>
                                    <div className="text-sm text-muted-foreground">Method Precision (RSD)</div>
                                </div>
                                <div className="text-center p-4 bg-green-50 rounded">
                                    <div className="text-2xl font-bold text-green-600">{methodValidationData.recovery}%</div>
                                    <div className="text-sm text-muted-foreground">Recovery Rate</div>
                                </div>
                                <div className="text-center p-4 bg-purple-50 rounded">
                                    <div className="text-2xl font-bold text-purple-600">{methodValidationData.cpk}</div>
                                    <div className="text-sm text-muted-foreground">Capability Index (Cpk)</div>
                                </div>
                            </div>
                            <div className="mt-4">
                                <ChartErrorBoundary>
                                    <BarChart
                                        labels={["Precision (RSD %)", "Peak Symmetry", "Retention Time (min)"]}
                                        datasets={[
                                            {
                                                label: "Value",
                                                data: [
                                                    Number(methodValidationData.precision),
                                                    Number(methodValidationData.symmetry),
                                                    Number(methodValidationData.retention),
                                                ],
                                            },
                                        ]}
                                        title="Method Performance Parameters"
                                        height={200}
                                    />
                                </ChartErrorBoundary>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
   )
}
