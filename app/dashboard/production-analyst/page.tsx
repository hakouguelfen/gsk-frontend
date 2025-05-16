"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Bell, CheckCircle, AlertTriangle, Clock } from "lucide-react"
import { useFirebase } from "@/lib/firebase/firebase-provider"

export default function ProductionAnalystDashboard() {
  const { user } = useFirebase()

  useEffect(() => {
    console.log("Production Analyst Dashboard mounted, user:", user?.email)
  }, [user])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Production Analyst Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome to your dashboard. View production data, notifications, and pending tasks.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="recent-batches">Recent Batches</TabsTrigger>
          <TabsTrigger value="pending">Pending Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Batches Today</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">+1 from yesterday</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">-1 from yesterday</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Process Deviations</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1</div>
                <p className="text-xs text-muted-foreground">Same as yesterday</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-1">
            <Card>
              <CardHeader>
                <CardTitle>Recent Notifications</CardTitle>
                <CardDescription>You have 2 unread notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Bell className="h-4 w-4" />
                  <AlertTitle className="flex items-center gap-2">
                    Process Deviation Alert
                    <Badge variant="destructive">Urgent</Badge>
                  </AlertTitle>
                  <AlertDescription>
                    Augmentin 60ml Batch #A2023-52 has a process deviation for mixing time. Please review and initiate
                    investigation.
                  </AlertDescription>
                </Alert>
                <Alert>
                  <Bell className="h-4 w-4" />
                  <AlertTitle className="flex items-center gap-2">New CAPA Document Available</AlertTitle>
                  <AlertDescription>
                    CAPA-2023-091 has been assigned to you. Please review and implement the corrective actions.
                  </AlertDescription>
                </Alert>
                <Alert>
                  <Bell className="h-4 w-4" />
                  <AlertTitle className="flex items-center gap-2">
                    Equipment Maintenance Due
                    <Badge>Reminder</Badge>
                  </AlertTitle>
                  <AlertDescription>
                    Mixer Unit #2 is due for maintenance tomorrow. Please schedule with engineering team.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recent-batches">
          <Card>
            <CardHeader>
              <CardTitle>Recent Production Batches</CardTitle>
              <CardDescription>Production batches from the past 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4 rounded-md bg-gray-100 p-3">
                  <div className="font-medium">Batch ID</div>
                  <div className="font-medium">Product</div>
                  <div className="font-medium">Production Date</div>
                  <div className="font-medium">Status</div>
                </div>
                <div className="grid grid-cols-4 gap-4 rounded-md p-3 hover:bg-gray-50">
                  <div>A2023-52</div>
                  <div>Augmentin 60ml</div>
                  <div>May 9, 2025</div>
                  <div>
                    <Badge className="bg-green-500">Completed</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 rounded-md p-3 hover:bg-gray-50">
                  <div>A2023-51</div>
                  <div>Clamoxyl 500mg</div>
                  <div>May 8, 2025</div>
                  <div>
                    <Badge className="bg-green-500">Completed</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 rounded-md p-3 hover:bg-gray-50">
                  <div>A2023-50</div>
                  <div>Augmentin 1g</div>
                  <div>May 7, 2025</div>
                  <div>
                    <Badge variant="destructive">Deviation</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Tasks</CardTitle>
              <CardDescription>Tasks that require your attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 rounded-md bg-gray-100 p-3">
                  <div className="font-medium">Task</div>
                  <div className="font-medium">Due Date</div>
                  <div className="font-medium">Priority</div>
                </div>
                <div className="grid grid-cols-3 gap-4 rounded-md p-3 hover:bg-gray-50">
                  <div>Process Deviation Investigation - Augmentin 1g</div>
                  <div>Today</div>
                  <div>
                    <Badge variant="destructive">High</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 rounded-md p-3 hover:bg-gray-50">
                  <div>Equipment Maintenance Schedule</div>
                  <div>Tomorrow</div>
                  <div>
                    <Badge>Medium</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
