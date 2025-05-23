"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addProductionData } from "@/lib/firebase/firestore"

export default function DataInputPage() {
  const router = useRouter()
  const { toast } = useToast()

  // Form state variables
  const [product, setProduct] = useState("")
  const [batchNumber, setBatchNumber] = useState("")
  const [processStep, setProcessStep] = useState("")
  const [processDate, setProcessDate] = useState("")
  const [activeIngredientQuantity, setActiveIngredientQuantity] = useState("")
  const [excipientsQuantity, setExcipientsQuantity] = useState("")
  // Add these new state variables after the existing ones
  const [granulePorosity, setGranulePorosity] = useState("")
  const [moistureContent, setMoistureContent] = useState("")
  const [psdD10, setPsdD10] = useState("")
  const [psdD50, setPsdD50] = useState("")
  const [psdD90, setPsdD90] = useState("")
  const [psdSpan, setPsdSpan] = useState("")
  const [oosType, setOosType] = useState("")
  const [notes, setNotes] = useState("")

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    // Create process parameters object
    const processParameters = {
      activeIngredientQuantity: activeIngredientQuantity ? Number.parseFloat(activeIngredientQuantity) : null,
      excipientsQuantity: excipientsQuantity ? Number.parseFloat(excipientsQuantity) : null,
      granulePorosity: granulePorosity ? Number.parseFloat(granulePorosity) : null,
      moistureContent: moistureContent ? Number.parseFloat(moistureContent) : null,
      psdD10: psdD10 ? Number.parseFloat(psdD10) : null,
      psdD50: psdD50 ? Number.parseFloat(psdD50) : null,
      psdD90: psdD90 ? Number.parseFloat(psdD90) : null,
      psdSpan: psdSpan ? Number.parseFloat(psdSpan) : null,
    }

    // Create oos parameters object
    const oosParameters = {
      oosType: oosType || null,
    }

    // Create payload
    const payload = {
      product,
      batchNumber,
      processStep,
      processDate,
      processParameters,
      oosParameters,
      notes,
    }

    try {
      await addProductionData(payload)

      toast({
        title: "Data Submitted",
        description: "Your lab data has been successfully submitted.",
      })

    } catch (error) {
      console.error("Error submitting data:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      // Reset form
      setProduct("")
      setBatchNumber("")
      setProcessStep("")
      setProcessDate("")
      setActiveIngredientQuantity("")
      setExcipientsQuantity("")
      setGranulePorosity("")
      setMoistureContent("")
      setPsdD10("")
      setPsdD50("")
      setPsdD90("")
      setPsdSpan("")
      setOosType("")
      setNotes("")

      router.refresh()
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Data Input</CardTitle>
          <CardDescription>Enter production data for analysis.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList>
              <TabsTrigger value="general">General Information</TabsTrigger>
              <TabsTrigger value="process">Process Parameters</TabsTrigger>
              <TabsTrigger value="oos">OOS Parameters</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* General informations */}
              <TabsContent value="general" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="product">Product</Label>
                    <Input
                      id="product"
                      placeholder="Product Name"
                      value={product}
                      onChange={(e) => setProduct(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="batch-number">Batch Number</Label>
                    <Input
                      id="batch-number"
                      placeholder="Batch Number"
                      value={batchNumber}
                      onChange={(e) => setBatchNumber(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="process-step">Process Step</Label>
                    <Input
                      id="process-step"
                      placeholder="Process Step"
                      value={processStep}
                      onChange={(e) => setProcessStep(e.target.value)}
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
              </TabsContent>

              {/* Process Parameters Tab */}
              <TabsContent value="process" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="active-ingredient-quantity">Quantité principes actifs (mg)</Label>
                    <Input
                      id="active-ingredient-quantity"
                      type="number"
                      step="0.001"
                      placeholder="e.g., 500"
                      value={activeIngredientQuantity}
                      onChange={(e) => setActiveIngredientQuantity(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="excipients-quantity">Quantité excipients (mg)</Label>
                    <Input
                      id="excipients-quantity"
                      type="number"
                      step="0.001"
                      placeholder="e.g., 100"
                      value={excipientsQuantity}
                      onChange={(e) => setExcipientsQuantity(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="granule-porosity">Porosité des granules (%)</Label>
                    <Input
                      id="granule-porosity"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 35.5"
                      value={granulePorosity}
                      onChange={(e) => setGranulePorosity(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="moisture-content">Teneur en Humidité (%)</Label>
                    <Input
                      id="moisture-content"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 2.5"
                      value={moistureContent}
                      onChange={(e) => setMoistureContent(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="psd-d10">PSD_D10 (µm)</Label>
                    <Input
                      id="psd-d10"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 10.5"
                      value={psdD10}
                      onChange={(e) => setPsdD10(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="psd-d50">PSD_D50 (µm)</Label>
                    <Input
                      id="psd-d50"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 50.2"
                      value={psdD50}
                      onChange={(e) => setPsdD50(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="psd-d90">PSD_D90 (µm)</Label>
                    <Input
                      id="psd-d90"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 90.7"
                      value={psdD90}
                      onChange={(e) => setPsdD90(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="psd-span">PSD_Span</Label>
                    <Input
                      id="psd-span"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 1.6"
                      value={psdSpan}
                      onChange={(e) => setPsdSpan(e.target.value)}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* OOS params */}
              <TabsContent value="oos" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="oos-type">OOS Type</Label>
                    <Select onValueChange={setOosType}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select OOS Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="oos">OOS</SelectItem>
                        <SelectItem value="oot">OOT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              {/* Notes */}
              <TabsContent value="notes" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes or observations"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </TabsContent>

              <Button type="submit">Submit Data</Button>
            </form>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
