"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, Eye, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  AIAnalysisModal,
  type PredictionResult,
} from "@/components/ai-analysis-modal";
import { PermissionGuard } from "@/components/permission-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { useFirebase } from "@/lib/firebase/firebase-provider";
import {
  findFabricationProcess,
  getFabricationProcesses,
  getModelFeedback,
} from "@/lib/firebase/firestore";
import type { FabricationProcess } from "../fabrication/server";
import { BatchDataViewer } from "./batch-data-viewer";
import { findPrediction, loadPredictions, predictRootCause } from "./load";
import { savePrediction, setProductAsAnalyzed } from "./server";

const formSchema = z.object({
  batchId: z.string().min(1, { message: "Please select a batch ID." }),
});
// Product image mapping
const getProductImage = (productName: string) => {
  const productImages: Record<string, string> = {
    "Augmentin 30 ml PPSB pour nourrissant": "/images/augmentin30ml.png",
    "Augmentin 60ml PPSB pour enfant": "/images/augmentin60ml.png",
    "Augmentin 500mg sachet pour enfant": "/images/augmentin500mg.png",
    "Augmentin 1g sachet pour adulte": "/images/augmentin1g.png",
    "Augmentin 1g Comprimé": "/images/augmentin_comprime.png",
    "Clamoxyl 250 mg PPSB": "/images/clamoxyl250mg.png",
    "Clamoxyl 500 mg PPSB": "/images/clamoxyl500mg.png",
    "Clamoxyl 1g Comprimé": "/images/clamoxyl1g.png",
  };

  return productImages[productName] || "/placeholder.svg?height=120&width=120";
};

export default function RootCauseAnalysis() {
  return (
    <PermissionGuard permission="root-cause:read">
      <RootCauseAnalysisContent />
    </PermissionGuard>
  );
}

