import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Bell, CheckCircle, AlertTriangle, Clock, BarChart, TrendingUp, TrendingDown } from "lucide-react"

export default function ManagerDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Manager Dashboard</h2>
        <p className="text-muted-foreground">
          Monitor quality metrics, manage notifications, and oversee CAPA processes.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="quality-metrics">Quality Metrics</TabsTrigger>
          <TabsTrigger value="pending-actions">Pending Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">OOS Results</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">+2 from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open CAPAs</CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">-3 from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed CAPAs</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">+5 from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
                <BarChart className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">92%</div>
                <p className="text-xs text-muted-foreground">+2% from last month</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Notifications</CardTitle>
                <CardDescription>You have 4 unread notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Bell className="h-4 w-4" />
                  <AlertTitle className="flex items-center gap-2">
                    OOS Investigation Required
                    <Badge variant="destructive">Urgent</Badge>
                  </AlertTitle>
                  <AlertDescription>
                    Augmentin 60ml Batch #A2023-45 has an OOS result for pH level. Lab analysis complete, production
                    investigation needed.
                  </AlertDescription>
                </Alert>
                <Alert>
                  <Bell className="h-4 w-4" />
                  <AlertTitle className="flex items-center gap-2">CAPA Implementation Due</AlertTitle>
                  <AlertDescription>
                    CAPA-2023-087 implementation deadline is approaching. Please review progress.
                  </AlertDescription>
                </Alert>
                <Alert>
                  <Bell className="h-4 w-4" />
                  <AlertTitle className="flex items-center gap-2">
                    Production Schedule Change
                    <Badge>Information</Badge>
                  </AlertTitle>
                  <AlertDescription>
                    Production schedule for next week has been updated due to raw material delivery delay.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quality Trends</CardTitle>
                <CardDescription>Monthly quality metrics overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-md border p-3">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-green-500" />
                    <span>OOS Rate</span>
                  </div>
                  <div className="font-medium">2.3%</div>
                  <Badge variant="outline" className="text-green-500">
                    -0.5%
                  </Badge>
                </div>
                <div className="flex items-center justify-between rounded-md border p-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span>First-Time Right</span>
                  </div>
                  <div className="font-medium">94.7%</div>
                  <Badge variant="outline" className="text-green-500">
                    +1.2%
                  </Badge>
                </div>
                <div className="flex items-center justify-between rounded-md border p-3">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    <span>CAPA Closure Rate</span>
                  </div>
                  <div className="font-medium">85.3%</div>
                  <Badge variant="outline" className="text-red-500">
                    -2.1%
                  </Badge>
                </div>
                <div className="flex items-center justify-between rounded-md border p-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span>Audit Compliance</span>
                  </div>
                  <div className="font-medium">98.2%</div>
                  <Badge variant="outline" className="text-green-500">
                    +0.8%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="quality-metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quality Metrics by Product</CardTitle>
              <CardDescription>Performance metrics for each product line</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-5 gap-4 rounded-md bg-gray-100 p-3">
                  <div className="font-medium">Product</div>
                  <div className="font-medium">OOS Rate</div>
                  <div className="font-medium">First-Time Right</div>
                  <div className="font-medium">CAPA Count</div>
                  <div className="font-medium">Quality Score</div>
                </div>
                <div className="grid grid-cols-5 gap-4 rounded-md p-3 hover:bg-gray-50">
                  <div>Augmentin 60ml</div>
                  <div>2.1%</div>
                  <div>95.3%</div>
                  <div>3</div>
                  <div>93%</div>
                </div>
                <div className="grid grid-cols-5 gap-4 rounded-md p-3 hover:bg-gray-50">
                  <div>Augmentin 1g</div>
                  <div>1.8%</div>
                  <div>96.7%</div>
                  <div>2</div>
                  <div>94%</div>
                </div>
                <div className="grid grid-cols-5 gap-4 rounded-md p-3 hover:bg-gray-50">
                  <div>Augmentin 500mg</div>
                  <div>2.5%</div>
                  <div>94.2%</div>
                  <div>4</div>
                  <div>91%</div>
                </div>
                <div className="grid grid-cols-5 gap-4 rounded-md p-3 hover:bg-gray-50">
                  <div>Clamoxyl 500mg</div>
                  <div>3.2%</div>
                  <div>92.8%</div>
                  <div>5</div>
                  <div>89%</div>
                </div>
                <div className="grid grid-cols-5 gap-4 rounded-md p-3 hover:bg-gray-50">
                  <div>Clamoxyl 250mg</div>
                  <div>1.9%</div>
                  <div>95.1%</div>
                  <div>2</div>
                  <div>93%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending-actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Actions</CardTitle>
              <CardDescription>Actions requiring your attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4 rounded-md bg-gray-100 p-3">
                  <div className="font-medium">Action</div>
                  <div className="font-medium">Related To</div>
                  <div className="font-medium">Due Date</div>
                  <div className="font-medium">Priority</div>
                </div>
                <div className="grid grid-cols-4 gap-4 rounded-md p-3 hover:bg-gray-50">
                  <div>Review OOS Investigation</div>
                  <div>Augmentin 60ml Batch #A2023-45</div>
                  <div>Today</div>
                  <div>
                    <Badge variant="destructive">High</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 rounded-md p-3 hover:bg-gray-50">
                  <div>Approve CAPA Plan</div>
                  <div>CAPA-2023-089</div>
                  <div>Tomorrow</div>
                  <div>
                    <Badge variant="destructive">High</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 rounded-md p-3 hover:bg-gray-50">
                  <div>Review Root Cause Analysis</div>
                  <div>Clamoxyl 500mg Impurity Issue</div>
                  <div>2 days</div>
                  <div>
                    <Badge>Medium</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 rounded-md p-3 hover:bg-gray-50">
                  <div>Monthly Quality Review</div>
                  <div>All Products</div>
                  <div>5 days</div>
                  <div>
                    <Badge>Medium</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 rounded-md p-3 hover:bg-gray-50">
                  <div>Supplier Audit Report</div>
                  <div>Raw Material Supplier</div>
                  <div>1 week</div>
                  <div>
                    <Badge variant="outline">Low</Badge>
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
