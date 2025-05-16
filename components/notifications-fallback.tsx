import { CardContent } from "@/components/ui/card"
import { CardDescription } from "@/components/ui/card"
import { CardTitle } from "@/components/ui/card"
import { CardHeader } from "@/components/ui/card"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Bell } from "lucide-react"

export function NotificationsFallback() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Your notifications will appear here</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertTitle>Firebase Setup Required</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>To use notifications, you need to set up Firebase properly:</p>
            <ol className="list-decimal pl-5 space-y-1 text-sm">
              <li>Ensure your Firebase project is correctly configured</li>
              <li>Create the required Firestore collections and indexes</li>
              <li>Set up proper security rules for notifications</li>
            </ol>
          </AlertDescription>
        </Alert>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-center h-20 bg-gray-50 rounded-md">
            <Bell className="h-5 w-5 text-muted-foreground mr-2" />
            <p className="text-muted-foreground">No notifications available</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
