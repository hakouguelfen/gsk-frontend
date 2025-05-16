"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { Search } from "lucide-react"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { BatchDataViewer } from "@/components/batch-data-viewer"
import { PermissionGuard } from "@/components/permission-guard"

// Mock ML prediction function - in a real app, this would call a Firebase Function
const predictRootCause = async (data: any) => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Return mock prediction
  return {
    rootCause: "Incorrect buffer solution preparation leading to pH deviation in final product.",
    confidence: 0.87,
    evidence: [
      "Laboratory records showed a deviation in buffer preparation procedure",
      "Re-testing of the buffer solution confirmed lower pH than expected",
      "Test batches with correct buffer showed normal pH levels",
    ],
    similarCases: [
      "CAPA-2022-045: pH deviation in Clamoxyl 500mg",
      "CAPA-2021-078: Buffer preparation issue in Augmentin 1g",
    ],
  }
}

export default function RootCauseAnalysis() {
  return (
    <PermissionGuard permission="root-cause:read">
      <RootCauseAnalysisContent />
    </PermissionGuard>
  )
}

function RootCauseAnalysisContent() {
  const searchParams = useSearchParams()
  const [batchNumber, setBatchNumber] = useState("")
  const [searchBatch, setSearchBatch] = useState("")
  const { user } = useFirebase()
  const [product, setProduct] = useState("")
  const [issueType, setIssueType] = useState("")
  const [description, setDescription] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [showBatchData, setShowBatchData] = useState(false)

  // Get batch from URL query params if available
  useEffect(() => {
    const batchParam = searchParams?.get("batch")
    if (batchParam) {
      setBatchNumber(batchParam)
      setSearchBatch(batchParam)
    }
  }, [searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setBatchNumber(searchBatch)
  }

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to perform analysis",
        variant: "destructive",
      })
      return
    }

    if (!product || !issueType || !batchNumber || !description) {
      toast({
        title: "Analysis failed",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)
    setShowBatchData(true)

    try {
      // Prepare data for analysis
      const analysisData = {
        product,
        issueType,
        batchNumber,
        description,
        userId: user.uid,
      }

      // Call prediction function (would be a Firebase Function in a real app)
      const result = await predictRootCause(analysisData)

      // Set analysis result
      setAnalysisResult(result)

      toast({
        title: "Analysis complete",
        description: "Root cause analysis has been completed successfully.",
      })
    } catch (error) {
      console.error("Error performing root cause analysis:", error)
      toast({
        title: "Analysis failed",
        description: "An error occurred during analysis. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Root Cause Analysis</h2>
        <p className="text-muted-foreground">
          Analyze combined laboratory and production data to identify root causes of quality issues.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Batch Search</CardTitle>
          <CardDescription>Enter a batch number to analyze its data</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Enter batch number"
              value={searchBatch}
              onChange={(e) => setSearchBatch(e.target.value)}
              className="max-w-sm"
            />
            <Button type="submit">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {batchNumber && <BatchDataViewer batchNumber={batchNumber} />}
    </div>
  )
}
