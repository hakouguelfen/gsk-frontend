"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ModelFeedbackHistoryPage from "./history";
import AIModelRetrainingPage from "./train";

export default function AIModel() {
  return <AIModelContent />;
}

function AIModelContent() {
  const [activeTab, setActiveTab] = useState("rootCause");

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
          <TabsTrigger value="retrainModel">Revaluate the model</TabsTrigger>
          <TabsTrigger value="history">Feedback History</TabsTrigger>
        </TabsList>

        <TabsContent value="retrainModel">
          <AIModelRetrainingPage />
        </TabsContent>

        <TabsContent value="history">
          <ModelFeedbackHistoryPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}
