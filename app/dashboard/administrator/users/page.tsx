"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Search, UserPlus, Edit, Trash, UserCog } from "lucide-react"
import {
  createUser,
  getUsers,
  updateUserStatus,
  deleteUser,
  type User as FirestoreUser,
} from "@/lib/firebase/firestore"

export default function UserManagement() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<FirestoreUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (username && email && role) {
      setIsLoading(true);
      
      try {
        // Create user in Firestore
        await createUser({
          username,
          email,
          role,
          status: "active",
          department: "quality-control", // Default department
          createdAt: new Date(),
        });
        
        toast({
          title: "User added",
          description: `User ${username} has been added successfully.`,
        });
        
        // Reset form
        setUsername("");
        setEmail("");
        setRole("");
      } catch (error) {
        console.error("Error adding user:", error);
        toast({
          title: "Failed to add user",
          description: error instanceof Error ? error.message : "An error occurred while adding the user.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      toast({
        title: "Failed to add user",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const fetchedUsers = await getUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Failed to load users",
          description: "An error occurred while loading users.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  const handleEditUser = (user: FirestoreUser) => {
    // In a real app, this would open a modal or navigate to an edit page
    toast({
      title: "Edit User",
      description: `Editing user ${user.username} (${user.email})`,
    });
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (confirm(`Are you sure you want to delete user ${username}?`)) {
      try {
        await deleteUser(userId);
        setUsers(users.filter(user => user.id !== userId));
        toast({
          title: "User deleted",
          description: `User ${username} has been deleted successfully.`,
        });
      } catch (error) {
        console.error("Error deleting user:", error);
        toast({
          title: "Failed to delete user",
          description: "An error occurred while deleting the user.",
          variant: "destructive",
        });
      }
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: "active" | "inactive") => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      await updateUserStatus(userId, newStatus);
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));
      toast({
        title: "User status updated",
        description: `User status has been updated to ${newStatus}.`,
      });
    } catch (error) {
      console.error("Error updating user status:", error);
      toast({
        title: "Failed to update user status",
        description: "An error occurred while updating the user status.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
        <p className="text-muted-foreground">
          Manage user accounts and access permissions.
        </p>
      </div>
      
      <div className="flex items-center space-x-2">
        <Input placeholder="Search users..." className="max-w-sm" />
        <Button variant="outline" size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </div>
      
      <Tabs defaultValue="all-users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all-users">All Users</TabsTrigger>
          <TabsTrigger value="add-user">Add User</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all-users">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                Manage existing user accounts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingUsers ? (
                <div className="flex justify-center items-center h-40">
                  <p>Loading users...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="flex justify-center items-center h-40">
                  <p>No users found. Add a user to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-5 gap-4 rounded-md bg-gray-100 p-3">
                    <div className="font-medium">Username</div>
                    <div className="font-medium">Email</div>
                    <div className="font-medium">Role</div>
                    <div className="font-medium">Status</div>
                    <div className="font-medium">Actions</div>
                  </div>
                  {users.map((user) => (
                    <div key={user.id} className="grid grid-cols-5 gap-4 rounded-md p-3 hover:bg-gray-50">
                      <div>{user.username}</div>
                      <div>{user.email}</div>
                      <div>{user.role}</div>
                      <div>
                        <Badge 
                          variant="outline" 
                          className={user.status === "active" ? "text-green-500" : "text-red-500"}
                          onClick={() => user.id && handleToggleUserStatus(user.id, user.status as "active" | "inactive")}
                          style={{ cursor: "pointer" }}
                        >
                          {user.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => user.id && handleDeleteUser(user.id, user.username)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="add-user">
          <Card>
            <form onSubmit={handleAddUser}>
              <CardHeader>
                <CardTitle>Add New User</CardTitle>
                <CardDescription>
                  Create a new user account.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input 
                      id="username" 
                      placeholder="e.g., john.doe" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="e.g., john.doe@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input id="confirm-password" type="password" required />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={role} onValueChange={setRole} required>
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lab-analyst">Lab Analyst</SelectItem>
                      <SelectItem value="production-analyst">Production Analyst</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="administrator">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select>
                    <SelectTrigger id="department">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quality-control">Quality Control</SelectItem>
                      <SelectItem value="production">Production</SelectItem>
                      <SelectItem value="quality-assurance">Quality Assurance</SelectItem>
                      <SelectItem value="it">IT</SelectItem>
                      <SelectItem value="management">Management</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={isLoading}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  {isLoading ? "Adding User..." : "Add User"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <CardTitle>Roles & Permissions</CardTitle>
              <CardDescription>
                Manage roles and their associated permissions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="rounded-md border">
                  <div className="bg-gray-100 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UserCog className="h-5 w-5" />
                        <h3 className="font-medium">Lab Analyst</h3>
                      </div>
                      <Button variant="outline" size="sm">Edit Role</Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 rounded-md bg-gray-50 p-3">
                        <div className="font-medium">Permission</div>
                        <div className="font-medium">Description</div>
                        <div className="font-medium">Status</div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 rounded-md p-3">
                        <div>Send Notifications</div>\
