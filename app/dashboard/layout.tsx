"use client"

import { type ReactNode, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { DashboardNav } from "@/components/dashboard-nav"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ROLES } from "@/lib/firebase/firestore"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading, signOut } = useFirebase()
  const router = useRouter()
  const pathname = usePathname()
  const [isClient, setIsClient] = useState(false)
  const [accessDenied, setAccessDenied] = useState(false)

  // Set isClient to true when component mounts
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Check authentication and redirect if needed
  useEffect(() => {
    if (isClient && !loading && !user) {
      console.log("User not authenticated, redirecting to login")
      router.push("/login")
    }
  }, [user, loading, router, isClient])

  // Check role-based access
  useEffect(() => {
    if (isClient && !loading && user && user.role) {
      const pathSegments = pathname.split("/")
      const dashboardType = pathSegments[2] // e.g., "lab-analyst", "manager", etc.

      // If trying to access a dashboard that doesn't match the user's role
      if (dashboardType && dashboardType !== user.role) {
        console.log(`Access denied: User with role ${user.role} trying to access ${dashboardType} dashboard`)
        setAccessDenied(true)
      } else {
        setAccessDenied(false)
      }
    }
  }, [pathname, user, loading, isClient])

  // Handle access denied
  const handleRedirectToDashboard = () => {
    if (user && user.role) {
      switch (user.role) {
        case ROLES.LAB_ANALYST:
          router.push("/dashboard/lab-analyst")
          break
        case ROLES.PRODUCTION_ANALYST:
          router.push("/dashboard/production-analyst")
          break
        case ROLES.MANAGER:
          router.push("/dashboard/manager")
          break
        case ROLES.ADMINISTRATOR:
          router.push("/dashboard/administrator")
          break
        default:
          router.push("/dashboard")
      }
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  // Show loading state while checking authentication
  if (loading || !isClient) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="border-b">
          <div className="flex h-16 items-center px-4">
            <Skeleton className="h-8 w-32" />
            <div className="ml-auto flex items-center space-x-4">
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </div>
        <div className="flex-1 flex">
          <div className="w-64 border-r bg-gray-50 p-4">
            <Skeleton className="h-8 w-32 mb-6" />
            <div className="space-y-2">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
            </div>
          </div>
          <main className="flex-1 p-6">
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-64 w-full rounded-md" />
          </main>
        </div>
      </div>
    )
  }

  // If not authenticated and not loading, don't render children
  if (!user) {
    return null
  }

  // If access denied, show access denied message
  if (accessDenied) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="border-b">
          <div className="flex h-16 items-center px-4">
            <h1 className="text-lg font-bold">PharmQC</h1>
            <div className="ml-auto flex items-center space-x-4">
              <UserMenu user={user} onSignOut={handleSignOut} />
            </div>
          </div>
        </div>
        <div className="flex-1 flex justify-center items-center p-6">
          <div className="max-w-md">
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Access Denied</AlertTitle>
              <AlertDescription>
                You do not have permission to access this page. Your role ({user.role}) does not have access to this
                section.
              </AlertDescription>
            </Alert>
            <Button onClick={handleRedirectToDashboard} className="w-full">
              Go to Your Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Render dashboard if authenticated
  return (
    <div className="flex min-h-screen flex-col">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <h1 className="text-lg font-bold">PharmQC</h1>
          <div className="ml-auto flex items-center space-x-4">
            <UserMenu user={user} onSignOut={handleSignOut} />
          </div>
        </div>
      </div>
      <div className="flex-1 flex">
        <DashboardNav />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}

function UserMenu({ user, onSignOut }: { user: any; onSignOut: () => void }) {
  const initials = user.email ? user.email.substring(0, 2).toUpperCase() : "U"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.email}</p>
            <p className="text-xs leading-none text-muted-foreground">Role: {user.role}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSignOut} className="text-red-600 cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
