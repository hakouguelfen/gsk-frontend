"use client"

import { LabAnalystStatsDashboard } from "@/components/statistical-analysis/lab-analyst-dashboard"

export default function LabAnalystDashboard() {

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Lab Analyst Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome to your dashboard. View recent tests, notifications, and pending tasks.
        </p>
      </div>

      <LabAnalystStatsDashboard data={[]} />
    </div>
  )
}
