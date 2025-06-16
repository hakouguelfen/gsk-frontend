"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CalendarIcon, CheckCircle, AlertCircle, Factory, Eye, Package, Clock, Filter, Search } from "lucide-react"

import Image from "next/image"
import { addFabricationProcess, FabricationProcess } from "./server"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { getFabricationProcesses } from "@/lib/firebase/firestore"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

// Predefined products with their images
const PRODUCTS = [
  {
    id: "Augmentin-30ml",
    name: "Augmentin 30 ml PPSB pour nourrissant",
    product_type: "Suspension",
    image: "/images/augmentin30ml.png",
  },
  {
    id: "Augmentin-60ml",
    name: "Augmentin 60ml PPSB pour enfant",
    product_type: "Suspension",
    image: "/images/augmentin60ml.png",
  },
  {
    id: "Augmentin-500mg",
    name: "Augmentin 500mg sachet pour enfant",
    product_type: "Sachet",
    image: "/images/augmentin500mg.png",
  },
  {
    id: "Augmentin-1g-sachet",
    name: "Augmentin 1g sachet pour adulte",
    product_type: "Sachet",
    image: "/images/augmentin1g.png",
  },
  {
    id: "Augmentin-1g-comprimé",
    name: "Augmentin 1g Comprimé",
    product_type: "Comprimé",
    image: "/images/augmentin_comprime.png",
  },
  {
    id: "Clamoxyl-250mg",
    name: "Clamoxyl 250 mg PPSB",
    product_type: "Suspension",
    image: "/images/clamoxyl250mg.png",
  },
  {
    id: "Clamoxyl-500mg",
    name: "Clamoxyl 500 mg PPSB",
    product_type: "Suspension",
    image: "/images/clamoxyl500mg.png",
  },
  {
    id: "Clamoxyl-1g",
    name: "Clamoxyl 1g Comprimé",
    product_type: "Comprimé",
    image: "/images/clamoxyl1g.png",
  },
]

