"use client";

import { useEffect, useState } from "react";
import { PermissionGuard } from "@/components/permission-guard";
import { LabAnalystStatsDashboard } from "@/components/statistical-analysis/lab-analyst-dashboard";
import { ManagerDashboard } from "@/components/statistical-analysis/manager-dashboard";
import { ProductionAnalystStatsDashboard } from "@/components/statistical-analysis/product-analyst-dashboard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data generator
const generateMockData = (count = 100) => {
  const products = ["Amoxicillin 500mg", "Clavulanate 125mg", "Augmentin 1g"];
  const rootCauses = [
    "Equipment calibration drift",
    "Environmental conditions",
    "Raw material variability",
    "Operator error",
    "Method precision",
    "Sample preparation",
  ];

  return Array.from({ length: count }, (_, i) => ({
    recordId: `REC-${String(i + 1).padStart(4, "0")}`,
    dateOccurrence: new Date(
      2024,
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28) + 1,
    ),
    timeOccurrence: `${Math.floor(Math.random() * 24)}:${Math.floor(Math.random() * 60)}`,
    investigationCloseDate: new Date(
      2024,
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28) + 1,
    ),
    leadTime: Math.floor(Math.random() * 30) + 1,
    controlledProduct: products[Math.floor(Math.random() * products.length)],
    productType: `Type-${Math.floor(Math.random() * 3) + 1}`,
    activeIngredientQty: 450 + Math.random() * 100,
    lotNumber: `LOT-${String(i + 1).padStart(6, "0")}`,
    labTest: "HPLC Assay",
    equipmentId: `HPLC-${Math.floor(Math.random() * 5) + 1}`,
    subEquipment: `Detector-${Math.floor(Math.random() * 3) + 1}`,
    oosOotType: Math.random() > 0.7 ? "OOS" : "OOT",
    equipmentAge: Math.floor(Math.random() * 60) + 1,
    labTemperature: 20 + Math.random() * 5,
    labHumidity: 40 + Math.random() * 20,
    avgRetentionTime: 8 + Math.random() * 4,
    standardsRSD: Math.random() * 3,
    hplcPressure: 150 + Math.random() * 50,
    peakSurface: 1000 + Math.random() * 500,
    symmetryFactor: 0.8 + Math.random() * 1.2,
    excipientQty: 50 + Math.random() * 20,
    granulePorosity: 10 + Math.random() * 10,
    moistureContent: 2 + Math.random() * 3,
    psd_D10: 20 + Math.random() * 10,
    psd_D50: 50 + Math.random() * 20,
    psd_D90: 100 + Math.random() * 30,
    psd_Span: 1.5 + Math.random() * 1,
    rootCause: rootCauses[Math.floor(Math.random() * rootCauses.length)],
    classification: Math.random() > 0.5 ? "Major" : "Minor",
    capaRequired: Math.random() > 0.6,
    capa: `CAPA-${String(i + 1).padStart(4, "0")}`,
  }));
};

export default function StatisticalAnalysisHub() {
  const [data, setData] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState("last-30-days");
  const [selectedProduct, setSelectedProduct] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const mockData = generateMockData();
    setData(mockData);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = data;

    if (selectedProduct !== "all") {
      filtered = filtered.filter(
        (d) => d.controlledProduct === selectedProduct,
      );
    }

    // Apply date range filter
    const now = new Date();
    const daysAgo =
      dateRange === "last-7-days"
        ? 7
        : dateRange === "last-30-days"
          ? 30
          : dateRange === "last-90-days"
            ? 90
            : 365;

    const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    filtered = filtered.filter((d) => d.dateOccurrence >= cutoffDate);
  }, [data, dateRange, selectedProduct]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading statistical analysis...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Statistical Analysis Hub
        </h2>
        <p className="text-muted-foreground">
          Comprehensive statistical analysis tailored for different roles in
          quality control
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Filters</CardTitle>
          <CardDescription>Customize your analysis parameters</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-7-days">Last 7 Days</SelectItem>
              <SelectItem value="last-30-days">Last 30 Days</SelectItem>
              <SelectItem value="last-90-days">Last 90 Days</SelectItem>
              <SelectItem value="last-year">Last Year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedProduct} onValueChange={setSelectedProduct}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select product" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              <SelectItem value="Amoxicillin 500mg">
                Amoxicillin 500mg
              </SelectItem>
              <SelectItem value="Clavulanate 125mg">
                Clavulanate 125mg
              </SelectItem>
              <SelectItem value="Augmentin 1g">Augmentin 1g</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline">Export Data</Button>
        </CardContent>
      </Card>

      {/* Role-based Analysis Tabs */}
      <Tabs defaultValue="manager" className="space-y-4">
        <TabsList>
          <TabsTrigger value="manager">Manager View</TabsTrigger>
          <TabsTrigger value="lab-analyst">Lab Analyst View</TabsTrigger>
          <TabsTrigger value="production-analyst">
            Production Analyst View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manager">
          {/* <PermissionGuard permission="statistics:read"> */}
          <ManagerDashboard data={data} dateRange={dateRange} />
          {/* </PermissionGuard> */}
        </TabsContent>

        <TabsContent value="lab-analyst">
          <PermissionGuard permission="lab-data:read">
            <LabAnalystStatsDashboard data={data} />
          </PermissionGuard>
        </TabsContent>

        <TabsContent value="production-analyst">
          <PermissionGuard permission="production-data:read">
            <ProductionAnalystStatsDashboard data={data} />
          </PermissionGuard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
