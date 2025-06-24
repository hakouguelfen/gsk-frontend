"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Package, Calendar, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { getFabricationProcesses } from "@/lib/firebase/firestore"
import Image from "next/image"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { saveFabricationData } from "./server"
import { FabricationProcess } from "../../manager/fabrication/server"

interface FormData {
  batchId: string
  quantitePrincipesActifs: string
  quantiteExcipients: string
  porositeDGranules: string
  teneurEnHumidite: string
  psd_D10: string
  psd_D50: string
  psd_D90: string
  psd_Span: string
}

const initialFormData: FormData = {
  batchId: "",
  quantitePrincipesActifs: "",
  quantiteExcipients: "",
  porositeDGranules: "",
  teneurEnHumidite: "",
  psd_D10: "",
  psd_D50: "",
  psd_D90: "",
  psd_Span: "",
}

const productImages: Record<string, string> = {
  "Augmentin 30 ml PPSB pour nourrissant": "/images/augmentin30ml.png",
  "Augmentin 60ml PPSB pour enfant": "/images/augmentin60ml.png",
  "Augmentin 500mg sachet pour enfant": "/images/augmentin500mg.png",
  "Augmentin 1g sachet pour adulte": "/images/augmentin1g.png",
  "Augmentin 1g Comprimé": "/images/augmentin_comprime.png",
  "Clamoxyl 250 mg PPSB": "/images/clamoxyl250mg.png",
  "Clamoxyl 500 mg PPSB": "/images/clamoxyl500mg.png",
  "Clamoxyl 1g Comprimé": "/images/clamoxyl1g.png",
}

