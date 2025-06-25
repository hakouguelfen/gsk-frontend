"use client";

import {
  Brain,
  CheckCircle,
  FileText,
  MessageSquare,
  Package,
  RefreshCw,
  Save,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import type { ModelFeedback } from "@/lib/firebase/firestore";
import { loadFeedbacks } from "./load";
import { updateFeedBackContent } from "./server";

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

export default function ModelFeedbackHistoryPage() {
  const [feedbackData, setFeedbackData] = useState<ModelFeedback[]>([]);
  const [selectedFeedback, setSelectedFeedback] =
    useState<ModelFeedback | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    isCorrect: true,
    actualRootCause: "",
    actualCapaActions: [""],
    comments: "",
  });

  useEffect(() => {
    const fetchFeedbackHistory = async () => {
      try {
        const feedbacks = await loadFeedbacks();
        setFeedbackData(feedbacks as ModelFeedback[]);
      } catch (error) {
        console.error("Error fetching fabrication processes:", error);
        toast({
          title: "Error",
          description: "Failed to load feedback history.",
          variant: "destructive",
        });
      }
    };

    fetchFeedbackHistory();
  }, []);

  useEffect(() => {
    if (feedbackData.length > 0) {
      setSelectedFeedback(feedbackData[0]);
      setEditForm({
        isCorrect: feedbackData[0].userFeedback.isCorrect,
        actualRootCause: feedbackData[0].userFeedback.actualRootCause || "",
        actualCapaActions: feedbackData[0].userFeedback.actualCapaActions || [
          "",
        ],
        comments: feedbackData[0].userFeedback.comments || "",
      });
    }
  }, [feedbackData]);

  const handleSaveFeedback = async () => {
    if (!selectedFeedback) return;

    const updatedFeedback = {
      ...selectedFeedback,
      userFeedback: {
        ...editForm,
        actualCapaActions: editForm.actualCapaActions.filter(
          (action) => action.trim() !== "",
        ),
      },
    };

    setFeedbackData((prev) =>
      prev.map((item) =>
        item.id === selectedFeedback.id ? updatedFeedback : item,
      ),
    );
    setSelectedFeedback(updatedFeedback);
    setIsEditing(false);

    await updateFeedBackContent(updatedFeedback);
  };

  const addCapaAction = () => {
    setEditForm((prev) => ({
      ...prev,
      actualCapaActions: [...prev.actualCapaActions, ""],
    }));
  };

  const updateCapaAction = (index: number, value: string) => {
    setEditForm((prev) => ({
      ...prev,
      actualCapaActions: prev.actualCapaActions.map((action, i) =>
        i === index ? value : action,
      ),
    }));
  };

  const removeCapaAction = (index: number) => {
    setEditForm((prev) => ({
      ...prev,
      actualCapaActions: prev.actualCapaActions.filter((_, i) => i !== index),
    }));
  };

  if (!selectedFeedback) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading feedback data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto  space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Model Feedback Review</h1>
          <p className="text-muted-foreground">
            Review and provide feedback on AI model predictions
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={isEditing ? "outline" : "default"}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Cancel" : "Edit Feedback"}
          </Button>
          {isEditing && (
            <Button onClick={handleSaveFeedback}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Feedback List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Feedback Queue
            </CardTitle>
            <CardDescription>
              {feedbackData.length} items pending review
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {feedbackData.map((feedback) => (
              <div
                key={feedback.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedFeedback?.id === feedback.id
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/50"
                  }`}
                onClick={() => {
                  setSelectedFeedback(feedback);
                  setEditForm({
                    isCorrect: feedback.userFeedback.isCorrect,
                    actualRootCause:
                      feedback.userFeedback.actualRootCause || "",
                    actualCapaActions: feedback.userFeedback
                      .actualCapaActions || [""],
                    comments: feedback.userFeedback.comments || "",
                  });
                  setIsEditing(false);
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">
                    {feedback.batchNumber}
                  </span>
                  <Badge
                    variant={
                      feedback.userFeedback.isCorrect
                        ? "default"
                        : "destructive"
                    }
                  >
                    {feedback.userFeedback.isCorrect ? "Correct" : "Incorrect"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {feedback.productName}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <TrendingUp className="h-3 w-3" />
                  <span className="text-xs">
                    {Math.round(feedback.originalPrediction.confidence * 100)}%
                    confidence
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Batch Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Batch Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm font-medium">Batch Number</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedFeedback.batchNumber}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Product</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedFeedback.productName}
                  </p>
                </div>
                <div></div>
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(
                      selectedFeedback.createdAt.seconds * 1000,
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Prediction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Model Prediction
              </CardTitle>
              <CardDescription>
                Original prediction with{" "}
                {Math.round(
                  selectedFeedback.originalPrediction.confidence * 100,
                )}
                % confidence
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Root Cause</Label>
                <p className="text-sm bg-muted p-3 rounded-md mt-1">
                  {selectedFeedback.originalPrediction.rootCause}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium">Evidence</Label>
                <div className="space-y-2 mt-1">
                  {selectedFeedback.originalPrediction.evidence.map(
                    (evidence, index) => {
                      const status = getStatus(
                        evidence.value,
                        evidence.min,
                        evidence.max,
                      );
                      const StatusIcon = status.icon;
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-muted rounded-md"
                        >
                          <div>
                            <span className="text-sm font-medium">
                              {evidence.name}:
                            </span>
                            <span className="text-sm ml-2">
                              {evidence.value}
                            </span>
                          </div>

                          <div
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {status.text}
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">
                  Suggested CAPA Actions
                </Label>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  {selectedFeedback.originalPrediction.capaActions.map(
                    (action, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        {action}
                      </li>
                    ),
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* User Feedback */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Manager Feedback
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <Label className="text-sm font-medium">
                      Is the AI prediction correct?
                    </Label>
                    <RadioGroup
                      value={editForm.isCorrect.toString()}
                      onValueChange={(value) =>
                        setEditForm((prev) => ({
                          ...prev,
                          isCorrect: value === "true",
                        }))
                      }
                      className="mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true" id="correct" />
                        <Label
                          htmlFor="correct"
                          className="flex items-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Yes, the prediction is correct
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="false" id="incorrect" />
                        <Label
                          htmlFor="incorrect"
                          className="flex items-center gap-2"
                        >
                          <XCircle className="h-4 w-4 text-red-600" />
                          No, the prediction is incorrect
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {!editForm.isCorrect && (
                    <>
                      <div>
                        <Label
                          htmlFor="actualRootCause"
                          className="text-sm font-medium"
                        >
                          Actual Root Cause
                        </Label>
                        <Textarea
                          id="actualRootCause"
                          value={editForm.actualRootCause}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              actualRootCause: e.target.value,
                            }))
                          }
                          placeholder="Describe the actual root cause..."
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-medium">
                          Actual CAPA Actions
                        </Label>
                        <div className="space-y-2 mt-1">
                          {editForm.actualCapaActions.map((action, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                value={action}
                                onChange={(e) =>
                                  updateCapaAction(index, e.target.value)
                                }
                                placeholder={`CAPA Action ${index + 1}`}
                              />
                              {editForm.actualCapaActions.length > 1 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeCapaAction(index)}
                                >
                                  Remove
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={addCapaAction}
                          >
                            Add CAPA Action
                          </Button>
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <Label htmlFor="comments" className="text-sm font-medium">
                      Additional Comments
                    </Label>
                    <Textarea
                      id="comments"
                      value={editForm.comments}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          comments: e.target.value,
                        }))
                      }
                      placeholder="Any additional feedback or observations..."
                      className="mt-1"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    {selectedFeedback.userFeedback.isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className="font-medium">
                      {selectedFeedback.userFeedback.isCorrect
                        ? "Prediction Confirmed"
                        : "Prediction Corrected"}
                    </span>
                  </div>

                  {!selectedFeedback.userFeedback.isCorrect &&
                    selectedFeedback.userFeedback.actualRootCause && (
                      <div>
                        <Label className="text-sm font-medium">
                          Actual Root Cause
                        </Label>
                        <p className="text-sm bg-muted p-3 rounded-md mt-1">
                          {selectedFeedback.userFeedback.actualRootCause}
                        </p>
                      </div>
                    )}

                  {selectedFeedback.userFeedback.actualCapaActions &&
                    selectedFeedback.userFeedback.actualCapaActions.length >
                    0 && (
                      <div>
                        <Label className="text-sm font-medium">
                          Actual CAPA Actions
                        </Label>
                        <ul className="list-disc list-inside space-y-1 mt-1">
                          {selectedFeedback.userFeedback.actualCapaActions.map(
                            (action, index) => (
                              <li
                                key={index}
                                className="text-sm text-muted-foreground"
                              >
                                {action}
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}

                  {selectedFeedback.userFeedback.comments && (
                    <div>
                      <Label className="text-sm font-medium">Comments</Label>
                      <p className="text-sm bg-muted p-3 rounded-md mt-1">
                        {selectedFeedback.userFeedback.comments}
                      </p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