export default function FabricationPage() {
  const { user } = useFirebase()
  const [batchId, setBatchId] = useState("")
  const [dateTime, setDateTime] = useState(() => {
    const now = new Date()
    return now.toISOString().slice(0, 16) // Format for datetime-local input
  })
  const [selectedProduct, setSelectedProduct] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})


  const [activeTab, setActiveTab] = useState('fabrication');
  const [fabricationHistory, setFabricationProcesses] = useState<FabricationProcess[]>([]);
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)

  useEffect(() => {
    loadFabricationHistory()
  }, [])

  const loadFabricationHistory = async () => {
    try {
      setIsLoadingHistory(true)
      const processes = await getFabricationProcesses()
      setFabricationProcesses(processes as FabricationProcess[])
    } catch (error) {
      console.error("Error loading fabrication history:", error)
    } finally {
      setIsLoadingHistory(false)
    }
  }


  // Validation functions
  const validateBatchId = (id: string): boolean => {
    const batchIdRegex = /^[A-Z]{2}\d{2}$/
    return batchIdRegex.test(id)
  }

  const validateDateTime = (dateTimeStr: string): boolean => {
    const selectedDate = new Date(dateTimeStr)
    const now = new Date()
    return selectedDate >= now
  }

  const handleBatchIdChange = (value: string) => {
    const upperValue = value.toUpperCase()
    setBatchId(upperValue)

    if (upperValue && !validateBatchId(upperValue)) {
      setErrors((prev) => ({
        ...prev,
        batchId: "Batch ID must be 2 letters followed by 2 numbers (e.g., AB12)",
      }))
    } else {
      setErrors((prev) => {
        const { batchId, ...rest } = prev
        return rest
      })
    }
  }

  const handleDateTimeChange = (value: string) => {
    setDateTime(value)

    if (value && !validateDateTime(value)) {
      setErrors((prev) => ({
        ...prev,
        dateTime: "Date and time cannot be in the past",
      }))
    } else {
      setErrors((prev) => {
        const { dateTime, ...rest } = prev
        return rest
      })
    }
  }

  const handleProductChange = (productId: string) => {
    setSelectedProduct(productId)
    if (productId) {
      setErrors((prev) => {
        const { product, ...rest } = prev
        return rest
      })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!batchId) {
      newErrors.batchId = "Batch ID is required"
    } else if (!validateBatchId(batchId)) {
      newErrors.batchId = "Batch ID must be 2 letters followed by 2 numbers (e.g., AB12)"
    }

    if (!dateTime) {
      newErrors.dateTime = "Date and time is required"
    } else if (!validateDateTime(dateTime)) {
      newErrors.dateTime = "Date and time cannot be in the past"
    }

    if (!selectedProduct) {
      newErrors.product = "Product selection is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !user) {
      return
    }

    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      const fabricationProcess: FabricationProcess = {
        batchNumber: batchId,
        dateTime,
        product_name: selectedProductData?.name ?? "",
        product_type: selectedProductData?.product_type ?? "",
        isTested: false,
        isAnalyzed: false,
        isFabricated: false,
        createdAt: new Date(),
        createdBy: user.uid,
      }

      await addFabricationProcess(fabricationProcess)
      setSubmitStatus("success")

      // Reset form
      setBatchId("")
      setDateTime(() => {
        const now = new Date()
        return now.toISOString().slice(0, 16)
      })
      setSelectedProduct("")
      setErrors({})
    } catch (error) {
      console.error("Error creating fabrication process:", error)
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedProductData = PRODUCTS.find((p) => p.id === selectedProduct)

  const getStatusBadge = (process: FabricationProcess) => {
    if (process.isAnalyzed && process.isFabricated) {
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>
    } else if (process.isFabricated) {
      return <Badge className="bg-blue-100 text-blue-800">Awaiting Analysis</Badge>
    } else {
      return <Badge className="bg-yellow-100 text-yellow-800">Pending Fabrication</Badge>
    }
  }

  const getProductName = (productName: string) => {
    return PRODUCTS.find((p) => p.name === productName)?.name || productName
  }

  // Filter history based on search and status
  const filteredHistory = fabricationHistory.filter((process) => {
    const matchesSearch =
      process.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getProductName(process.product_name).toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" && !process.isFabricated) ||
      (statusFilter === "fabricated" && process.isFabricated && !process.isAnalyzed) ||
      (statusFilter === "completed" && process.isAnalyzed && process.isFabricated)

    return matchesSearch && matchesStatus
  })

  return (
    <div className="mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Factory className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Fabrication Process Initiation</h1>
        </div>
        <p className="text-gray-600">Start a new medicament fabrication process</p>
      </div>


      <Tabs defaultValue="rootCause" value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList>
                <TabsTrigger value="fabrication">Launch Fabrication Process</TabsTrigger>
                <TabsTrigger value="history">Fabrication History</TabsTrigger>
            </TabsList>

            <TabsContent value="fabrication" className="space-y-4">
              <Card className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Form Section */}
                  <div className="lg:col-span-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>New Fabrication Process</CardTitle>
                        <CardDescription>Enter the details to initiate a new fabrication batch</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                          {/* Batch ID */}
                          <div className="space-y-2">
                            <Label htmlFor="batchId">
                              Batch ID <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="batchId"
                              value={batchId}
                              onChange={(e) => handleBatchIdChange(e.target.value)}
                              placeholder="AB12"
                              maxLength={4}
                              className={errors.batchId ? "border-red-500" : ""}
                            />
                            {errors.batchId && (
                              <p className="text-sm text-red-500 flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" />
                                {errors.batchId}
                              </p>
                            )}
                            <p className="text-sm text-gray-500">Format: 2 letters followed by 2 numbers (e.g., AB12)</p>
                          </div>

                          {/* Date and Time */}
                          <div className="space-y-2">
                            <Label htmlFor="dateTime">
                              Fabrication Start Date & Time <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                              <Input
                                id="dateTime"
                                type="datetime-local"
                                value={dateTime}
                                onChange={(e) => handleDateTimeChange(e.target.value)}
                                min={new Date().toISOString().slice(0, 16)}
                                className={errors.dateTime ? "border-red-500" : ""}
                              />
                              <CalendarIcon className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                            </div>
                            {errors.dateTime && (
                              <p className="text-sm text-red-500 flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" />
                                {errors.dateTime}
                              </p>
                            )}
                          </div>

                          {/* Product Selection */}
                          <div className="space-y-2">
                            <Label htmlFor="product">
                              Medicament Product <span className="text-red-500">*</span>
                            </Label>
                            <Select value={selectedProduct} onValueChange={handleProductChange}>
                              <SelectTrigger className={errors.product ? "border-red-500" : ""}>
                                <SelectValue placeholder="Select a medicament product" />
                              </SelectTrigger>
                              <SelectContent>
                                {PRODUCTS.map((product) => (
                                  <SelectItem key={product.id} value={product.id}>
                                    {product.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.product && (
                              <p className="text-sm text-red-500 flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" />
                                {errors.product}
                              </p>
                            )}
                          </div>

                          {/* Submit Button */}
                          <Button type="submit" disabled={isSubmitting || Object.keys(errors).length > 0} className="w-full">
                            {isSubmitting ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                Initiating Process...
                              </>
                            ) : (
                              <>
                                <Factory className="h-4 w-4 mr-2" />
                                Initiate Fabrication Process
                              </>
                            )}
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Product Preview Section */}
                  <div className="lg:col-span-1">
                    <Card>
                      <CardHeader>
                        <CardTitle>Product Preview</CardTitle>
                        <CardDescription>Selected medicament product</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {selectedProductData ? (
                          <div className="space-y-4">
                            <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                              <Image
                                src={selectedProductData.image || "/placeholder.svg"}
                                alt={selectedProductData.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{selectedProductData.name}</h3>
                              <p className="text-sm text-gray-500">Product ID: {selectedProductData.id}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center">
                            <div className="text-center text-gray-500">
                              <Factory className="h-12 w-12 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">Select a product to preview</p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Process Status Info */}
                    <Card className="mt-4">
                      <CardHeader>
                        <CardTitle className="text-sm">Process Status</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 rounded-full bg-yellow-500" />
                          <span>Fabrication: Pending</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 rounded-full bg-gray-300" />
                          <span>Analysis: Not Started</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Status Messages */}
                {submitStatus === "success" && (
                  <Alert className="mt-6 border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Fabrication process initiated successfully! Batch ID: {batchId}
                    </AlertDescription>
                  </Alert>
                )}

                {submitStatus === "error" && (
                  <Alert className="mt-6 border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      Failed to initiate fabrication process. Please try again.
                    </AlertDescription>
                  </Alert>
                )}
              </Card>
            </TabsContent>
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Fabrication Process History</CardTitle>
              <CardDescription>View all fabrication processes and their current status</CardDescription>

              {/* Search and Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by Batch ID or Product..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending Fabrication</SelectItem>
                    <SelectItem value="fabricated">Awaiting Analysis</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingHistory ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="text-center py-12">
                  <Factory className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No fabrication processes found</h3>
                  <p className="text-gray-500">
                    {searchTerm || statusFilter !== "all"
                      ? "Try adjusting your search or filter criteria"
                      : "Start by creating your first fabrication process"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredHistory.map((process) => (
                    <div key={process.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                            <Image
                              src={PRODUCTS.find((p) => p.name === process.product_name)?.image || "/placeholder.svg"}
                              alt={getProductName(process.product_name)}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">{process.batchNumber}</h3>
                              {getStatusBadge(process)}
                            </div>
                            <p className="text-gray-600">{getProductName(process.product_name)}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {new Date(process.dateTime).toLocaleString()}
                              </div>
                              <div className="flex items-center gap-1">
                                <Package className="h-4 w-4" />
                                Created: {process.dateTime}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-right text-sm">
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-2 h-2 rounded-full ${process.isFabricated ? "bg-green-500" : "bg-yellow-500"}`}
                              />
                              <span>Fabrication: {process.isFabricated ? "Complete" : "Pending"}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className={`w-2 h-2 rounded-full ${process.isAnalyzed ? "bg-green-500" : "bg-gray-300"}`}
                              />
                              <span>Analysis: {process.isAnalyzed ? "Complete" : "Pending"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
