import { CheckCircle, Clock, Info, RefreshCw, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function ProgressCard({ currentSession }) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState(currentSession.status);

  useEffect(() => {
    if (status === "In Progress") {
      const duration = 10000; // 5 seconds
      const interval = 100; // Update every 100ms
      const increment = 100 / (duration / interval); // How much to increment each time

      const timer = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + increment;
          if (newProgress >= 100) {
            setStatus("Completed");
            clearInterval(timer);
            return 100;
          }
          return newProgress;
        });
      }, interval);

      return () => clearInterval(timer); // Cleanup
    }
  }, [status]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Queued":
        return <Clock className="h-4 w-4" />;
      case "In Progress":
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      case "Completed":
        return <CheckCircle className="h-4 w-4" />;
      case "Failed":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Queued":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "In Progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "Failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDuration = (start: Date, end?: Date) => {
    const endTime = end || new Date();
    const duration = Math.floor(
      (endTime.getTime() - start.getTime()) / 1000 / 60,
    );
    return `${duration} minutes`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon(status)}
          Retraining Status
        </CardTitle>
        <CardDescription>
          Current state of the model retraining process
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge className={getStatusColor(status)}>{status}</Badge>
          <span className="text-sm text-gray-600">{progress}% Complete</span>
        </div>

        {status === "In Progress" && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-gray-500">
              Estimated completion: ~{Math.ceil((100 - progress) * 0.1)} seconds
            </p>
          </div>
        )}

        {status === "Completed" && (
          <div className="flex items-center justify-between">
            <Badge className="bg-gray-100 text-gray-800 border-gray-200">
              Neural Network
            </Badge>
            <span className="text-sm text-gray-600">Accuracy: {99}%</span>
          </div>
        )}

        <div className="text-sm text-gray-600">
          <p>
            <strong>Trained With:</strong> {10} dataset
          </p>
          <p>
            <strong>Date of training:</strong> 2025-06-27
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
