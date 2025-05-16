import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function NotificationsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all" disabled>
            All
          </TabsTrigger>
          <TabsTrigger value="unread" disabled>
            Unread
          </TabsTrigger>
          <TabsTrigger value="read" disabled>
            Read
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="flex items-start gap-2">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <div>
                      <Skeleton className="h-5 w-48 mb-2" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
