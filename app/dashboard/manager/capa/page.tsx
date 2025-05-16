"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { Send } from "lucide-react"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { createCAPA, Timestamp } from "@/lib/firebase/firestore"

// Mock ML prediction function - in a real app, this would call a Firebase Function
const predictCAPAActions = async (data: any) => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Return mock prediction
  return {
    correctiveActions: [
      "Revise buffer preparation SOP to include additional verification steps",
      "Implement double-check system for buffer preparation",
      "Retrain all laboratory staff on buffer preparation procedures",
      "Review and update pH measurement procedures",
    ],
    preventiveActions: [
      "Implement automated pH monitoring system during production",
      "Establish regular calibration schedule for pH meters",
      "Update quality control checklist to include buffer verification",
      "Implement statistical process control for pH measurements",
    ],
    confidence: 0.87,
    similarCases: [
      "CAPA-2022-045: pH deviation in Clamoxyl 500mg",
      "CAPA-2021-078: Buffer preparation issue in Augmentin 1g",
    ],
  }
}

export default function CapaPrediction() {
  const { user } = useFirebase()
  const [rootCause, setRootCause] = useState("")
  const [product, setProduct] = useState("")
  const [issueType, setIssueType] = useState("")
  const [batchNumber, setBatchNumber] = useState("")
  const [isPredicting, setIsPredicting] = useState(false)
  const [predictionResult, setPredictionResult] = useState<any>(null)
  const [isCreatingCAPA, setIsCreatingCAPA] = useState(false)

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to predict CAPA actions",
        variant: "destructive",
      })
      return
    }

    if (!rootCause || !product || !issueType || !batchNumber) {
      toast({
        title: "Prediction failed",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsPredicting(true)

    try {
      // Prepare data for prediction
      const predictionData = {
        rootCause,
        product,
        issueType,
        batchNumber,
        userId: user.uid,
      }

      // Call prediction function (would be a Firebase Function in a real app)
      const result = await predictCAPAActions(predictionData)

      // Set prediction result
      setPredictionResult(result)

      toast({
        title: "Prediction complete",
        description: "CAPA actions have been predicted successfully.",
      })
    } catch (error) {
      console.error("Error predicting CAPA actions:", error)
      toast({
        title: "Prediction failed",
        description: "An error occurred during prediction. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsPredicting(false)
    }
  }

  const handleCreateCAPA = async () => {
    if (!user || !predictionResult || !rootCause || !product || !batchNumber) {
      toast({
        title: "CAPA creation failed",
        description: "Missing required information.",
        variant: "destructive",
      })
      return
    }

    setIsCreatingCAPA(true)

    try {
      // Create CAPA document in Firestore
      const capaId = await createCAPA({
        title: `${issueType.toUpperCase()} - ${product} (Batch: ${batchNumber})`,
        description: `Root cause analysis for ${issueType} in ${product} (Batch: ${batchNumber})`,
        rootCause,
        correctiveActions: predictionResult.correctiveActions,
        preventiveActions: predictionResult.preventiveActions,
        assignedTo: ["lab-team-id", "production-team-id"], // In a real app, these would be actual user IDs
        status: "open",
        priority: "high",
        dueDate: Timestamp.fromDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)), // 14 days from now
        createdBy: user.uid,
      })

      toast({
        title: "CAPA created",
        description: `CAPA has been created and assigned to the relevant teams.`,
      })

      // Reset form and prediction result
      setRootCause("")
      setProduct("")
      setIssueType("")
      setBatchNumber("")
      setPredictionResult(null)
    } catch (error) {
      console.error("Error creating CAPA:", error)
      toast({
        title: "CAPA creation failed",
        description: "An error occurred while creating the CAPA. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreatingCAPA(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">CAPA Prediction</h2>
        <p className="text-muted-foreground">Predict Corrective and Preventive Actions based on root cause analysis.</p>
      </div>

      <Tabs defaultValue="predict" className="space-y-4">
        <TabsList>
          <TabsTrigger value="predict">Predict CAPA</TabsTrigger>
          <TabsTrigger value="active">Active CAPAs</TabsTrigger>
          <TabsTrigger value="completed">Completed CAPAs</TabsTrigger>
        </TabsList>

        <TabsContent value="predict">
          <Card>
            <form onSubmit={handlePredict}>
              <CardHeader>
                <CardTitle>CAPA Prediction</CardTitle>
                <CardDescription>
                  Enter root cause details to predict appropriate corrective and preventive actions.
                </CardDescription>
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
                    <Label htmlFor="issue-type">Issue Type</Label>
                    <Select value={issueType} onValueChange={setIssueType} required>
                      <SelectTrigger id="issue-type">
                        <SelectValue placeholder="Select issue type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="oos-result">OOS Result</SelectItem>
                        <SelectItem value="oot-result">OOT Result</SelectItem>
                        <SelectItem value="process-deviation">Process Deviation</SelectItem>
                        <SelectItem value="equipment-failure">Equipment Failure</SelectItem>
                        <SelectItem value="raw-material-issue">Raw Material Issue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

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
                  <Label htmlFor="root-cause">Root Cause</Label>
                  <Textarea
                    id="root-cause"
                    placeholder="Describe the identified root cause in detail"
                    rows={5}
                    value={rootCause}
                    onChange={(e) => setRootCause(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supporting-data">Supporting Data (Optional)</Label>
                  <Input id="supporting-data" type="file" multiple />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="bg-primary-500 hover:bg-primary-600" disabled={isPredicting}>
                  {isPredicting ? "Predicting..." : "Predict CAPA Actions"}
                </Button>
              </CardFooter>
            </form>
          </Card>

          {predictionResult && (
            <Card className="mt-6 border-t-4 border-t-primary-500">
              <CardHeader>
                <CardTitle>Predicted CAPA Actions</CardTitle>
                <CardDescription>AI-powered CAPA prediction results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Predicted Corrective Actions:</h3>
                    <ul className="mt-1 list-disc pl-5 space-y-1">
                      {predictionResult.correctiveActions.map((action: string, index: number) => (
                        <li key={index}>{action}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">Predicted Preventive Actions:</h3>
                    <ul className="mt-1 list-disc pl-5 space-y-1">
                      {predictionResult.preventiveActions.map((action: string, index: number) => (
                        <li key={index}>{action}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">Prediction Confidence:</h3>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-2 w-32 rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-primary-500"
                          style={{ width: `${predictionResult.confidence * 100}%` }}
                        ></div>
                      </div>
                      <span>{Math.round(predictionResult.confidence * 100)}%</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">Similar Historical Cases:</h3>
                    <ul className="mt-1 list-disc pl-5 space-y-1">
                      {predictionResult.similarCases.map((item: string, index: number) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="bg-primary-500 hover:bg-primary-600"
                  onClick={handleCreateCAPA}
                  disabled={isCreatingCAPA}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {isCreatingCAPA ? "Creating CAPA..." : "Create and Assign CAPA"}
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active CAPAs</CardTitle>
              <CardDescription>CAPAs that are currently in progress.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-40 bg-gray-50 rounded-md">
                <p className="text-muted-foreground">Active CAPAs will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Completed CAPAs</CardTitle>
              <CardDescription>CAPAs that have been successfully implemented.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-40 bg-gray-50 rounded-md">
                <p className="text-muted-foreground">Completed CAPAs will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
