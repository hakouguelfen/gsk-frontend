"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertTriangle, FileText, Beaker, ClipboardCheck, RefreshCw } from "lucide-react"
import { getCombinedBatchData } from "@/lib/firebase/firestore"

interface BatchDataViewerProps {
  batchNumber: string
}

export function BatchDataViewer({ batchNumber }: BatchDataViewerProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const batchData = await getCombinedBatchData(batchNumber)
      setData(batchData)
    } catch (err) {
      console.error("Error fetching batch data:", err)
      setError("Failed to load batch data. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (batchNumber) {
      fetchData()
    }
  }, [batchNumber])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <AlertTriangle className="h-10 w-10 text-orange-500 mb-4" />
            <h3 className="text-lg font-medium">Error Loading Batch Data</h3>
            <p className="text-muted-foreground mt-2">{error}</p>
            <Button onClick={fetchData} variant="outline" className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || (!data.labData.length && !data.productionData.length)) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <FileText className="h-10 w-10 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium">No Data Available</h3>
            <p className="text-muted-foreground mt-2">
              No laboratory or production data found for batch {batchNumber}.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Batch Data: {batchNumber}</CardTitle>
        <CardDescription>Combined laboratory and production data for analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="combined" className="space-y-4">
          <TabsList>
            <TabsTrigger value="combined">Combined View</TabsTrigger>
            <TabsTrigger value="lab">Laboratory Data ({data.labData.length})</TabsTrigger>
            <TabsTrigger value="production">Production Data ({data.productionData.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="combined" className="space-y-4">
            {data.labData.length === 0 || data.productionData.length === 0 ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Incomplete Data</AlertTitle>
                <AlertDescription>
                  {data.labData.length === 0
                    ? "Laboratory data is missing for this batch."
                    : "Production data is missing for this batch."}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center">
                        <Beaker className="h-4 w-4 mr-2 text-blue-500" />
                        <CardTitle className="text-sm">Latest Lab Results</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm font-medium">Product:</div>
                          <div className="text-sm">{data.labData[0]?.productName}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm font-medium">Test Type:</div>
                          <div className="text-sm">{data.labData[0]?.testType}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm font-medium">Test Date:</div>
                          <div className="text-sm">{data.labData[0]?.testDate}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm font-medium">Amoxicillin:</div>
                          <div className="text-sm">{data.labData[0]?.testResults?.amoxicillin || "N/A"}%</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm font-medium">Clavulanic Acid:</div>
                          <div className="text-sm">{data.labData[0]?.testResults?.clavulanicAcid || "N/A"}%</div>
                        </div>
                        {data.labData[0]?.testResults?.impurities !== undefined && (
                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-sm font-medium">Impurities:</div>
                            <div className="text-sm">{data.labData[0]?.testResults.impurities}%</div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center">
                        <ClipboardCheck className="h-4 w-4 mr-2 text-green-500" />
                        <CardTitle className="text-sm">Latest Production Data</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm font-medium">Product:</div>
                          <div className="text-sm">{data.productionData[0]?.productName}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm font-medium">Process Step:</div>
                          <div className="text-sm">{data.productionData[0]?.processStep}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm font-medium">Process Date:</div>
                          <div className="text-sm">{data.productionData[0]?.processDate}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm font-medium">Mixing Time:</div>
                          <div className="text-sm">
                            {data.productionData[0]?.processParameters?.mixingTime || "N/A"} min
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm font-medium">Temperature:</div>
                          <div className="text-sm">
                            {data.productionData[0]?.processParameters?.temperature || "N/A"}°C
                          </div>
                        </div>
                        {data.productionData[0]?.processParameters?.pressure && (
                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-sm font-medium">Pressure:</div>
                            <div className="text-sm">{data.productionData[0]?.processParameters.pressure} bar</div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Analysis</CardTitle>
                    <CardDescription>Potential quality issues based on combined data</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {/* This would be where AI analysis would go in a real system */}
                      <p className="text-sm">
                        Based on the combined laboratory and production data, the following potential issues have been
                        identified:
                      </p>
                      <ul className="list-disc pl-5 text-sm space-y-1">
                        {data.labData[0]?.testResults?.impurities > 0.5 && (
                          <li className="text-red-600">
                            High impurity level ({data.labData[0]?.testResults.impurities}%) exceeds the acceptable
                            limit of 0.5%
                          </li>
                        )}
                        {data.productionData[0]?.processParameters?.temperature > 30 && (
                          <li className="text-orange-600">
                            Processing temperature ({data.productionData[0]?.processParameters.temperature}°C) is above
                            the recommended range
                          </li>
                        )}
                        {data.labData[0]?.testResults?.clavulanicAcid < 95 && (
                          <li className="text-red-600">
                            Clavulanic acid content ({data.labData[0]?.testResults.clavulanicAcid}%) is below the
                            acceptable limit of 95%
                          </li>
                        )}
                        {!data.labData[0]?.testResults?.impurities > 0.5 &&
                          !data.productionData[0]?.processParameters?.temperature > 30 &&
                          !data.labData[0]?.testResults?.clavulanicAcid < 95 && (
                            <li className="text-green-600">
                              No significant issues detected. All parameters are within acceptable ranges.
                            </li>
                          )}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="lab" className="space-y-4">
            {data.labData.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <Beaker className="h-10 w-10 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium">No Laboratory Data</h3>
                <p className="text-muted-foreground mt-2">No laboratory data found for batch {batchNumber}.</p>
              </div>
            ) : (
              data.labData.map((labData: any, index: number) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Beaker className="h-4 w-4 mr-2 text-blue-500" />
                        <CardTitle className="text-sm">Lab Test: {labData.testType}</CardTitle>
                      </div>
                      <div className="text-xs text-muted-foreground">{labData.testDate}</div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm font-medium">Product:</div>
                        <div className="text-sm">{labData.productName}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm font-medium">Test Results:</div>
                        <div className="text-sm">
                          Amoxicillin: {labData.testResults?.amoxicillin || "N/A"}%, Clavulanic Acid:{" "}
                          {labData.testResults?.clavulanicAcid || "N/A"}%
                          {labData.testResults?.impurities !== undefined && (
                            <>, Impurities: {labData.testResults.impurities}%</>
                          )}
                        </div>
                      </div>
                      {labData.notes && (
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm font-medium">Notes:</div>
                          <div className="text-sm">{labData.notes}</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="production" className="space-y-4">
            {data.productionData.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <ClipboardCheck className="h-10 w-10 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium">No Production Data</h3>
                <p className="text-muted-foreground mt-2">No production data found for batch {batchNumber}.</p>
              </div>
            ) : (
              data.productionData.map((productionData: any, index: number) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <ClipboardCheck className="h-4 w-4 mr-2 text-green-500" />
                        <CardTitle className="text-sm">Process: {productionData.processStep}</CardTitle>
                      </div>
                      <div className="text-xs text-muted-foreground">{productionData.processDate}</div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm font-medium">Product:</div>
                        <div className="text-sm">{productionData.productName}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm font-medium">Process Parameters:</div>
                        <div className="text-sm">
                          Mixing Time: {productionData.processParameters?.mixingTime || "N/A"} min, Temperature:{" "}
                          {productionData.processParameters?.temperature || "N/A"}°C
                          {productionData.processParameters?.pressure && (
                            <>, Pressure: {productionData.processParameters.pressure} bar</>
                          )}
                        </div>
                      </div>
                      {productionData.notes && (
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm font-medium">Notes:</div>
                          <div className="text-sm">{productionData.notes}</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
