"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Beaker,
  ClipboardCheck,
  Users,
  LineChart,
  Bell,
  FileText,
  Search,
  Home,
  LogOut,
  ShieldCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function DashboardNav() {
  const pathname = usePathname()
  const { user, signOut } = useFirebase()
  const router = useRouter()
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    // Get role from pathname or localStorage
    const pathRole = pathname.split("/")[2]
    const storedRole = localStorage.getItem("userRole")

    setRole(pathRole || storedRole || "lab-analyst")
  }, [pathname])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const labAnalystLinks = [
    { href: "/dashboard/lab-analyst", label: "Dashboard", icon: Home },
    { href: "/dashboard/lab-analyst/data-input", label: "Data Input", icon: Beaker },
    { href: "/dashboard/lab-analyst/notifications", label: "Notifications", icon: Bell },
    { href: "/dashboard/lab-analyst/documents", label: "CAPA Documents", icon: FileText },
  ]

  const productionAnalystLinks = [
    { href: "/dashboard/production-analyst", label: "Dashboard", icon: Home },
    { href: "/dashboard/production-analyst/data-input", label: "Data Input", icon: ClipboardCheck },
    { href: "/dashboard/production-analyst/notifications", label: "Notifications", icon: Bell },
    { href: "/dashboard/production-analyst/documents", label: "CAPA Documents", icon: FileText },
  ]

  const managerLinks = [
    { href: "/dashboard/manager", label: "Dashboard", icon: Home },
    { href: "/dashboard/manager/notifications", label: "Notifications", icon: Bell },
    { href: "/dashboard/manager/root-cause", label: "Root Cause Analysis", icon: Search },
    { href: "/dashboard/manager/capa", label: "CAPA Prediction", icon: FileText },
  ]

  const administratorLinks = [
    { href: "/dashboard/administrator", label: "Dashboard", icon: Home },
    { href: "/dashboard/administrator/statistics", label: "Statistics", icon: LineChart },
    { href: "/dashboard/administrator/users", label: "User Management", icon: Users },
  ]

  let links
  switch (role) {
    case "lab-analyst":
      links = labAnalystLinks
      break
    case "production-analyst":
      links = productionAnalystLinks
      break
    case "manager":
      links = managerLinks
      break
    case "administrator":
      links = administratorLinks
      break
    default:
      links = labAnalystLinks
  }

  return (
    <nav className="w-64 border-r bg-gray-50 p-4">
      <div className="space-y-4">
        <div className="flex items-center mb-6">
          <ShieldCheck className="h-6 w-6 text-orange-500 mr-2" />
          <span className="text-lg font-semibold">PharmQC</span>
        </div>

        {user && (
          <div className="pb-4 border-b">
            <p className="text-sm font-medium">{user.email}</p>
            <p className="text-xs text-muted-foreground capitalize">{role?.replace("-", " ")}</p>
          </div>
        )}

        <div className="py-2">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
            {role
              ? role
                  .split("-")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")
              : "Dashboard"}
          </h2>
          <div className="space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100 hover:text-gray-900",
                  pathname === link.href ? "bg-orange-100 text-orange-600" : "text-gray-500",
                )}
              >
                <link.icon className="mr-2 h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="py-2">
          <Button
            variant="outline"
            className="w-full justify-start text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  )
}
