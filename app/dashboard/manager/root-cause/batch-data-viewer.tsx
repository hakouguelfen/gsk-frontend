"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2, FileText } from "lucide-react"

interface BatchDataViewerProps {
  batchNumber: string,
  loading: boolean,
  analyzing: boolean,
  product: string,
}

export function BatchDataViewer({ batchNumber, loading, analyzing, product }: BatchDataViewerProps) {
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

  if (analyzing){
    return (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Batch Found: {batchNumber}</p>
              <p className="text-sm text-muted-foreground">
                Product Name: {product}
              </p>
            </div>
          <div className="flex items-center gap-2 text-blue-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">AI Analyzing...</span>
          </div>
          </div>
        </div>
    )
  }

  if (!product.length) {
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

  return <div></div>
}
