"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { ShieldCheck, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ROLES } from "@/lib/firebase/firestore"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { user, signIn, error, setUserRole } = useFirebase()

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      // Store role in localStorage for persistence
      if (role) {
        localStorage.setItem("userRole", role)
      }

      const storedRole = localStorage.getItem("userRole") || ROLES.LAB_ANALYST

      // Redirect based on role
      switch (storedRole) {
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
          router.push("/dashboard/lab-analyst")
      }
    }
  }, [user, router, role])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password || !role) {
      toast({
        title: "Login failed",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Store role before login
      localStorage.setItem("userRole", role)

      await signIn(email, password)

      // Set user role in Firebase
      await setUserRole(role as any)

      toast({
        title: "Login successful",
        description: `Logged in as ${role}`,
      })

      // Note: The useEffect above will handle redirection after successful login
      // This is more reliable than redirecting here
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid email or password",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <ShieldCheck className="h-12 w-12 text-orange-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Login to PharmQC</CardTitle>
          <CardDescription className="text-center">Enter your credentials to access your account</CardDescription>
        </CardHeader>

        {error && (
          <div className="px-6 pb-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Firebase Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole} required>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ROLES.LAB_ANALYST}>Lab Analyst</SelectItem>
                  <SelectItem value={ROLES.PRODUCTION_ANALYST}>Production Analyst</SelectItem>
                  <SelectItem value={ROLES.MANAGER}>Manager</SelectItem>
                  <SelectItem value={ROLES.ADMINISTRATOR}>Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={isLoading || !!error}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
