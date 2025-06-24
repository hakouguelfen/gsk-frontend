"use client";

import { AlertCircle, Bell, Send } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { requestNotificationPermission } from "@/lib/firebase/fcm";
import { useFirebase } from "@/lib/firebase/firebase-provider";
import {
  getNotifications,
  markNotificationAsRead,
  type Notification,
  sendNotification,
} from "@/lib/firebase/firestore";

export default function LabNotifications() {
  const { user } = useFirebase();
  const [recipient, setRecipient] = useState("");
  const [priority, setPriority] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [sentNotifications, setSentNotifications] = useState<Notification[]>(
    [],
  );
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Request notification permission when component mounts
    const setupNotifications = async () => {
      await requestNotificationPermission();
    };

    setupNotifications();

    // Fetch notifications if user is logged in
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      // Fetch notifications where user is a recipient
      const receivedNotifications = await getNotifications(user.uid);
      setNotifications(receivedNotifications);

      // For sent notifications, use a simple approach to avoid index issues
      // In a real app, you would have a separate query for this
      const allNotifications = await getNotifications(user.uid);
      setSentNotifications(
        allNotifications.filter((n) => n.sender === user.uid),
      );

      // Reset error state if successful
      setHasError(false);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setHasError(true);
      toast({
        title: "Error loading notifications",
        description: "Please check your Firebase configuration.",
        variant: "destructive",
      });

      // Set empty arrays to prevent UI from breaking
      setNotifications([]);
      setSentNotifications([]);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to send notifications",
        variant: "destructive",
      });
      return;
    }

    if (!recipient || !priority || !subject || !message) {
      toast({
        title: "Sending failed",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Determine recipients based on selection
      let recipients: string[] = [];

      // In a real app, you would fetch actual user IDs from Firestore
      // This is a simplified example
      if (recipient === "production-team") {
        recipients = ["production-team-id"];
      } else if (recipient === "quality-manager") {
        recipients = ["quality-manager-id"];
      } else if (recipient === "lab-manager") {
        recipients = ["lab-manager-id"];
      } else if (recipient === "all") {
        recipients = [
          "production-team-id",
          "quality-manager-id",
          "lab-manager-id",
        ];
      }

      // Send notification to Firestore
      await sendNotification({
        subject,
        message,
        priority: priority as "high" | "medium" | "low",
        sender: user.uid,
        recipients,
      });

      toast({
        title: "Notification sent",
        description: `Your notification has been sent to ${recipient}.`,
      });

      // Reset form
      setRecipient("");
      setPriority("");
      setSubject("");
      setMessage("");

      // Refresh notifications
      fetchNotifications();
    } catch (error) {
      console.error("Error sending notification:", error);
      toast({
        title: "Sending failed",
        description:
          "An error occurred while sending the notification. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
      );

      toast({
        title: "Notification marked as read",
        description: "The notification has been marked as read.",
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast({
        title: "Action failed",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
        <p className="text-muted-foreground">
          Send and receive notifications related to laboratory tests and quality
          control.
        </p>
      </div>
      {hasError && (
        <Alert className="mb-6 bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertTitle>Firebase Index Required</AlertTitle>
          <AlertDescription>
            <p>
              This feature requires a Firestore index. Check the console for the
              link to create it.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              The app will continue to function with limited notification
              capabilities.
            </p>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="send" className="space-y-4">
        <TabsList>
          <TabsTrigger value="send">Send Notification</TabsTrigger>
          <TabsTrigger value="inbox">Inbox</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
        </TabsList>

        <TabsContent value="send">
          <Card>
            <form onSubmit={handleSendNotification}>
              <CardHeader>
                <CardTitle>Send Notification</CardTitle>
                <CardDescription>
                  Send notifications to production team or management.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="recipient">Recipient</Label>
                    <Select
                      value={recipient}
                      onValueChange={setRecipient}
                      required
                    >
                      <SelectTrigger id="recipient">
                        <SelectValue placeholder="Select recipient" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="production-team">
                          Production Team
                        </SelectItem>
                        <SelectItem value="quality-manager">
                          Quality Manager
                        </SelectItem>
                        <SelectItem value="lab-manager">Lab Manager</SelectItem>
                        <SelectItem value="all">All Teams</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={priority}
                      onValueChange={setPriority}
                      required
                    >
                      <SelectTrigger id="priority">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="e.g., OOS Result for Augmentin Batch A2023-45"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Enter your notification message"
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="bg-primary-500 hover:bg-primary-600"
                  disabled={isLoading}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {isLoading ? "Sending..." : "Send Notification"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="inbox">
          <Card>
            <CardHeader>
              <CardTitle>Inbox</CardTitle>
              <CardDescription>
                Notifications received from other teams.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="flex items-center justify-center h-40 bg-gray-50 rounded-md">
                  <p className="text-muted-foreground">
                    No notifications received
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="flex items-center justify-between rounded-md border p-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4" />
                          <span className="font-medium">
                            {notification.subject}
                          </span>
                          {!notification.read && <Badge>New</Badge>}
                          {notification.priority === "high" && (
                            <Badge variant="destructive">Urgent</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                        <div className="text-xs text-muted-foreground">
                          From: {notification.sender} •{" "}
                          {notification.createdAt?.toDate().toLocaleString()}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          notification.id && handleMarkAsRead(notification.id)
                        }
                      >
                        {notification.read ? "View" : "Mark as Read"}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sent">
          <Card>
            <CardHeader>
              <CardTitle>Sent Notifications</CardTitle>
              <CardDescription>
                Notifications you have sent to other teams.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sentNotifications.length === 0 ? (
                <div className="flex items-center justify-center h-40 bg-gray-50 rounded-md">
                  <p className="text-muted-foreground">No sent notifications</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sentNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="flex items-center justify-between rounded-md border p-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Send className="h-4 w-4" />
                          <span className="font-medium">
                            {notification.subject}
                          </span>
                          {notification.priority === "high" && (
                            <Badge variant="destructive">Urgent</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                        <div className="text-xs text-muted-foreground">
                          To: {notification.recipients.join(", ")} •{" "}
                          {notification.createdAt?.toDate().toLocaleString()}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
