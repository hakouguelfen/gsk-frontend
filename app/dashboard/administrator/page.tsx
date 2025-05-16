import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { BarChart, LineChart, PieChart, Users, AlertTriangle, CheckCircle, Clock } from "lucide-react"

export default function AdministratorDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Administrator Dashboard</h2>
        <p className="text-muted-foreground">View system statistics, manage users, and analyze quality metrics.</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="quality-metrics">Quality Metrics</TabsTrigger>
          <TabsTrigger value="system-status">System Status</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">42</div>
                <p className="text-xs text-muted-foreground">+3 from last month</p>
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
                <CardTitle className="text-sm font-medium">OOS Rate</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.3%</div>
                <p className="text-xs text-muted-foreground">-0.5% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">First-Time Right</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">94.7%</div>
                <p className="text-xs text-muted-foreground">+1.2% from last month</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Quality Metrics Trend</CardTitle>
                <CardDescription>Monthly quality metrics for the past 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-md">
                  <LineChart className="h-8 w-8 text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">Quality Metrics Chart</span>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>OOS Distribution by Product</CardTitle>
                <CardDescription>Distribution of OOS results by product</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-md">
                  <PieChart className="h-8 w-8 text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">OOS Distribution Chart</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent System Activity</CardTitle>
              <CardDescription>Recent activity in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 rounded-md bg-gray-100 p-3">
                  <div className="font-medium">User</div>
                  <div className="font-medium">Action</div>
                  <div className="font-medium">Time</div>
                </div>
                <div className="grid grid-cols-3 gap-4 rounded-md p-3 hover:bg-gray-50">
                  <div>John Doe (Lab Analyst)</div>
                  <div>Submitted HPLC data for Augmentin 60ml</div>
                  <div>10 minutes ago</div>
                </div>
                <div className="grid grid-cols-3 gap-4 rounded-md p-3 hover:bg-gray-50">
                  <div>Jane Smith (Manager)</div>
                  <div>Created new CAPA for pH deviation</div>
                  <div>1 hour ago</div>
                </div>
                <div className="grid grid-cols-3 gap-4 rounded-md p-3 hover:bg-gray-50">
                  <div>Mike Johnson (Production Analyst)</div>
                  <div>Updated production data for Batch #A2023-52</div>
                  <div>2 hours ago</div>
                </div>
                <div className="grid grid-cols-3 gap-4 rounded-md p-3 hover:bg-gray-50">
                  <div>Sarah Williams (Lab Analyst)</div>
                  <div>Sent notification to Production Team</div>
                  <div>3 hours ago</div>
                </div>
                <div className="grid grid-cols-3 gap-4 rounded-md p-3 hover:bg-gray-50">
                  <div>Robert Brown (Administrator)</div>
                  <div>Added new user account</div>
                  <div>1 day ago</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality-metrics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>OOS Trend by Month</CardTitle>
                <CardDescription>Monthly OOS trend for the past 12 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-md">
                  <BarChart className="h-8 w-8 text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">OOS Trend Chart</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>CAPA Effectiveness</CardTitle>
                <CardDescription>Effectiveness of implemented CAPAs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-md">
                  <PieChart className="h-8 w-8 text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">CAPA Effectiveness Chart</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quality Metrics by Product</CardTitle>
              <CardDescription>Detailed quality metrics for each product</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-6 gap-4 rounded-md bg-gray-100 p-3">
                  <div className="font-medium">Product</div>
                  <div className="font-medium">OOS Rate</div>
                  <div className="font-medium">First-Time Right</div>
                  <div className="font-medium">CAPA Count</div>
                  <div className="font-medium">Investigation Time</div>
                  <div className="font-medium">Quality Score</div>
                </div>
                <div className="grid grid-cols-6 gap-4 rounded-md p-3 hover:bg-gray-50">
                  <div>Augmentin 60ml</div>
                  <div>2.1%</div>
                  <div>95.3%</div>
                  <div>3</div>
                  <div>4.2 days</div>
                  <div>93%</div>
                </div>
                <div className="grid grid-cols-6 gap-4 rounded-md p-3 hover:bg-gray-50">
                  <div>Augmentin 1g</div>
                  <div>1.8%</div>
                  <div>96.7%</div>
                  <div>2</div>
                  <div>3.5 days</div>
                  <div>94%</div>
                </div>
                <div className="grid grid-cols-6 gap-4 rounded-md p-3 hover:bg-gray-50">
                  <div>Augmentin 500mg</div>
                  <div>2.5%</div>
                  <div>94.2%</div>
                  <div>4</div>
                  <div>4.8 days</div>
                  <div>91%</div>
                </div>
                <div className="grid grid-cols-6 gap-4 rounded-md p-3 hover:bg-gray-50">
                  <div>Clamoxyl 500mg</div>
                  <div>3.2%</div>
                  <div>92.8%</div>
                  <div>5</div>
                  <div>5.3 days</div>
                  <div>89%</div>
                </div>
                <div className="grid grid-cols-6 gap-4 rounded-md p-3 hover:bg-gray-50">
                  <div>Clamoxyl 250mg</div>
                  <div>1.9%</div>
                  <div>95.1%</div>
                  <div>2</div>
                  <div>3.8 days</div>
                  <div>93%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system-status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Current status of system components</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 rounded-md bg-gray-100 p-3">
                  <div className="font-medium">Component</div>
                  <div className="font-medium">Status</div>
                  <div className="font-medium">Last Updated</div>
                </div>
                <div className="grid grid-cols-3 gap-4 rounded-md p-3 hover:bg-gray-50">
                  <div>Database</div>
                  <div>
                    <Badge variant="outline" className="text-green-500">
                      Operational
                    </Badge>
                  </div>
                  <div>5 minutes ago</div>
                </div>
                <div className="grid grid-cols-3 gap-4 rounded-md p-3 hover:bg-gray-50">
                  <div>Authentication Service</div>
                  <div>
                    <Badge variant="outline" className="text-green-500">
                      Operational
                    </Badge>
                  </div>
                  <div>5 minutes ago</div>
                </div>
                <div className="grid grid-cols-3 gap-4 rounded-md p-3 hover:bg-gray-50">
                  <div>LIMS Integration</div>
                  <div>
                    <Badge variant="outline" className="text-green-500">
                      Operational
                    </Badge>
                  </div>
                  <div>5 minutes ago</div>
                </div>
                <div className="grid grid-cols-3 gap-4 rounded-md p-3 hover:bg-gray-50">
                  <div>Notification Service</div>
                  <div>
                    <Badge variant="outline" className="text-green-500">
                      Operational
                    </Badge>
                  </div>
                  <div>5 minutes ago</div>
                </div>
                <div className="grid grid-cols-3 gap-4 rounded-md p-3 hover:bg-gray-50">
                  <div>File Storage</div>
                  <div>
                    <Badge variant="outline" className="text-green-500">
                      Operational
                    </Badge>
                  </div>
                  <div>5 minutes ago</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Usage</CardTitle>
              <CardDescription>System usage statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 rounded-md bg-gray-100 p-3">
                  <div className="font-medium">Metric</div>
                  <div className="font-medium">Value</div>
                </div>
                <div className="grid grid-cols-2 gap-4 rounded-md p-3 hover:bg-gray-50">
                  <div>Total Users</div>
                  <div>42</div>
                </div>
                <div className="grid grid-cols-2 gap-4 rounded-md p-3 hover:bg-gray-50">
                  <div>Active Sessions</div>
                  <div>18</div>
                </div>
                <div className="grid grid-cols-2 gap-4 rounded-md p-3 hover:bg-gray-50">
                  <div>Tests Recorded Today</div>
                  <div>87</div>
                </div>
                <div className="grid grid-cols-2 gap-4 rounded-md p-3 hover:bg-gray-50">
                  <div>Notifications Sent Today</div>
                  <div>34</div>
                </div>
                <div className="grid grid-cols-2 gap-4 rounded-md p-3 hover:bg-gray-50">
                  <div>Database Size</div>
                  <div>2.3 GB</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
