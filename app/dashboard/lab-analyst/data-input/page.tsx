"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { addLabData } from "@/lib/firebase/firestore"
import { PermissionGuard } from "@/components/permission-guard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Define form schema
const formSchema = z.object({
  // Basic information
  productName: z.string().min(2, { message: "Product name must be at least 2 characters." }),
  batchNumber: z.string().min(2, { message: "Batch number must be at least 2 characters." }),
  testType: z.string().min(1, { message: "Please select a test type." }),
  testDate: z.string().min(1, { message: "Please select a test date." }),

  // New fields - Dates and times
  occurrenceDate: z.string().min(1, { message: "Please select an occurrence date." }),
  occurrenceTime: z.string().min(1, { message: "Please enter an occurrence time." }),
  investigationClosureDate: z.string().optional(),
  leadTime: z.string().optional(),

  // Product details
  controlledProduct: z.string().min(1, { message: "Please enter the controlled product." }),
  productType: z.string().min(1, { message: "Please select a product type." }),

  // Equipment details
  equipmentId: z.string().min(1, { message: "Please enter the equipment ID." }),
  subEquipment: z.string().optional(),
  equipmentAge: z
    .string()
    .refine((val) => !val || !isNaN(Number(val)), {
      message: "Equipment age must be a number.",
    })
    .optional(),

  // Lab conditions
  labTemperature: z
    .string()
    .refine((val) => !val || !isNaN(Number(val)), {
      message: "Lab temperature must be a number.",
    })
    .optional(),
  labHumidity: z
    .string()
    .refine((val) => !val || !isNaN(Number(val)), {
      message: "Lab humidity must be a number.",
    })
    .optional(),

  // HPLC parameters
  averageRetentionTime: z
    .string()
    .refine((val) => !val || !isNaN(Number(val)), {
      message: "Average retention time must be a number.",
    })
    .optional(),
  standardsRSD: z
    .string()
    .refine((val) => !val || !isNaN(Number(val)), {
      message: "RSD of standards must be a number.",
    })
    .optional(),
  hplcPressure: z
    .string()
    .refine((val) => !val || !isNaN(Number(val)), {
      message: "HPLC pressure must be a number.",
    })
    .optional(),
  peakArea: z
    .string()
    .refine((val) => !val || !isNaN(Number(val)), {
      message: "Peak area must be a number.",
    })
    .optional(),
  symmetryFactor: z
    .string()
    .refine((val) => !val || !isNaN(Number(val)), {
      message: "Symmetry factor must be a number.",
    })
    .optional(),

  // Additional information
  notes: z.string().optional(),
})

export default function LabAnalystDataInput() {
  return (
    <PermissionGuard permission="lab-data:write">
      <DataInputForm />
    </PermissionGuard>
  )
}

