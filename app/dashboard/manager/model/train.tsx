"use client";

import {
  AlertTriangle,
  Brain,
  FileText,
  RefreshCw,
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
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import ProgressCard from "./components/progress_card";
import RetrainCard from "./components/retrain_card";
import {
  countFeedbacks,
  loadModelPerformance,
  type ModelPerformance,
} from "./load";

interface RetrainingSession {
  id: string;
  status: "Queued" | "In Progress" | "Completed" | "Failed";
  incorrectPredictions: number;
  initiatedAt: Date;
  completedAt?: Date;
  progress: number;
  feedbackEntriesUsed: number;
  totalFeedbackEntries: number;
  logs: LogEntry[];
  accuracyBefore: number;
  accuracyAfter?: number;
}

interface LogEntry {
  timestamp: Date;
  level: "info" | "warning" | "error" | "success";
  message: string;
}

export default function AIModelRetrainingPage() {
  const [currentSession, setCurrentSession] =
    useState<RetrainingSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [counts, setCounts] = useState(0);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [modelPerformance, setModelPerformance] = useState<ModelPerformance>();

  useEffect(() => {
    const fetchFeedbackCount = async () => {
      try {
        const counts = await countFeedbacks();
        setCounts(counts);
        const performance = await loadModelPerformance();
        setModelPerformance(performance);
      } catch (error) {
        console.error("Error fetching fabrication processes:", error);
        toast({
          title: "Error",
          description: "Failed to load feedback history.",
          variant: "destructive",
        });
      }
    };

    fetchFeedbackCount();
  }, []);

  function trainModel() {
    try {
      setIsModelLoading(true);
      setTimeout(() => {
        // setIsModelLoading(false);
      }, 10000);
    } catch (error) {
      console.log(error);
    }
  }

  // Mock data - replace with actual Firestore data
  useEffect(() => {
    const mockSession: RetrainingSession = {
      id: "retraining_2024_001",
      status: "In Progress",
      incorrectPredictions: 15, // Alpha value
      initiatedAt: new Date("2024-01-15T10:30:00"),
      progress: 65,
      feedbackEntriesUsed: 127,
      totalFeedbackEntries: 150,
      accuracyBefore: 87.3,
      accuracyAfter: undefined,
      logs: [
        {
          timestamp: new Date("2024-01-15T10:30:00"),
          level: "info",
          message:
            "Retraining process initiated due to 15 incorrect predictions exceeding threshold of 10",
        },
        {
          timestamp: new Date("2024-01-15T10:31:15"),
          level: "info",
          message: "Loading feedback data from Firestore collection...",
        },
        {
          timestamp: new Date("2024-01-15T10:32:30"),
          level: "success",
          message: "Successfully loaded 127 feedback entries for training",
        },
        {
          timestamp: new Date("2024-01-15T10:35:00"),
          level: "info",
          message: "Data preprocessing completed. Validation accuracy: 92.1%",
        },
        {
          timestamp: new Date("2024-01-15T10:40:00"),
          level: "info",
          message: "Model training in progress... Epoch 15/25",
        },
        {
          timestamp: new Date("2024-01-15T10:42:00"),
          level: "warning",
          message: "Learning rate adjusted due to plateau detection",
        },
      ],
    };

    setTimeout(() => {
      setCurrentSession(mockSession);
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-gsk-blue" />
          <h1 className="text-2xl font-bold">AI Model Retraining</h1>
        </div>
        <div className="grid gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!currentSession) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-gsk-blue" />
          <h1 className="text-2xl font-bold">AI Model Retraining</h1>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No active retraining session found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-gsk-blue" />
          <h1 className="text-2xl font-bold">AI Model Retraining Dashboard</h1>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Status
        </Button>
      </div>

      {/* 1. Retraining Trigger Explanation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-gsk-orange" />
            Retraining Trigger
          </CardTitle>
          <CardDescription>
            Understanding why model retraining was initiated
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gsk-orange/10 border border-gsk-orange/20 rounded-lg p-4">
            <h4 className="font-semibold text-gsk-orange mb-2">
              Manager Feedback Impact
            </h4>
            <p className="text-sm text-gray-700 mb-3">
              Your feedback on root cause predictions plays a crucial role in
              identifying and correcting model inaccuracies. When the number of
              incorrect predictions exceeds our quality threshold, the system
              automatically initiates retraining to improve model performance.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">Trigger Threshold:</span>
                <Badge variant="outline">≥ 10 incorrect predictions</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Current Count:</span>
                <Badge className="bg-red-100 text-red-800">
                  {counts} predictions
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Incorrect Predictions & 3. Retraining Status */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              Incorrect Predictions (α)
            </CardTitle>
            <CardDescription>
              Total number of incorrect predictions that triggered retraining
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="text-4xl font-bold text-red-600">{counts}</div>
              <div className="text-sm text-gray-600">
                Predictions identified as incorrect by manager feedback
              </div>
              {counts >= 10 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">
                    <strong>Severity:</strong> High - Exceeds threshold by{" "}
                    {currentSession.incorrectPredictions - 10} predictions
                  </p>
                </div>
              )}
              {counts < 10 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-700">
                    <strong>Severity:</strong> Low - {10 - counts} predictions
                    left to reach threshold
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {!isModelLoading && (
          <RetrainCard
            onTrainModel={trainModel}
            accuracy={modelPerformance?.oldAccuracy * 100}
            counts={11}
          />
        )}
        {isModelLoading && <ProgressCard currentSession={currentSession} />}
      </div>

      {/* 8. Actionable Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-gsk-green" />
            Model Performance & Insights
          </CardTitle>
          <CardDescription>
            How manager feedback contributes to continuous model improvement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Performance Metrics</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Accuracy Before Retraining:</span>
                  <Badge variant="outline">
                    {modelPerformance?.oldAccuracy}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Expected Accuracy After:</span>
                  <Badge className="bg-green-100 text-green-800">
                    {modelPerformance?.newAccuracy || "~92.5%"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Projected Improvement:</span>
                  <Badge className="bg-blue-100 text-blue-800">
                    +
                    {(
                      (modelPerformance?.newAccuracy || 92.5) -
                      (modelPerformance?.oldAccuracy || 90)
                    ).toFixed(1)}
                    %
                  </Badge>
                </div>
              </div>
            </div>

            <div className="bg-gsk-green/10 border border-gsk-green/20 rounded-lg p-4">
              <h4 className="font-semibold text-gsk-green mb-2">
                Manager Impact
              </h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Your feedback directly improves prediction accuracy</li>
                <li>• Each correction helps the model learn from mistakes</li>
                <li>• Continuous feedback creates a self-improving system</li>
                <li>
                  • Better predictions lead to faster root cause identification
                </li>
              </ul>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <p>
                <strong>Next Steps:</strong> Monitor completion and review
                improved model performance
              </p>
            </div>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