export default function ProductionDataInputPage() {
  const { user } = useFirebase()
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [fabricationProcesses, setFabricationProcesses] = useState<FabricationProcess[]>([])
  const [selectedProcess, setSelectedProcess] = useState<FabricationProcess | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const { toast } = useToast()

  useEffect(() => {
    loadFabricationProcesses()
  }, [])

  const loadFabricationProcesses = async () => {
    try {
      setLoading(true)
      const processes = await getFabricationProcesses()
      setFabricationProcesses(processes as FabricationProcess[])
    } catch (error) {
      console.error("Error loading fabrication processes:", error)
      toast({
        title: "Error",
        description: "Failed to load fabrication processes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBatchSelect = (batchId: string) => {
    const process = fabricationProcesses.find((p) => p.batchNumber === batchId)
    setSelectedProcess(process || null)
    setFormData({ ...formData, batchId })
    setErrors({})
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData({ ...formData, [field]: value })
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    if (!formData.batchId) newErrors.batchId = "Batch ID is required"
    if (!formData.quantitePrincipesActifs) newErrors.quantitePrincipesActifs = "Required"
    if (!formData.quantiteExcipients) newErrors.quantiteExcipients = "Required"
    if (!formData.porositeDGranules) newErrors.porositeDGranules = "Required"
    if (!formData.teneurEnHumidite) newErrors.teneurEnHumidite = "Required"
    if (!formData.psd_D10) newErrors.psd_D10 = "Required"
    if (!formData.psd_D50) newErrors.psd_D50 = "Required"
    if (!formData.psd_D90) newErrors.psd_D90 = "Required"
    if (!formData.psd_Span) newErrors.psd_Span = "Required"

    // Validate numeric ranges
    const porosity = Number.parseFloat(formData.porositeDGranules)
    if (porosity && (porosity < 0 || porosity > 100)) {
      newErrors.porositeDGranules = "Must be between 0-100%"
    }

    const humidity = Number.parseFloat(formData.teneurEnHumidite)
    if (humidity && (humidity < 0 || humidity > 100)) {
      newErrors.teneurEnHumidite = "Must be between 0-100%"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Authentication Error",
        description: "Please log in again",
        variant: "destructive",
      })
      return
    }
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please correct the errors in the form",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)

      const dataToSave = {
        processId: selectedProcess?.id,
        batchNumber: formData.batchId,
        quantitePrincipesActifs: Number.parseFloat(formData.quantitePrincipesActifs),
        quantiteExcipients: Number.parseFloat(formData.quantiteExcipients),
        porositeDGranules: Number.parseFloat(formData.porositeDGranules),
        teneurEnHumidite: Number.parseFloat(formData.teneurEnHumidite),
        psd_D10: Number.parseFloat(formData.psd_D10),
        psd_D50: Number.parseFloat(formData.psd_D50),
        psd_D90: Number.parseFloat(formData.psd_D90),
        psd_Span: Number.parseFloat(formData.psd_Span),
        product: selectedProcess?.product_name,
        submittedBy: user.uid,
      }
      await saveFabricationData(dataToSave)

      toast({
        title: "Success",
        description: "Production data saved successfully",
      })

      // Reset form and reload processes
      setFormData(initialFormData)
      setSelectedProcess(null)
      await loadFabricationProcesses()
    } catch (error) {
      console.error("Error saving data:", error)
      toast({
        title: "Error",
        description: "Failed to save production data",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Production Data Input</h1>
        <p className="text-gray-600 mt-2">Enter production parameters for fabrication batches</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side - Input Form */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Production Parameters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Batch ID Selection */}
              <div className="space-y-2">
                <Label htmlFor="batchId">Batch ID *</Label>
                <Select value={formData.batchId} onValueChange={handleBatchSelect}>
                  <SelectTrigger className={errors.batchId ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select a batch ID" />
                  </SelectTrigger>
                  <SelectContent>
                    {fabricationProcesses.map((process) => (
                      <SelectItem key={process.id} value={process.batchNumber}>
                        {`${process.batchNumber} - ${process.product_name} `}
                        {process.isFabricated && (
                          <Badge variant={"default" }>
                            Fabricated
                          </Badge>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.batchId && <p className="text-sm text-red-500">{errors.batchId}</p>}
              </div>

              <Separator />

              {/* Production Parameters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantitePrincipesActifs">Quantité principes actifs (mg) *</Label>
                  <Input
                    id="quantitePrincipesActifs"
                    type="number"
                    step="0.01"
                    value={formData.quantitePrincipesActifs}
                    onChange={(e) => handleInputChange("quantitePrincipesActifs", e.target.value)}
                    className={errors.quantitePrincipesActifs ? "border-red-500" : ""}
                    placeholder="Enter quantity"
                  />
                  {errors.quantitePrincipesActifs && (
                    <p className="text-sm text-red-500">{errors.quantitePrincipesActifs}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantiteExcipients">Quantité excipients (mg) *</Label>
                  <Input
                    id="quantiteExcipients"
                    type="number"
                    step="0.01"
                    value={formData.quantiteExcipients}
                    onChange={(e) => handleInputChange("quantiteExcipients", e.target.value)}
                    className={errors.quantiteExcipients ? "border-red-500" : ""}
                    placeholder="Enter quantity"
                  />
                  {errors.quantiteExcipients && <p className="text-sm text-red-500">{errors.quantiteExcipients}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="porositeDGranules">Porosité des granules (%) *</Label>
                  <Input
                    id="porositeDGranules"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.porositeDGranules}
                    onChange={(e) => handleInputChange("porositeDGranules", e.target.value)}
                    className={errors.porositeDGranules ? "border-red-500" : ""}
                    placeholder="0-100%"
                  />
                  {errors.porositeDGranules && <p className="text-sm text-red-500">{errors.porositeDGranules}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teneurEnHumidite">Teneur en Humidité (%) *</Label>
                  <Input
                    id="teneurEnHumidite"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.teneurEnHumidite}
                    onChange={(e) => handleInputChange("teneurEnHumidite", e.target.value)}
                    className={errors.teneurEnHumidite ? "border-red-500" : ""}
                    placeholder="0-100%"
                  />
                  {errors.teneurEnHumidite && <p className="text-sm text-red-500">{errors.teneurEnHumidite}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="psd_D10">PSD_D10 (µm) *</Label>
                  <Input
                    id="psd_D10"
                    type="number"
                    step="0.01"
                    value={formData.psd_D10}
                    onChange={(e) => handleInputChange("psd_D10", e.target.value)}
                    className={errors.psd_D10 ? "border-red-500" : ""}
                    placeholder="Enter value"
                  />
                  {errors.psd_D10 && <p className="text-sm text-red-500">{errors.psd_D10}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="psd_D50">PSD_D50 (µm) *</Label>
                  <Input
                    id="psd_D50"
                    type="number"
                    step="0.01"
                    value={formData.psd_D50}
                    onChange={(e) => handleInputChange("psd_D50", e.target.value)}
                    className={errors.psd_D50 ? "border-red-500" : ""}
                    placeholder="Enter value"
                  />
                  {errors.psd_D50 && <p className="text-sm text-red-500">{errors.psd_D50}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="psd_D90">PSD_D90 (µm) *</Label>
                  <Input
                    id="psd_D90"
                    type="number"
                    step="0.01"
                    value={formData.psd_D90}
                    onChange={(e) => handleInputChange("psd_D90", e.target.value)}
                    className={errors.psd_D90 ? "border-red-500" : ""}
                    placeholder="Enter value"
                  />
                  {errors.psd_D90 && <p className="text-sm text-red-500">{errors.psd_D90}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="psd_Span">PSD_Span *</Label>
                  <Input
                    id="psd_Span"
                    type="number"
                    step="0.01"
                    value={formData.psd_Span}
                    onChange={(e) => handleInputChange("psd_Span", e.target.value)}
                    className={errors.psd_Span ? "border-red-500" : ""}
                    placeholder="Enter value"
                  />
                  {errors.psd_Span && <p className="text-sm text-red-500">{errors.psd_Span}</p>}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Production Data"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right Side - Fabrication Process Details */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Fabrication Process Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedProcess ? (
              <div className="space-y-6">
                {/* Product Image */}
                <div className="flex justify-center">
                  <div className="relative w-48 h-48 bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={productImages[selectedProcess.product_name] || "/placeholder.svg?height=192&width=192"}
                      alt={selectedProcess.product_name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Process Information */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Batch ID:</span>
                    <Badge variant="outline" className="font-mono">
                      {selectedProcess.batchNumber}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Product:</span>
                    <span className="text-gray-900">{selectedProcess.product_name}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Date/Time:</span>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-gray-900">
                        <Calendar className="h-4 w-4" />
                        {new Date(selectedProcess.dateTime).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1 text-gray-600 text-sm">
                        <Clock className="h-3 w-3" />
                        {new Date(selectedProcess.dateTime).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Fabrication Status:</span>
                      <Badge variant={selectedProcess.isFabricated ? "default" : "secondary"}>
                        {selectedProcess.isFabricated ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Fabricated
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Pending
                          </>
                        )}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Lab Testing Status:</span>
                      <Badge variant={selectedProcess.isAnalyzed ? "default" : "secondary"}>
                        {selectedProcess.isAnalyzed ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Analyzed
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Pending
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Package className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">No Batch Selected</p>
                <p className="text-sm">Select a batch ID to view fabrication details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
