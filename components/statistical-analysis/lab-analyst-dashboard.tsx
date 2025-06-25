"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Activity, Gauge } from "lucide-react";
import { LineChart } from "@/components/charts/line-chart";
import { BarChart } from "@/components/charts/bar-chart";
import { ScatterChart } from "@/components/charts/scatter-chart";
import { ChartErrorBoundary } from "@/components/charts/chart-error-boundary";
import {
  formatNumber,
  safeAverage,
  validateNumber,
} from "@/lib/utils/data-validation";
import { EquipmentOOSHistogram } from "./equipment-oos-histogram";

interface LabAnalystStatsDashboardProps {
  data: any[];
}
interface LabAnalystMetrics {
  "avgerage retention time": any;
  "avgerage rsd": any;
  "avgerage hplc pressure": any;
  "avgerage symmetry factor": any;
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

export const findAverageLabData = async (): Promise<LabAnalystMetrics> => {
  try {
    const response = await fetch(`http://localhost:3000/average`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const average = await response.json();
    return average;
  } catch (error) {
    throw error;
  }
};

export const loadHplcPerformance = async (): Promise<EquipmentPerformance> => {
  try {
    const response = await fetch(`http://localhost:3000/lab/hplc_performance`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

export const loadControlCharts = async (): Promise<ControlCharts> => {
  try {
    const response = await fetch(`http://localhost:3000/lab/control_chart`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

export function LabAnalystStatsDashboard({
  data,
}: LabAnalystStatsDashboardProps) {
  const [metrics, setMetrics] = useState<LabAnalystMetrics>();
  const [hplcPerformance, setHplcPerformance] = useState<EquipmentPerformance>(
    [],
  );
  const [controlCharts, setControlCharts] = useState<ControlCharts>({
    labels: [],
    pressures: [],
    centerLine: [],
    ucl: [],
    lcl: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      const averageData: LabAnalystMetrics = await findAverageLabData();
      setMetrics(averageData);
      const hplc_data: EquipmentPerformance = await loadHplcPerformance();
      setHplcPerformance(hplc_data);
      const control_data: ControlCharts = await loadControlCharts();
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
    ];
  }, [data]);

  // Method validation data
  const methodValidationData = useMemo(() => {
    // Calculate method performance statistics
    const rsds = data.map((d) => validateNumber(d?.standardsRSD));
    const symmetries = data.map((d) => validateNumber(d?.symmetryFactor));
    const retentionTimes = data.map((d) => validateNumber(d?.avgRetentionTime));

    const avgRSD = safeAverage(rsds);
    const rsdTarget = 2.0; // Target RSD
    const rsdUpper = 3.0; // Upper limit

    // Calculate process capability
    const rsdStdDev =
      Math.sqrt(
        rsds.reduce((sum, r) => sum + Math.pow(r - avgRSD, 2), 0) / rsds.length,
      ) || 1; // Prevent NaN

    const cpk = Math.min(
      (rsdUpper - avgRSD) / (3 * rsdStdDev),
      (avgRSD - 0) / (3 * rsdStdDev), // Assuming lower limit is 0
    );

    return {
      precision: formatNumber(avgRSD, 2),
      symmetry: formatNumber(safeAverage(symmetries), 2),
      retention: formatNumber(safeAverage(retentionTimes), 2),
      cpk: formatNumber(cpk, 2),
      recovery: formatNumber(98.5, 1), // Placeholder for recovery rate
    };
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Retention Time
            </CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.["avgerage retention time"]} min
            </div>
            <p className="text-xs text-muted-foreground">
              {Number.parseFloat(metrics?.["avgerage retention time"]) > 10
                ? "Above normal"
                : "Within range"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Standards RSD</CardTitle>
            <Gauge className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.["avgerage rsd"]}%
            </div>
            <p className="text-xs text-muted-foreground">
              {Number.parseFloat(metrics?.["avgerage rsd"]) > 2
                ? "High variability"
                : "Good precision"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">HPLC Pressure</CardTitle>
            <Gauge className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.["avgerage hplc pressure"]} bar
            </div>
            <p className="text-xs text-muted-foreground">
              System pressure average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Symmetry</CardTitle>
            <Activity className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.["avgerage symmetry factor"]}
            </div>
            <p className="text-xs text-muted-foreground">
              {Number.parseFloat(metrics?.["avgerage symmetry factor"]) > 2
                ? "Poor symmetry"
                : "Good peak shape"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>HPLC Pressure Control Chart</CardTitle>
            <CardDescription>
              Statistical process control for system pressure
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartErrorBoundary>
              <LineChart
                labels={controlCharts.labels}
                datasets={[
                  {
                    label: "Pressure (bar)",
                    data: controlCharts.pressures,
                  },
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
            <CardTitle className="text-lg font-semibold text-gray-800">
              HPLC Equipment by OOS Occurrences
              <span className="text-sm font-normal text-gray-500 ml-2">
                (Histogram)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EquipmentOOSHistogram />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
