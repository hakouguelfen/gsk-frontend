"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ChartErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ChartErrorBoundary({ children, fallback }: ChartErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const errorHandler = (error: ErrorEvent) => {
      console.error("Chart error caught:", error)
      setHasError(true)
    }

    window.addEventListener("error", errorHandler)

    return () => {
      window.removeEventListener("error", errorHandler)
    }
  }, [])

  if (hasError) {
    return (
      fallback || (
        <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-md h-full min-h-[200px]">
          <AlertCircle className="h-10 w-10 text-amber-500 mb-2" />
          <h3 className="text-lg font-medium mb-2">Chart could not be displayed</h3>
          <p className="text-sm text-muted-foreground mb-4">There was an error rendering this visualization</p>
          <Button variant="outline" onClick={() => setHasError(false)} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </Button>
        </div>
      )
    )
  }

  return <>{children}</>
}
