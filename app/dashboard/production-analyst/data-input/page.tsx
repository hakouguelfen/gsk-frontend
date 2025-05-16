"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { addProductionData } from "@/lib/firebase/firestore"

export default function ProductionDataInput() {
  const { user } = useFirebase()
  const [isLoading, setIsLoading] = useState(false)

  // Production data form state
  const [product, setProduct] = useState("")
  const [batchNumber, setBatchNumber] = useState("")
  const [processStep, setProcessStep] = useState("")
  const [processDate, setProcessDate] = useState("")
  const [mixingTime, setMixingTime] = useState("")
  const [temperature, setTemperature] = useState("")
  const [pressure, setPressure] = useState("")
  const [notes, setNotes] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to submit data",
        variant: "destructive",
      })
      return
    }

    if (!product || !batchNumber || !processStep || !processDate || !mixingTime || !temperature) {
      toast({
        title: "Submission failed",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Create process parameters object
      const processParameters = {
        mixingTime: Number.parseFloat(mixingTime),
        temperature: Number.parseFloat(temperature),
        pressure: pressure ? Number.parseFloat(pressure) : null,
      }

      // Add data to Firestore
      await addProductionData({
        productName: product,
        batchNumber,
        processStep,
        processDate,
        processParameters,
        notes,
        createdBy: user.uid,
      })

      toast({
        title: "Production data submitted",
        description: `Production data for ${product} (Batch: ${batchNumber}) has been submitted successfully.`,
      })

      // Reset form
      setProduct("")
      setBatchNumber("")
      setProcessStep("")
      setProcessDate("")
      setMixingTime("")
      setTemperature("")
      setPressure("")
      setNotes("")
    } catch (error) {
      console.error("Error submitting production data:", error)
      toast({
        title: "Submission failed",
        description: "An error occurred while submitting the data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Production Data Input</h2>
        <p className="text-muted-foreground">Enter production process data and parameters.</p>
      </div>

      <Tabs defaultValue="mixing" className="space-y-4">
        <TabsList>
          <TabsTrigger value="mixing">Mixing Process</TabsTrigger>
          <TabsTrigger value="filling">Filling Process</TabsTrigger>
          <TabsTrigger value="packaging">Packaging Process</TabsTrigger>
        </TabsList>

        <TabsContent value="mixing">
          <Card>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Mixing Process Data</CardTitle>
                <CardDescription>Enter mixing process parameters for pharmaceutical products.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="product">Product</Label>
                    <Select value={product} onValueChange={setProduct} required>
                      <SelectTrigger id="product">
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="augmentin-60ml">Augmentin 60ml</SelectItem>
                        <SelectItem value="augmentin-1g">Augmentin 1g</SelectItem>
                        <SelectItem value="augmentin-500mg">Augmentin 500mg</SelectItem>
                        <SelectItem value="clamoxyl-500mg">Clamoxyl 500mg</SelectItem>
                        <SelectItem value="clamoxyl-250mg">Clamoxyl 250mg</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="process-step">Process Step</Label>
                    <Select value={processStep} onValueChange={setProcessStep} required>
                      <SelectTrigger id="process-step">
                        <SelectValue placeholder="Select process step" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="initial-mixing">Initial Mixing</SelectItem>
                        <SelectItem value="homogenization">Homogenization</SelectItem>
                        <SelectItem value="final-mixing">Final Mixing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="batch-number">Batch Number</Label>
                    <Input
                      id="batch-number"
                      placeholder="e.g., A2023-45"
                      value={batchNumber}
                      onChange={(e) => setBatchNumber(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="process-date">Process Date</Label>
                    <Input
                      id="process-date"
                      type="date"
                      value={processDate}
                      onChange={(e) => setProcessDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mixing-time">Mixing Time (minutes)</Label>
                  <Input
                    id="mixing-time"
                    type="number"
                    placeholder="e.g., 30"
                    value={mixingTime}
                    onChange={(e) => setMixingTime(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature (°C)</Label>
                  <Input
                    id="temperature"
                    type="number"
                    placeholder="e.g., 25.5"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pressure">Pressure (bar)</Label>
                  <Input
                    id="pressure"
                    type="number"
                    placeholder="e.g., 1.2"
                    value={pressure}
                    onChange={(e) => setPressure(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Enter any additional observations or notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="bg-primary-500 hover:bg-primary-600" disabled={isLoading}>
                  {isLoading ? "Submitting..." : "Submit Production Data"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="filling">
          <Card>
            <CardHeader>
              <CardTitle>Filling Process Data</CardTitle>
              <CardDescription>Enter filling process parameters for pharmaceutical products.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-40 bg-gray-50 rounded-md">
                <p className="text-muted-foreground">Filling process form will be implemented here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="packaging">
          <Card>
            <CardHeader>
              <CardTitle>Packaging Process Data</CardTitle>
              <CardDescription>Enter packaging process parameters for pharmaceutical products.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-40 bg-gray-50 rounded-md">
                <p className="text-muted-foreground">Packaging process form will be implemented here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
