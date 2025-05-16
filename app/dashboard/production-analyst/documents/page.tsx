"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Download, Printer, Search } from "lucide-react"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { getAssignedCAPAs, type CAPA } from "@/lib/firebase/firestore"

export default function ProductionDocuments() {
  const { user } = useFirebase()
  const [assignedCAPAs, setAssignedCAPAs] = useState<CAPA[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (user) {
      fetchAssignedCAPAs()
    }
  }, [user])

  const fetchAssignedCAPAs = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const capas = await getAssignedCAPAs(user.uid)
      setAssignedCAPAs(capas)
    } catch (error) {
      console.error("Error fetching CAPAs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredCAPAs = assignedCAPAs.filter(
    (capa) =>
      capa.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      capa.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handlePrint = (capaId: string) => {
    // In a real app, this would generate a printable version of the CAPA
    console.log(`Printing CAPA ${capaId}`)
    window.print()
  }

  const handleDownload = (capaId: string) => {
    // In a real app, this would generate a downloadable PDF of the CAPA
    console.log(`Downloading CAPA ${capaId}`)

    // Mock download functionality
    const link = document.createElement("a")
    link.href = "#"
    link.download = `CAPA-${capaId}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">CAPA Documents</h2>
        <p className="text-muted-foreground">View and print Corrective and Preventive Action (CAPA) instructions.</p>
      </div>

      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search documents..."
          className="max-w-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button variant="outline" size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="assigned" className="space-y-4">
        <TabsList>
          <TabsTrigger value="assigned">Assigned to You</TabsTrigger>
          <TabsTrigger value="all">All Documents</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>

        <TabsContent value="assigned">
          {isLoading ? (
            <div className="flex items-center justify-center h-40 bg-gray-50 rounded-md">
              <p className="text-muted-foreground">Loading CAPA documents...</p>
            </div>
          ) : filteredCAPAs.length === 0 ? (
            <div className="flex items-center justify-center h-40 bg-gray-50 rounded-md">
              <p className="text-muted-foreground">No CAPA documents assigned to you</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCAPAs.map((capa) => (
                <Card key={capa.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{capa.title}</CardTitle>
                    <CardDescription>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            capa.priority === "high"
                              ? "destructive"
                              : capa.priority === "medium"
                                ? "default"
                                : "outline"
                          }
                        >
                          {capa.priority.charAt(0).toUpperCase() + capa.priority.slice(1)} Priority
                        </Badge>
                        <span className="text-xs">Assigned: {capa.createdAt?.toDate().toLocaleDateString()}</span>
                        <span className="text-xs">Due: {capa.dueDate?.toDate().toLocaleDateString()}</span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-sm">
                        <p className="font-medium">Root Cause:</p>
                        <p>{capa.rootCause}</p>
                      </div>
                      <div className="text-sm">
                        <p className="font-medium">Corrective Actions:</p>
                        <ol className="list-decimal pl-5 space-y-1">
                          {capa.correctiveActions.map((action, index) => (
                            <li key={index}>{action}</li>
                          ))}
                        </ol>
                      </div>
                      <div className="text-sm">
                        <p className="font-medium">Preventive Actions:</p>
                        <ol className="list-decimal pl-5 space-y-1">
                          {capa.preventiveActions.map((action, index) => (
                            <li key={index}>{action}</li>
                          ))}
                        </ol>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          className="bg-primary-500 hover:bg-primary-600"
                          onClick={() => capa.id && handleDownload(capa.id)}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => capa.id && handlePrint(capa.id)}>
                          <Printer className="mr-2 h-4 w-4" />
                          Print
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All CAPA Documents</CardTitle>
              <CardDescription>View all available CAPA documents in the system.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-40 bg-gray-50 rounded-md">
                <p className="text-muted-foreground">All CAPA documents will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="archived">
          <Card>
            <CardHeader>
              <CardTitle>Archived CAPA Documents</CardTitle>
              <CardDescription>View archived CAPA documents.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-40 bg-gray-50 rounded-md">
                <p className="text-muted-foreground">Archived CAPA documents will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