function DataInputForm() {
  const { user } = useFirebase()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productName: "",
      batchNumber: "",
      testType: "",
      testDate: new Date().toISOString().split("T")[0],
      occurrenceDate: new Date().toISOString().split("T")[0],
      occurrenceTime: new Date().toTimeString().split(" ")[0].substring(0, 5),
      investigationClosureDate: "",
      leadTime: "",
      controlledProduct: "",
      productType: "",
      equipmentId: "",
      subEquipment: "",
      equipmentAge: "",
      labTemperature: "",
      labHumidity: "",
      averageRetentionTime: "",
      standardsRSD: "",
      hplcPressure: "",
      peakArea: "",
      symmetryFactor: "",
      notes: "",
    },
  })

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log("hola")
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to submit data.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Format data for submission
      const labData = {
        // Basic information
        productName: values.productName,
        batchNumber: values.batchNumber,
        testType: values.testType,
        testDate: values.testDate,

        // New fields
        occurrenceDetails: {
          date: values.occurrenceDate,
          time: values.occurrenceTime,
          investigationClosureDate: values.investigationClosureDate || null,
          leadTime: values.leadTime || null,
        },

        productDetails: {
          controlledProduct: values.controlledProduct,
          productType: values.productType,
        },

        equipmentDetails: {
          equipmentId: values.equipmentId,
          subEquipment: values.subEquipment || null,
          equipmentAge: values.equipmentAge ? Number(values.equipmentAge) : null,
        },

        labConditions: {
          temperature: values.labTemperature ? Number(values.labTemperature) : null,
          humidity: values.labHumidity ? Number(values.labHumidity) : null,
        },

        hplcParameters: {
          averageRetentionTime: values.averageRetentionTime ? Number(values.averageRetentionTime) : null,
          standardsRSD: values.standardsRSD ? Number(values.standardsRSD) : null,
          pressure: values.hplcPressure ? Number(values.hplcPressure) : null,
          peakArea: values.peakArea ? Number(values.peakArea) : null,
          symmetryFactor: values.symmetryFactor ? Number(values.symmetryFactor) : null,
        },

        notes: values.notes,
        createdBy: user.uid,
      }

      // Submit data
      await addLabData(labData)

      toast({
        title: "Data Submitted",
        description: "Your lab data has been successfully submitted.",
      })

      // Reset form
      form.reset()

      // Redirect to dashboard
      router.push("/dashboard/lab-analyst")
    } catch (error) {
      console.error("Error submitting lab data:", error)
      toast({
        title: "Submission Error",
        description: "There was an error submitting your data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">HPLC Data Input</h2>
        <p className="text-muted-foreground">Enter laboratory test results for quality control.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Results Form</CardTitle>
          <CardDescription>Enter the details of your laboratory analysis.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="basic">Basic Information</TabsTrigger>
                  <TabsTrigger value="equipment">Equipment & Conditions</TabsTrigger>
                  <TabsTrigger value="hplc">HPLC Parameters</TabsTrigger>
                  <TabsTrigger value="results">Test Results</TabsTrigger>
                </TabsList>

                {/* Basic Information Tab */}
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="productName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Amoxicillin/Clavulanate" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="controlledProduct"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Produit contrôlé</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select product controle" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Augmentin 30 ml PPSB pour nourrissant">Augmentin 30 ml PPSB pour nourrissant</SelectItem>
                              <SelectItem value="Augmentin 60ml PPSB pour enfant">Augmentin 60ml PPSB pour enfant</SelectItem>
                              <SelectItem value="Augmentin 500mg sachet pour enfant">Augmentin 500mg sachet pour enfant</SelectItem>
                              <SelectItem value="Augmentin 1g sachet pour adulte">Augmentin 1g sachet pour adulte</SelectItem>
                              <SelectItem value="Augmentin 1g Comprimé">Augmentin 1g Comprimé</SelectItem>
                              <SelectItem value="Clamoxyl 250 mg PPSB">Clamoxyl 250 mg PPSB</SelectItem>
                              <SelectItem value="Clamoxyl 500 mg PPSB">Clamoxyl 500 mg PPSB</SelectItem>
                              <SelectItem value="Clamoxyl 1g Comprimé">Clamoxyl 1g Comprimé</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="batchNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>N° de Lot</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. B12345" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="productType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type de produit</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select product type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="comprimé">Comprimé</SelectItem>
                              <SelectItem value="sachet">Sachet</SelectItem>
                              <SelectItem value="suspension">Suspension</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="testType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Test Laboratoire</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select test type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="HPLC">HPLC</SelectItem>
                              <SelectItem value="pH">pH</SelectItem>
                              <SelectItem value="Dissolution">Dissolution</SelectItem>
                              <SelectItem value="Uniformité de masse">Uniformité de masse</SelectItem>
                              <SelectItem value="Assay">Assay</SelectItem>
                              <SelectItem value="Hardness">Hardness</SelectItem>
                              <SelectItem value="Viscosité">Viscosité</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="testDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Test Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="occurrenceDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date d&apos;occurrence</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="occurrenceTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Heure d&apos;occurrence</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="investigationClosureDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date de clôture d&apos;investigation</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="leadTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lead time (jours)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                {/* Equipment & Conditions Tab */}
                <TabsContent value="equipment" className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                    <FormField
                      control={form.control}
                      name="equipmentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ID Équipement</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select HPLC Id" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="HPLC01">HPLC01</SelectItem>
                              <SelectItem value="HPLC02">HPLC02</SelectItem>
                              <SelectItem value="HPLC03">HPLC03</SelectItem>
                              <SelectItem value="HPLC04">HPLC04</SelectItem>
                              <SelectItem value="HPLC05">HPLC05</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="subEquipment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sous-Équipement</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Column C18" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="equipmentAge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Âge Équipement (mois)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="labTemperature"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Température Laboratoire (°C)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="labHumidity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Humidité Laboratoire (%)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                {/* HPLC Parameters Tab */}
                <TabsContent value="hplc" className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="averageRetentionTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Temps de rétention moyen (min)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="standardsRSD"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>RSD des étalons (%)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="hplcPressure"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pression HPLC (bar)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="peakArea"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Surface Pic (u.a.)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="symmetryFactor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Facteur Symétrie</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                {/* Test Results Tab */}
                <TabsContent value="results" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter any additional observations or notes" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Data"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
}

