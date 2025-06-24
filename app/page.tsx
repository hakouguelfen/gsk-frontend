import { ArrowRight, Beaker, ClipboardCheck, LineChart, ShieldCheck, Users } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white border-b">
        <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <ShieldCheck className="h-8 w-8 text-primary-500 mr-2" />
            <h1 className="text-xl font-bold">PharmQC</h1>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Pharmaceutical Quality Control System
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                  A comprehensive solution for managing laboratory data, production information, and quality deviations.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/login">
                  <Button className="bg-primary-500 hover:bg-primary-600">
                    Login <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-4 md:grid-cols-2">
              <Card className="border-t-4 border-t-primary-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Lab Analyst</CardTitle>
                  <Beaker className="h-4 w-4 text-primary-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Input laboratory data</li>
                      <li>Send notifications</li>
                      <li>View CAPA instructions</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-t-4 border-t-primary-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Production Analyst</CardTitle>
                  <ClipboardCheck className="h-4 w-4 text-primary-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Input production data</li>
                      <li>Send notifications</li>
                      <li>View CAPA instructions</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-t-4 border-t-primary-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Manager</CardTitle>
                  <Users className="h-4 w-4 text-primary-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Manage notifications</li>
                      <li>Root cause analysis</li>
                      <li>CAPA prediction</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-t-4 border-t-primary-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Administrator</CardTitle>
                  <LineChart className="h-4 w-4 text-primary-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>View statistical data</li>
                      <li>Generate reports</li>
                      <li>System access management</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-white">
        <div className="container flex flex-col gap-2 py-4 md:flex-row md:items-center md:justify-between md:py-6">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2025 PharmQC. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
