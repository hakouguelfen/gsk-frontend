"use client"

import { type ReactNode, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface PermissionGuardProps {
  permission: string
  children: ReactNode
  fallback?: ReactNode
}

export function PermissionGuard({ permission, children, fallback }: PermissionGuardProps) {
  const { user, hasPermission, loading } = useFirebase()
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (!loading) {
      setChecked(true)
    }
  }, [loading])

  if (!checked || loading) {
    return null
  }

  if (!user) {
    router.push("/login")
    return null
  }

  if (!hasPermission(permission)) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>You do not have permission to access this feature.</AlertDescription>
          </Alert>
          <div className="mt-4 flex justify-center">
            <Button onClick={() => router.back()}>Go Back</Button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
