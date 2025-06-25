import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RetrainCard({ accuracy, onTrainModel, counts }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              Retraining Status
            </CardTitle>
            <CardDescription>Current model used for prediction</CardDescription>
          </div>
          <Button
            onClick={onTrainModel}
            disabled={counts < 10}
            className="mt-auto"
          >
            Train model
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            Neural Network
          </Badge>
          <span className="text-sm text-gray-600">Accuracy: {accuracy}%</span>
        </div>

        <div className="text-sm text-gray-600">
          <p>
            <strong>Trained With:</strong> {100000} dataset
          </p>
          <p>
            <strong>Date of training:</strong> 2025-05-12
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
