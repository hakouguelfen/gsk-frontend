"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { PermissionGuard } from "@/components/permission-guard"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Package, Clock, CheckCircle, XCircle } from "lucide-react"
import Image from "next/image"
import { getFabricationProcesses, saveLabAnalysisData } from "@/lib/firebase/firestore"

// Define form schema for lab analyst data
const formSchema = z.object({
  batchId: z.string().min(1, { message: "Please select a batch ID." }),
  equipmentId: z.string().min(1, { message: "Equipment ID is required." }),
  testLab: z.string().min(1, { message: "Equipment ID is required." }),
  equipmentAge: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Equipment age must be a positive number.",
  }),
  averageRetentionTime: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Average retention time must be a positive number.",
  }),
  standardsRSD: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100, {
    message: "RSD must be between 0 and 100%.",
  }),
  hplcPressure: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "HPLC pressure must be a positive number.",
  }),
  peakSurface: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Peak surface must be a positive number.",
  }),
  symmetryFactor: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Symmetry factor must be a positive number.",
  }),
})

const equipments: Record<string, number> = {
  "HPLC01": 30,
  "HPLC02": 20,
  "HPLC03": 25,
  "HPLC04": 74,
  "HPLC05": 15,
}

interface FabricationProcess {
  id: string
  batchNumber: string
  product_name: string
  product_type: string
  dateTime: string
  isAnalyzed: boolean
  isFabricated: boolean
}

export default function LabAnalystDataInput() {
  return (
    <PermissionGuard permission="lab-data:write">
      <DataInputForm />
    </PermissionGuard>
  )
}

