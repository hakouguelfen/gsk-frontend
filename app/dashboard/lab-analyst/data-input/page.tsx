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

// Define form schema
const formSchema = z.object({
  productName: z.string().min(2, { message: "Product name must be at least 2 characters." }),
  batchNumber: z.string().min(2, { message: "Batch number must be at least 2 characters." }),
  testType: z.string().min(1, { message: "Please select a test type." }),
  testDate: z.string().min(1, { message: "Please select a test date." }),
  amoxicillin: z.string().refine((val) => !isNaN(Number.parseFloat(val)), {
    message: "Amoxicillin must be a number.",
  }),
  clavulanicAcid: z.string().refine((val) => !isNaN(Number.parseFloat(val)), {
    message: "Clavulanic acid must be a number.",
  }),
  impurities: z.string().refine((val) => !isNaN(Number.parseFloat(val)), {
    message: "Impurities must be a number.",
  }),
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
      amoxicillin: "",
      clavulanicAcid: "",
      impurities: "",
      notes: "",
    },
  })

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

    setIsSubmitting(true)

    try {
      // Format data for submission
      const labData = {
        productName: values.productName,
        batchNumber: values.batchNumber,
        testType: values.testType,
        testDate: values.testDate,
        testResults: {
          amoxicillin: Number.parseFloat(values.amoxicillin),
          clavulanicAcid: Number.parseFloat(values.clavulanicAcid),
          impurities: Number.parseFloat(values.impurities),
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
            <CardContent className="space-y-4">
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
                  name="batchNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Batch Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. B12345" {...field} />
                      </FormControl>
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
                      <FormLabel>Test Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select test type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="HPLC">HPLC</SelectItem>
                          <SelectItem value="Dissolution">Dissolution</SelectItem>
                          <SelectItem value="Content Uniformity">Content Uniformity</SelectItem>
                          <SelectItem value="Impurity Profile">Impurity Profile</SelectItem>
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

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="amoxicillin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amoxicillin (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g. 99.5" {...field} />
                      </FormControl>
                      <FormDescription>Target: 95.0-105.0%</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="clavulanicAcid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clavulanic Acid (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g. 98.2" {...field} />
                      </FormControl>
                      <FormDescription>Target: 95.0-105.0%</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="impurities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Impurities (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g. 0.2" {...field} />
                      </FormControl>
                      <FormDescription>Limit: NMT 0.5%</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
