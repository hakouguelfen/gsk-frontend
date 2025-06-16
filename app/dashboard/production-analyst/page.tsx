"use client"

import { ProductionAnalystStatsDashboard } from "@/components/statistical-analysis/product-analyst-dashboard"

export default function ProductionAnalystDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Production Analyst Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome to your dashboard. View production data, notifications, and pending tasks.
        </p>
      </div>

      <ProductionAnalystStatsDashboard data={[]} />
    </div>
  )
}