function DataInputForm() {
  const { user } = useFirebase()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [fabricationProcesses, setFabricationProcesses] = useState<FabricationProcess[]>([])
  const [selectedProcess, setSelectedProcess] = useState<FabricationProcess | null>(null)

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      batchId: "",
      equipmentId: "",
      equipmentAge: "",
      testLab: "",
      averageRetentionTime: "",
      standardsRSD: "",
      hplcPressure: "",
      peakSurface: "",
      symmetryFactor: "",
    },
  })

  // Fetch fabrication processes where isAnalyzed = false
  useEffect(() => {
    const fetchFabricationProcesses = async () => {
      try {
        setIsLoading(true)
        const processes = await getFabricationProcesses()
        setFabricationProcesses(processes as FabricationProcess[])
      } catch (error) {
        console.error("Error fetching fabrication processes:", error)
        toast({
          title: "Error",
          description: "Failed to load fabrication processes.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchFabricationProcesses()
  }, [])

  // Handle batch selection
  const handleBatchSelection = async (batchId: string) => {
    const process = fabricationProcesses.find((p) => p.batchNumber === batchId)
    if (process) {
      setSelectedProcess(process)
      form.setValue("batchId", batchId)
    }
  }

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to submit data.",
        variant: "destructive",
      })
      return
    }

    if (!selectedProcess) {
      toast({
        title: "Selection Error",
        description: "Please select a batch ID first.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Save lab analysis data
      const labAnalysisData = {
        processId: selectedProcess.id,
        batchNumber: values.batchId,
        product: selectedProcess.product_name,
        testLab: values.testLab,
        equipmentId: values.equipmentId,
        equipmentAge: Number(equipments[values.equipmentId]),
        averageRetentionTime: Number(values.averageRetentionTime),
        standardsRSD: Number(values.standardsRSD),
        hplcPressure: Number(values.hplcPressure),
        peakSurface: Number(values.peakSurface),
        symmetryFactor: Number(values.symmetryFactor),
        analyzedBy: user.uid,
        analyzedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      }

      await saveLabAnalysisData(labAnalysisData)
      toast({
        title: "Data Submitted Successfully",
        description: `Lab analysis data for batch ${values.batchId} has been saved.`,
      })

      // Reset form and selection
      form.reset()
      setSelectedProcess(null)

      // Refresh the fabrication processes list
      setFabricationProcesses((prev) => prev.filter((p) => p.id !== selectedProcess.id))
    } catch (error) {
      console.error("Error submitting lab analysis data:", error)
      toast({
        title: "Submission Error",
        description: "There was an error submitting your data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get product image path
  const getProductImage = (product: string) => {
    const imageMap: { [key: string]: string } = {
      "Augmentin 30 ml PPSB pour nourrissant": "/images/augmentin30ml.png",
      "Augmentin 60ml PPSB pour enfant": "/images/augmentin60ml.png",
      "Augmentin 500mg sachet pour enfant": "/images/augmentin500mg.png",
      "Augmentin 1g sachet pour adulte": "/images/augmentin1g.png",
      "Augmentin 1g Comprimé": "/images/augmentin_comprime.png",
      "Clamoxyl 250 mg PPSB": "/images/clamoxyl250mg.png",
      "Clamoxyl 500 mg PPSB": "/images/clamoxyl500mg.png",
      "Clamoxyl 1g Comprimé": "/images/clamoxyl1g.png",
    }
    return imageMap[product] || "/placeholder.svg?height=200&width=200"
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Lab Analysis Data Input</h2>
        <p className="text-muted-foreground">Enter HPLC analysis data for fabricated batches.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side - Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Analysis Data Entry</CardTitle>
            <CardDescription>Enter the HPLC analysis parameters for the selected batch.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Batch ID Selection */}
                <FormField
                  control={form.control}
                  name="batchId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Batch ID</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value)
                          handleBatchSelection(value)
                        }}
                        value={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={isLoading ? "Loading batches..." : "Select a batch ID"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {fabricationProcesses.map((process) => (
                            <SelectItem key={process.id} value={process.batchNumber}>
                              {process.batchNumber} - {process.product_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Equipment ID */}
                  <FormField
                    control={form.control}
                    name="equipmentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Équipement</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select equipement" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="HPLC01">HPLC 01</SelectItem>
                            <SelectItem value="HPLC02">HPLC 02</SelectItem>
                            <SelectItem value="HPLC03">HPLC 03</SelectItem>
                            <SelectItem value="HPLC04">HPLC 04</SelectItem>
                            <SelectItem value="HPLC05">HPLC 05</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                {/* Test Lab */}
                  <FormField
                    control={form.control}
                    name="testLab"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Test Laboratoire</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select test" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="HPLC">HPLC</SelectItem>
                            <SelectItem value="PH">PH</SelectItem>
                            <SelectItem value="Dosage">Dosage</SelectItem>
                            <SelectItem value="Condectivite">Condectivite</SelectItem>
                            <SelectItem value="Impurite">Impurite</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                {/* Average Retention Time */}
                <FormField
                  control={form.control}
                  name="averageRetentionTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temps de rétention moyen (min)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.01" placeholder="e.g., 5.25" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Standards RSD */}
                <FormField
                  control={form.control}
                  name="standardsRSD"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RSD des étalons (%)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" max="100" step="0.01" placeholder="e.g., 1.5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* HPLC Pressure */}
                <FormField
                  control={form.control}
                  name="hplcPressure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pression HPLC (bar)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.1" placeholder="e.g., 150.5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Peak Surface */}
                <FormField
                  control={form.control}
                  name="peakSurface"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Surface Pic (u.a.)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.1" placeholder="e.g., 12500.8" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Symmetry Factor */}
                <FormField
                  control={form.control}
                  name="symmetryFactor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facteur Symétrie</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.01" placeholder="e.g., 1.05" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isSubmitting || !selectedProcess} className="w-full">
                  {isSubmitting ? "Submitting..." : "Submit Analysis Data"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Right Side - Batch Details */}
        <Card>
          <CardHeader>
            <CardTitle>Batch Information</CardTitle>
            <CardDescription>Details of the selected fabrication batch.</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedProcess ? (
              <div className="space-y-6">
                {/* Product Image */}
                <div className="flex justify-center">
                  <div className="relative w-48 h-48 rounded-lg overflow-hidden border-2 border-gray-200">
                    <Image
                      src={getProductImage(selectedProcess.product_name) || "/placeholder.svg"}
                      alt={selectedProcess.product_name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                </div>

                {/* Batch Details */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Batch ID:</span>
                    <Badge variant="outline" className="font-mono">
                      {selectedProcess.batchNumber}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Product:</span>
                    <span className="text-sm font-semibold">{selectedProcess.product_name}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Fabrication Date:</span>
                    <div className="flex items-center text-sm">
                      <CalendarDays className="w-4 h-4 mr-1 text-gray-400" />
                      {new Date(selectedProcess.dateTime).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Fabrication Time:</span>
                    <div className="flex items-center text-sm">
                      <Clock className="w-4 h-4 mr-1 text-gray-400" />
                      {new Date(selectedProcess.dateTime).toLocaleTimeString()}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Fabrication Status:</span>
                    <Badge variant={selectedProcess.isFabricated ? "default" : "secondary"}>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {selectedProcess.isFabricated ? "Fabricated" : "Pending"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Analysis Status:</span>
                    <Badge variant={selectedProcess.isAnalyzed ? "default" : "destructive"}>
                      {selectedProcess.isAnalyzed ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <XCircle className="w-3 h-3 mr-1" />
                      )}
                      {selectedProcess.isAnalyzed ? "Analyzed" : "Pending Analysis"}
                    </Badge>
                  </div>
                </div>

                {/* Analysis Instructions */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">Analysis Instructions:</h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Ensure HPLC system is calibrated before analysis</li>
                    <li>• Record all equipment parameters accurately</li>
                    <li>• Verify retention time consistency across runs</li>
                    <li>• Check RSD values are within acceptable limits</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 text-center">
                <Package className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-500 mb-2">No Batch Selected</h3>
                <p className="text-sm text-gray-400 max-w-sm">
                  Please select a batch ID from the dropdown to view fabrication details and enter analysis data.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
