"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Bell, CheckCircle, AlertTriangle, Clock } from "lucide-react"
import { useFirebase } from "@/lib/firebase/firebase-provider"

export default function LabAnalystDashboard() {
  const { user } = useFirebase()

  useEffect(() => {
    console.log("Lab Analyst Dashboard mounted, user:", user?.email)
  }, [user])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Lab Analyst Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome to your dashboard. View recent tests, notifications, and pending tasks.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="recent-tests">Recent Tests</TabsTrigger>
          <TabsTrigger value="pending">Pending Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tests Today</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">+2 from yesterday</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4</div>
                <p className="text-xs text-muted-foreground">-2 from yesterday</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">OOS Results</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-muted-foreground">+1 from yesterday</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-1">
            <Card>
              <CardHeader>
                <CardTitle>Recent Notifications</CardTitle>
                <CardDescription>You have 3 unread notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Bell className="h-4 w-4" />
                  <AlertTitle className="flex items-center gap-2">
                    OOS Investigation Required
                    <Badge variant="destructive">Urgent</Badge>
                  </AlertTitle>
                  <AlertDescription>
                    Augmentin 60ml Batch #A2023-45 has an OOS result for pH level. Please review and initiate
                    investigation.
                  </AlertDescription>
                </Alert>
                <Alert>
                  <Bell className="h-4 w-4" />
                  <AlertTitle className="flex items-center gap-2">New CAPA Document Available</AlertTitle>
                  <AlertDescription>
                    CAPA-2023-089 has been assigned to you. Please review and implement the corrective actions.
                  </AlertDescription>
                </Alert>
                <Alert>
                  <Bell className="h-4 w-4" />
                  <AlertTitle className="flex items-center gap-2">
                    Equipment Calibration Due
                    <Badge>Reminder</Badge>
                  </AlertTitle>
                  <AlertDescription>
                    HPLC Unit #3 is due for calibration tomorrow. Please schedule maintenance.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recent-tests">
          <Card>
            <CardHeader>
              <CardTitle>Recent Test Results</CardTitle>
              <CardDescription>Test results from the past 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 rounded-md bg-gray-100 p-3">
                  <div className="font-medium">Test ID</div>
                  <div className="font-medium">Product</div>
                  <div className="font-medium">Status</div>
                </div>
                <div className="grid grid-cols-3 gap-4 rounded-md p-3 hover:bg-gray-50">
                  <div>TEST-2023-089</div>
                  <div>Augmentin 60ml</div>
                  <div>
                    <Badge className="bg-green-500">Passed</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 rounded-md p-3 hover:bg-gray-50">
                  <div>TEST-2023-088</div>
                  <div>Clamoxyl 500mg</div>
                  <div>
                    <Badge className="bg-green-500">Passed</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 rounded-md p-3 hover:bg-gray-50">
                  <div>TEST-2023-087</div>
                  <div>Augmentin 1g</div>
                  <div>
                    <Badge variant="destructive">Failed</Badge>
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
                  <div>OOS Investigation - Augmentin 1g</div>
                  <div>Today</div>
                  <div>
                    <Badge variant="destructive">High</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 rounded-md p-3 hover:bg-gray-50">
                  <div>HPLC Calibration</div>
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
