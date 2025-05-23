"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { Search } from "lucide-react"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { BatchDataViewer } from "@/components/batch-data-viewer"
import { PermissionGuard } from "@/components/permission-guard"

export default function RootCauseAnalysis() {
  return (
    <PermissionGuard permission="root-cause:read">
      <RootCauseAnalysisContent />
    </PermissionGuard>
  )
}

function RootCauseAnalysisContent() {
  const { user } = useFirebase()
  const [searchBatch, setSearchBatch] = useState("")
  const [batchNumber, setBatchNumber] = useState("")

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setBatchNumber(searchBatch)

    if (!user) {
      return toast({
        title: "Authentication error",
        description: "You must be logged in to perform analysis",
        variant: "destructive",
      })
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
