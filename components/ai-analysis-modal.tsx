/** biome-ignore-all lint/nursery/useUniqueElementIds: <explanation> */
"use client";

import {
  AlertTriangle,
  Brain,
  CheckCircle,
  FileText,
  MessageSquare,
  Target,
  ThumbsDown,
  ThumbsUp,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import {
  type ModelFeedback,
  submitModelFeedback,
} from "@/lib/firebase/firestore";

export interface Evidence {
  name: string;
  value: number;
  status: string;
  min: number;
  max: number;
}
export interface PredictionResult {
  batchNumber: string;
  product: string;
  confidence: number;
  loss: number;
  rootCause: string;
  evidence: Evidence[];
  capa: string[];
}

interface AIAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  batchNumber: string;
  productName: string;
  productImage?: string;
  prediction: PredictionResult;
  userId: string;
  onFeedbackSubmitted?: () => void;
}

export function AIAnalysisModal({
  isOpen,
  onClose,
  batchNumber,
  productName,
  productImage,
  prediction,
  userId,
  onFeedbackSubmitted,
}: AIAnalysisModalProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState<
    "correct" | "incorrect" | null
  >(null);
  const [actualRootCause, setActualRootCause] = useState("");
  const [actualCapaActions, setActualCapaActions] = useState("");
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-500";
    if (confidence >= 0.6) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStatus = (value, min, max) => {
    if (value < min)
      return {
        text: "Too Low",
        color: "text-orange-600 bg-orange-50",
        icon: XCircle,
      };
    if (value > max)
      return {
        text: "Too High",
        color: "text-red-600 bg-red-50",
        icon: XCircle,
      };
    return {
      text: "OK",
      color: "text-green-600 bg-green-50",
      icon: CheckCircle,
    };
  };

  const handleFeedback = (isCorrect: boolean) => {
    setFeedbackType(isCorrect ? "correct" : "incorrect");
    setShowFeedback(true);
  };

  const submitFeedback = async () => {
    if (!feedbackType) return;

    setIsSubmitting(true);
    try {
      const feedbackData: Omit<ModelFeedback, "id" | "createdAt"> = {
        batchNumber,
        productName,
        originalPrediction: {
          rootCause: prediction.rootCause,
          confidence: prediction.confidence,
          evidence: prediction.evidence,
          capaActions: prediction.capa,
        },
        userFeedback: {
          isCorrect: feedbackType === "correct",
          actualRootCause: feedbackType === "incorrect" ? actualRootCause : "",
          actualCapaActions:
            feedbackType === "incorrect"
              ? actualCapaActions.split("\n").filter((action) => action.trim())
              : [],
          comments: comments || "",
        },
        managerId: userId,
      };
      await submitModelFeedback(feedbackData);

      toast({
        title: "Feedback submitted",
        description:
          "Thank you for your feedback. This will help improve our model's accuracy.",
      });

      setShowFeedback(false);
      onFeedbackSubmitted?.();
      onClose();
    } catch (error) {
      toast({
        title: "Error submitting feedback",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetFeedback = () => {
    setShowFeedback(false);
    setFeedbackType(null);
    setActualRootCause("");
    setActualCapaActions("");
    setComments("");
  };

  const handleClose = () => {
    resetFeedback();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Root Cause Analysis Results
          </DialogTitle>
          <DialogDescription>
            Analysis results for batch {batchNumber} - {productName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Information */}
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
            {productImage && (
              <div className="flex-shrink-0">
                <Image
                  src={productImage || "/placeholder.svg"}
                  alt={productName}
                  width={80}
                  height={80}
                  className="rounded-lg border object-cover"
                />
              </div>
            )}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">{productName}</h3>
              <p className="text-sm text-muted-foreground">
                Batch: {batchNumber}
              </p>
            </div>
          </div>

          {/* Confidence Score */}
          <div className="space-y-2">
            <Label>AI Confidence Score</Label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${getConfidenceColor(prediction.confidence)}`}
                  style={{ width: `${prediction.confidence * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium">
                {(prediction.confidence * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Root Cause */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Predicted Root Cause
            </Label>
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm">{prediction.rootCause}</p>
            </div>
          </div>

          {/* Evidence */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Supporting Evidence
            </Label>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200 text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-3 py-2 text-left font-medium">
                      Parameter
                    </th>
                    <th className="border border-gray-200 px-3 py-2 text-center font-medium">
                      Current Value
                    </th>
                    <th className="border border-gray-200 px-3 py-2 text-center font-medium">
                      Acceptable Range
                    </th>
                    <th className="border border-gray-200 px-3 py-2 text-center font-medium">
                      Status
                    </th>
                    <th className="border border-gray-200 px-3 py-2 text-center font-medium">
                      Visual
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {prediction.evidence.map((param, index) => {
                    const status = getStatus(param.value, param.min, param.max);
                    const StatusIcon = status.icon;
                    const percentage =
                      param.value < param.min
                        ? ((param.min - param.value) / param.min) * 100
                        : param.value > param.max
                          ? ((param.value - param.max) / param.max) * 100
                          : 0;

                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-200 px-3 py-2">
                          <div className="font-medium">{param.name}</div>
                        </td>
                        <td className="border border-gray-200 px-3 py-2 text-center">
                          <span className="font-bold">{param.value}</span>
                        </td>
                        <td className="border border-gray-200 px-3 py-2 text-center text-gray-600">
                          {param.min} - {param.max}
                        </td>
                        <td className="border border-gray-200 px-3 py-2">
                          <div
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {status.text}
                          </div>
                        </td>
                        <td className="border border-gray-200 px-3 py-2 text-center">
                          <div className="flex items-center justify-center">
                            {status.text !== "OK" && (
                              <div className="text-xs text-gray-500">
                                {percentage.toFixed(0)}%{" "}
                                {status.text === "Too High" ? "over" : "under"}
                              </div>
                            )}
                            {status.text === "OK" && (
                              <div className="text-xs text-green-600">✓</div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Summary footer */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Quality Assessment:</span>
                <div className="flex gap-4">
                  <span className="text-red-600">
                    {
                      prediction.evidence.filter(
                        (p) =>
                          getStatus(p.value, p.min, p.max).text === "Too High",
                      ).length
                    }{" "}
                    Too High
                  </span>
                  <span className="text-orange-600">
                    {
                      prediction.evidence.filter(
                        (p) =>
                          getStatus(p.value, p.min, p.max).text === "Too Low",
                      ).length
                    }{" "}
                    Too Low
                  </span>
                  <span className="text-green-600">
                    {
                      prediction.evidence.filter(
                        (p) => getStatus(p.value, p.min, p.max).text === "OK",
                      ).length
                    }{" "}
                    Within Range
                  </span>
                </div>
              </div>
            </div>
            {/*
            <ul className="space-y-2">
              {prediction.evidence.map((evidence, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm p-2 bg-green-50 rounded"
                >
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  {evidence}
                </li>
              ))}
            </ul>
            */}
          </div>

          {/* CAPA Actions */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Suggested CAPA Actions
            </Label>
            <div className="space-y-2">
              {prediction.capa.map((action, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md"
                >
                  <span className="text-xs bg-amber-200 text-amber-800 px-2 py-1 rounded font-medium">
                    {index + 1}
                  </span>
                  <span className="text-sm">{action}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback Section */}
          <div className="border-t pt-4">
            <Label className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-4 w-4" />
              Provide Feedback to Improve AI Accuracy
            </Label>

            {!showFeedback ? (
              <div className="flex gap-2">
                <Button
                  onClick={() => handleFeedback(true)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ThumbsUp className="h-4 w-4" />
                  Prediction is Correct
                </Button>
                <Button
                  onClick={() => handleFeedback(false)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ThumbsDown className="h-4 w-4" />
                  Prediction is Incorrect
                </Button>
              </div>
            ) : (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  {feedbackType === "correct" ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="font-medium">
                    {feedbackType === "correct"
                      ? "Thank you for confirming the prediction!"
                      : "Please provide the correct information"}
                  </span>
                </div>

                {feedbackType === "incorrect" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="actualRootCause">Actual Root Cause</Label>
                      <Textarea
                        id="actualRootCause"
                        placeholder="Please describe the actual root cause..."
                        value={actualRootCause}
                        onChange={(e) => setActualRootCause(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="actualCapaActions">
                        Actual CAPA Actions (one per line)
                      </Label>
                      <Textarea
                        id="actualCapaActions"
                        placeholder="Enter each CAPA action on a new line..."
                        value={actualCapaActions}
                        onChange={(e) => setActualCapaActions(e.target.value)}
                        rows={4}
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="comments">
                    Additional Comments (Optional)
                  </Label>
                  <Textarea
                    id="comments"
                    placeholder="Any additional feedback or context..."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={submitFeedback}
                    disabled={
                      isSubmitting ||
                      (feedbackType === "incorrect" && !actualRootCause.trim())
                    }
                  >
                    {isSubmitting ? "Submitting..." : "Submit Feedback"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetFeedback}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
