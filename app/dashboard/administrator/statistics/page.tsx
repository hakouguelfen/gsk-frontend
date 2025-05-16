"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { BarChart, LineChart, Download, FileText } from "lucide-react"
import { useFirebase } from "@/lib/firebase/firebase-provider"

// Mock statistics data - in a real app, this would come from Firestore
const fetchStatistics = async () => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Return mock statistics
  return {
    qualityMetrics: {
      firstTimeRight: [95.3, 94.8, 96.2, 95.7, 96.5, 97.1],
      oosRate: [2.1, 2.3, 1.9, 1.8, 1.7, 1.5],
      ootRate: [3.5, 3.8, 3.2, 3.0, 2.8, 2.5],
      investigationTime: [4.2, 4.5, 4.0, 3.8, 3.5, 3.2],
      qualityScore: [93, 92, 94, 95, 96, 97],
    },
    productMetrics: {
      "augmentin-60ml": {
        firstTimeRight: 95.3,
        oosRate: 2.1,
        ootRate: 3.5,
        investigationTime: 4.2,
        qualityScore: 93,
      },
      "augmentin-1g": {
        firstTimeRight: 96.7,
        oosRate: 1.8,
        ootRate: 2.9,
        investigationTime: 3.5,
        qualityScore: 94,
      },
      "augmentin-500mg": {
        firstTimeRight: 94.2,
        oosRate: 2.5,
        ootRate: 4.1,
        investigationTime: 4.8,
        qualityScore: 91,
      },
      "clamoxyl-500mg": {
        firstTimeRight: 92.8,
        oosRate: 3.2,
        ootRate: 4.8,
        investigationTime: 5.3,
        qualityScore: 89,
      },
      "clamoxyl-250mg": {
        firstTimeRight: 95.1,
        oosRate: 1.9,
        ootRate: 3.2,
        investigationTime: 3.8,
        qualityScore: 93,
      },
    },
  }
}

export default function Statistics() {
  const { user } = useFirebase()
  const [dateRange, setDateRange] = useState("last-30-days")
  const [productFilter, setProductFilter] = useState("all")
  const [statistics, setStatistics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadStatistics()
    }
  }, [user, dateRange, productFilter])

  const loadStatistics = async () => {
    setIsLoading(true)
    try {
      const stats = await fetchStatistics()
      setStatistics(stats)
    } catch (error) {
      console.error("Error loading statistics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadReport = (reportName: string) => {
    // In a real app, this would generate a downloadable report
    console.log(`Downloading report: ${reportName}`)

    // Mock download functionality
    const link = document.createElement("a")
    link.href = "#"
    link.download = `${reportName}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Statistical Data</h2>
        <p className="text-muted-foreground">View and analyze quality control statistics and reports.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date-range">Date Range</Label>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger id="date-range">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-7-days">Last 7 Days</SelectItem>
              <SelectItem value="last-30-days">Last 30 Days</SelectItem>
              <SelectItem value="last-90-days">Last 90 Days</SelectItem>
              <SelectItem value="last-year">Last Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="product-filter">Product Filter</Label>
          <Select value={productFilter} onValueChange={setProductFilter}>
            <SelectTrigger id="product-filter">
              <SelectValue placeholder="Select product" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              <SelectItem value="augmentin-60ml">Augmentin 60ml</SelectItem>
              <SelectItem value="augmentin-1g">Augmentin 1g</SelectItem>
              <SelectItem value="augmentin-500mg">Augmentin 500mg</SelectItem>
              <SelectItem value="clamoxyl-500mg">Clamoxyl 500mg</SelectItem>
              <SelectItem value="clamoxyl-250mg">Clamoxyl 250mg</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="quality-metrics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="quality-metrics">Quality Metrics</TabsTrigger>
          <TabsTrigger value="oos-analysis">OOS Analysis</TabsTrigger>
          <TabsTrigger value="capa-effectiveness">CAPA Effectiveness</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="quality-metrics" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-40 bg-gray-50 rounded-md">
              <p className="text-muted-foreground">Loading quality metrics...</p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>First-Time Right Trend</CardTitle>
                    <CardDescription>Monthly first-time right percentage trend</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-md">
                      <LineChart className="h-8 w-8 text-primary-500" />
                      <span className="ml-2 text-sm text-muted-foreground">First-Time Right Trend Chart</span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Quality Score by Product</CardTitle>
                    <CardDescription>Quality score comparison across products</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-md">
                      <BarChart className="h-8 w-8 text-primary-500" />
                      <span className="ml-2 text-sm text-muted-foreground">Quality Score Chart</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Detailed Quality Metrics</CardTitle>
                  <CardDescription>Detailed quality metrics for all products</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-6 gap-4 rounded-md bg-gray-100 p-3">
                      <div className="font-medium">Product</div>
                      <div className="font-medium">First-Time Right</div>
                      <div className="font-medium">OOS Rate</div>
                      <div className="font-medium">OOT Rate</div>
                      <div className="font-medium">Avg. Investigation Time</div>
                      <div className="font-medium">Quality Score</div>
                    </div>
                    {statistics &&
                      Object.entries(statistics.productMetrics).map(([product, metrics]: [string, any]) => (
                        <div key={product} className="grid grid-cols-6 gap-4 rounded-md p-3 hover:bg-gray-50">
                          <div>
                            {product
                              .split("-")
                              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                              .join(" ")}
                          </div>
                          <div>{metrics.firstTimeRight}%</div>
                          <div>{metrics.oosRate}%</div>
                          <div>{metrics.ootRate}%</div>
                          <div>{metrics.investigationTime} days</div>
                          <div>{metrics.qualityScore}%</div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="oos-analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>OOS Analysis</CardTitle>
              <CardDescription>Analysis of Out of Specification results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-40 bg-gray-50 rounded-md">
                <p className="text-muted-foreground">OOS analysis charts and data will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="capa-effectiveness" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CAPA Effectiveness</CardTitle>
              <CardDescription>Analysis of CAPA effectiveness</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-40 bg-gray-50 rounded-md">
                <p className="text-muted-foreground">CAPA effectiveness charts and data will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Reports</CardTitle>
              <CardDescription>Download quality reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-md border p-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary-500" />
                    <div>
                      <p className="font-medium">Monthly Quality Report - May 2025</p>
                      <p className="text-sm text-muted-foreground">Comprehensive quality metrics for May 2025</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadReport("Monthly-Quality-Report-May-2025")}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>

                <div className="flex items-center justify-between rounded-md border p-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary-500" />
                    <div>
                      <p className="font-medium">OOS Investigation Summary - Q2 2025</p>
                      <p className="text-sm text-muted-foreground">Summary of OOS investigations for Q2 2025</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadReport("OOS-Investigation-Summary-Q2-2025")}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>

                <div className="flex items-center justify-between rounded-md border p-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary-500" />
                    <div>
                      <p className="font-medium">CAPA Effectiveness Report - Q2 2025</p>
                      <p className="text-sm text-muted-foreground">Analysis of CAPA effectiveness for Q2 2025</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadReport("CAPA-Effectiveness-Report-Q2-2025")}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
