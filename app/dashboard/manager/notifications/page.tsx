"use client";

import {
  AlertTriangle,
  Beaker,
  Bell,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  Clock,
  ExternalLink,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { NotificationsFallback } from "@/components/notifications-fallback";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFirebase } from "@/lib/firebase/firebase-provider";
import {
  getLabData,
  getNotifications,
  getProductionData,
  hasPermission,
  markNotificationAsRead,
  type Notification,
} from "@/lib/firebase/firestore";

export default function ManagerNotifications() {
  const { user } = useFirebase();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check permissions
  useEffect(() => {
    if (user && !hasPermission(user.role || "", "notifications:read")) {
      router.push("/dashboard");
    }
  }, [user, router]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const fetchedNotifications = await getNotifications(user.uid);
        setNotifications(fetchedNotifications);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError("Failed to load notifications. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification,
        ),
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  if (loading) {
    return <NotificationsFallback />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
          <p className="text-muted-foreground">
            View and manage your notifications.
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <AlertTriangle className="h-10 w-10 text-orange-500 mb-4" />
              <h3 className="text-lg font-medium">
                Error Loading Notifications
              </h3>
              <p className="text-muted-foreground mt-2">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const unreadNotifications = notifications.filter(
    (notification) => !notification.read,
  );
  const readNotifications = notifications.filter(
    (notification) => notification.read,
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
        <p className="text-muted-foreground">
          View and manage your notifications and alerts.
        </p>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">
            Unread{" "}
            <Badge className="ml-2 bg-orange-500">
              {unreadNotifications.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="read">Read</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <Bell className="h-10 w-10 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium">No Notifications</h3>
                  <p className="text-muted-foreground mt-2">
                    You don't have any notifications yet.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            notifications.map((notification) => (
              <EnhancedNotificationCard
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          {unreadNotifications.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <CheckCircle className="h-10 w-10 text-green-500 mb-4" />
                  <h3 className="text-lg font-medium">All Caught Up!</h3>
                  <p className="text-muted-foreground mt-2">
                    You have no unread notifications.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            unreadNotifications.map((notification) => (
              <EnhancedNotificationCard
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="read" className="space-y-4">
          {readNotifications.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <Clock className="h-10 w-10 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium">No Read Notifications</h3>
                  <p className="text-muted-foreground mt-2">
                    You haven't read any notifications yet.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            readNotifications.map((notification) => (
              <EnhancedNotificationCard
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EnhancedNotificationCard({
  notification,
  onMarkAsRead,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [labData, setLabData] = useState<any>(null);
  const [productionData, setProductionData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High Priority</Badge>;
      case "medium":
        return <Badge variant="default">Medium Priority</Badge>;
      case "low":
        return <Badge variant="outline">Low Priority</Badge>;
      default:
        return null;
    }
  };

  const getIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "medium":
        return <Bell className="h-5 w-5 text-orange-500" />;
      case "low":
        return <Bell className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Unknown date";

    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  const fetchRelatedData = async () => {
    if (!notification.relatedData || loading) return;

    setLoading(true);

    try {
      // Fetch lab data if available
      if (notification.relatedData.labDataId) {
        const data = await getLabData(notification.relatedData.labDataId);
        setLabData(data);
      }

      // Fetch production data if available
      if (notification.relatedData.productionDataId) {
        const data = await getProductionData(
          notification.relatedData.productionDataId,
        );
        setProductionData(data);
      }
    } catch (error) {
      console.error("Error fetching related data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExpand = () => {
    const newExpandedState = !expanded;
    setExpanded(newExpandedState);

    if (newExpandedState && notification.relatedData) {
      fetchRelatedData();
    }
  };

  const handleViewRootCause = () => {
    if (notification.relatedData?.batchNumber) {
      router.push(
        `/dashboard/manager/root-cause?batch=${notification.relatedData.batchNumber}`,
      );
    }
  };

  return (
    <Collapsible
      open={expanded}
      onOpenChange={handleExpand}
      className={
        notification.read ? "opacity-75" : "border-l-4 border-l-orange-500"
      }
    >
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="flex items-start gap-2">
            {getIcon(notification.priority)}
            <div>
              <CardTitle className="text-base font-bold">
                {notification.subject}
              </CardTitle>
              <CardDescription className="text-xs">
                From: {notification.sender} •{" "}
                {formatDate(notification.createdAt)}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getPriorityBadge(notification.priority)}
            {!notification.read && <Badge variant="secondary">New</Badge>}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{notification.message}</p>

          {notification.relatedData && (
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 flex items-center gap-1 text-xs"
              >
                {expanded ? "Hide Details" : "View Details"}
                {expanded ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </Button>
            </CollapsibleTrigger>
          )}

          <CollapsibleContent className="mt-4 space-y-4">
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
              </div>
            ) : (
              <>
                {notification.relatedData?.type === "combined" && (
                  <Alert className="bg-blue-50">
                    <AlertDescription>
                      Complete data is available for batch{" "}
                      {notification.relatedData.batchNumber}. You can now
                      perform root cause analysis.
                    </AlertDescription>
                  </Alert>
                )}

                {labData && (
                  <Card className="border border-blue-200">
                    <CardHeader className="py-3 bg-blue-50">
                      <div className="flex items-center">
                        <Beaker className="h-4 w-4 mr-2 text-blue-500" />
                        <CardTitle className="text-sm">
                          Laboratory Data
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="py-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="font-medium">Created At:</div>
                        <div>
                          {new Date(labData.createdAt).toLocaleString()}
                        </div>

                        <div className="font-medium">equipment id:</div>
                        <div>{labData.equipmentId}</div>

                        <div className="font-medium">equipment age:</div>
                        <div>{labData.equipmentAge}</div>

                        <div className="font-medium">test lab:</div>
                        <div>{labData.testLab}</div>

                        <div className="font-medium">
                          average Retention Time:
                        </div>
                        <div>{labData.averageRetentionTime}</div>

                        <div className="font-medium">HPLC pressure:</div>
                        <div>{labData.hplcPressure}</div>

                        <div className="font-medium">standards rsd:</div>
                        <div>{labData.standardsRSD}</div>

                        <div className="font-medium">peak surface:</div>
                        <div>{labData.peakSurface}</div>

                        <div className="font-medium">symmetry factor:</div>
                        <div>{labData.symmetryFactor}</div>

                        <div className="font-medium">Notes:</div>
                        {labData.notes && (
                          <>
                            <div className="font-medium">Notes:</div>
                            <div>{labData.notes}</div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {productionData && (
                  <Card className="border border-green-200">
                    <CardHeader className="py-3 bg-green-50">
                      <div className="flex items-center">
                        <ClipboardCheck className="h-4 w-4 mr-2 text-green-500" />
                        <CardTitle className="text-sm">
                          Production Data
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="py-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="font-medium">Created At:</div>
                        <div>
                          {new Date(productionData.createdAt).toLocaleString()}
                        </div>

                        <div className="font-medium">Porosite D Granules:</div>
                        <div>{productionData.porositeDGranules}</div>

                        <div className="font-medium">PSD D10:</div>
                        <div>{productionData.psd_D10}</div>

                        <div className="font-medium">PSD D50:</div>
                        <div>{productionData.psd_D50}</div>

                        <div className="font-medium">PSD D90:</div>
                        <div>{productionData.psd_D90}</div>

                        <div className="font-medium">PSD Span:</div>
                        <div>{productionData.psd_Span}</div>

                        <div className="font-medium">Quantite Excipients:</div>
                        <div>{productionData.quantiteExcipients}</div>

                        <div className="font-medium">
                          Quantite Principes Actifs:
                        </div>
                        <div>{productionData.quantitePrincipesActifs}</div>

                        <div className="font-medium">Teneur En Humidite:</div>
                        <div>{productionData.teneurEnHumidite}</div>

                        {productionData.notes && (
                          <>
                            <div className="font-medium">Notes:</div>
                            <div>{productionData.notes}</div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {notification.relatedData?.type === "combined" && (
                  <div className="flex justify-end">
                    <Button
                      onClick={handleViewRootCause}
                      className="flex items-center gap-1"
                    >
                      Analyze Root Cause
                      <ExternalLink className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </CollapsibleContent>
        </CardContent>

        {!notification.read && (
          <CardFooter className="pt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => notification.id && onMarkAsRead(notification.id)}
              className="ml-auto"
            >
              Mark as Read
            </Button>
          </CardFooter>
        )}
      </Card>
    </Collapsible>
  );
}