function RootCauseAnalysisContent() {
  const [batchNumber, setBatchNumber] = useState("");
  const { user } = useFirebase();
  const [product, setProduct] = useState("");

  const [isSearching, setIsSearching] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [existingFeedback, setExistingFeedback] = useState<any[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);

  const [activeTab, setActiveTab] = useState("rootCause");
  const [historyData, setHistoryData] = useState<PredictionResult[]>([]);

  const [fabricationProcesses, setFabricationProcesses] = useState<
    FabricationProcess[]
  >([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      batchId: "",
    },
  });

  // Fetch fabrication processes where isAnalyzed = false
  useEffect(() => {
    const fetchFabricationProcesses = async () => {
      try {
        const processes = await getFabricationProcesses();
        setFabricationProcesses(processes as FabricationProcess[]);
      } catch (error) {
        console.error("Error fetching fabrication processes:", error);
        toast({
          title: "Error",
          description: "Failed to load fabrication processes.",
          variant: "destructive",
        });
      }
    };

    fetchFabricationProcesses();
  }, []);

  useEffect(() => {
    if (activeTab === "history") {
      const fetchData = async () => {
        const predictions: PredictionResult[] = await loadPredictions();
        setHistoryData(predictions);
      };
      fetchData();
    }
  }, [activeTab]);

  const handleBatchSearch = async (batch: string) => {
    setProduct("");
    setIsSearching(false);
    setIsAnalyzing(false);
    setAnalysisResult(null);
    setExistingFeedback([]);
    if (!batch.trim()) return;
    if (!user) return;

    try {
      setIsSearching(true);
      const data: FabricationProcess | null =
        await findFabricationProcess(batch);
      if (data === null) {
        setIsSearching(false);
        return;
      }

      setProduct(data.product_name);

      if (data.isAnalyzed) {
        const predictionDoc: PredictionResult | null =
          await findPrediction(batch);

        await savePrediction(predictionDoc);
        setAnalysisResult(predictionDoc);
        return;
      }

      setIsSearching(false);
      setIsAnalyzing(true);
      // Automatically trigger AI analysis
      try {
        const prediction = await predictRootCause(batch);
        await savePrediction(prediction);
        await setProductAsAnalyzed(data?.id ?? "");
        setAnalysisResult(prediction);
        setShowModal(true);

        toast({
          title: "AI Analysis Complete",
          description: "Root cause analysis has been completed successfully.",
        });
      } catch (error) {
        console.error("Error performing AI analysis:", error);
        toast({
          title: "Analysis failed",
          description:
            "An error occurred during AI analysis. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsAnalyzing(false);
        // Load existing feedback for this batch
        const feedback = await getModelFeedback(batch);
        setExistingFeedback(feedback);
      }
    } catch (error) {
      toast({
        title: "Error loading batch data",
        description: "Please check the batch number and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setBatchNumber(values.batchId);
    handleBatchSearch(values.batchId);
  };

  const handleFeedbackSubmitted = async () => {
    if (batchNumber) {
      const feedback = await getModelFeedback(batchNumber);
      setExistingFeedback(feedback);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Root Cause Analysis
        </h2>
        <p className="text-muted-foreground">
          AI-powered analysis of combined laboratory and production data to
          identify root causes of quality issues.
        </p>
      </div>

      <Tabs
        defaultValue="rootCause"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-8"
      >
        <TabsList>
          <TabsTrigger value="rootCause">Predict Root Cause</TabsTrigger>
          <TabsTrigger value="history">History analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="rootCause">
          {/* Enhanced Batch Search */}
          <Card>
            <CardHeader>
              <CardTitle>Batch Search & Analysis</CardTitle>
              <CardDescription>
                Enter a batch number to analyze its data and get AI-powered
                insights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="flex gap-4"
                >
                  {/* Batch ID Selection */}
                  <FormField
                    control={form.control}
                    name="batchId"
                    render={({ field }) => (
                      <FormItem>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={"Select a batch ID"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {fabricationProcesses.map((process) => (
                              <SelectItem
                                key={process.id}
                                value={process.batchNumber}
                              >
                                {`${process.batchNumber} - ${process.product_name} `}
                                {process.isAnalyzed && (
                                  <Badge variant={"default"}>Analyzed</Badge>
                                )}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <Button type="submit">
                    <Search className="h-4 w-4 mr-2" />
                    Predict Root Cause
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <BatchDataViewer
            batchNumber={batchNumber}
            loading={isSearching}
            analyzing={isAnalyzing}
            product={product}
          />

          {/* Analysis Results Summary - appears after analysis is complete */}
          {analysisResult && !isAnalyzing && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  AI Analysis Complete
                </CardTitle>
                <CardDescription>
                  Root cause analysis has been completed for batch {batchNumber}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Product: {product}</p>
                    <p className="text-sm text-muted-foreground">
                      Confidence: {(analysisResult.confidence * 100).toFixed(1)}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {analysisResult.rootCause}
                    </p>
                  </div>
                  <Button onClick={() => setShowModal(true)} className="ml-4">
                    <Eye className="h-4 w-4 mr-2" />
                    View Detailed Results
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Analysis Modal */}
          {analysisResult && user && (
            <AIAnalysisModal
              isOpen={showModal}
              onClose={() => setShowModal(false)}
              batchNumber={batchNumber}
              productName={product}
              productImage={getProductImage(product)}
              prediction={analysisResult}
              userId={user.uid}
              onFeedbackSubmitted={handleFeedbackSubmitted}
            />
          )}

          {/* Existing Feedback History */}
          {existingFeedback.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Previous Feedback History</CardTitle>
                <CardDescription>
                  Historical feedback for this batch
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {existingFeedback.map((feedback, index) => (
                    <div
                      key={feedback.id || index}
                      className="p-3 border rounded-md"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${feedback.userFeedback.isCorrect
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                            }`}
                        >
                          {feedback.userFeedback.isCorrect
                            ? "Confirmed Correct"
                            : "Marked Incorrect"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(
                            feedback.createdAt?.toDate?.() ||
                            feedback.createdAt,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      {!feedback.userFeedback.isCorrect &&
                        feedback.userFeedback.actualRootCause && (
                          <p className="text-sm">
                            <strong>Actual Root Cause:</strong>{" "}
                            {feedback.userFeedback.actualRootCause}
                          </p>
                        )}
                      {feedback.userFeedback.comments && (
                        <p className="text-sm text-muted-foreground mt-1">
                          <strong>Comments:</strong>{" "}
                          {feedback.userFeedback.comments}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <ul className="list-disc pl-6">
            {historyData.map((item, idx) => (
              <div key={idx}>
                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="h-5 w-5" />
                      AI Analysis Complete
                    </CardTitle>
                    <CardDescription>
                      Root cause analysis has been completed for batch{" "}
                      {item.batchNumber}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          Product: {item.product}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Confidence: {(item.confidence * 100).toFixed(1)}% |
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.rootCause}
                        </p>
                      </div>
                      <Button
                        onClick={() => setShowAIModal(true)}
                        className="ml-4"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Detailed Results
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                <AIAnalysisModal
                  isOpen={showAIModal}
                  onClose={() => setShowAIModal(false)}
                  batchNumber={item.batchNumber}
                  productName={item.product}
                  productImage={getProductImage(item.product)}
                  prediction={item}
                  userId={user?.uid ?? ""}
                  onFeedbackSubmitted={handleFeedbackSubmitted}
                />
              </div>
            ))}
          </ul>
        </TabsContent>
      </Tabs>
    </div>
  );
}
