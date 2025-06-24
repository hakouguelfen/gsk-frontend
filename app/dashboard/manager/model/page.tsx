"use client";

import { useState, useEffect } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Brain,
	AlertTriangle,
	CheckCircle,
	Clock,
	Database,
	FileText,
	TrendingUp,
	RefreshCw,
	Play,
	Pause,
	XCircle,
	Info,
} from "lucide-react";

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

	const getLogIcon = (level: string) => {
		switch (level) {
			case "info":
				return <Info className="h-3 w-3 text-blue-500" />;
			case "warning":
				return <AlertTriangle className="h-3 w-3 text-yellow-500" />;
			case "error":
				return <XCircle className="h-3 w-3 text-red-500" />;
			case "success":
				return <CheckCircle className="h-3 w-3 text-green-500" />;
			default:
				return <Info className="h-3 w-3 text-gray-500" />;
		}
	};

	const formatDuration = (start: Date, end?: Date) => {
		const endTime = end || new Date();
		const duration = Math.floor(
			(endTime.getTime() - start.getTime()) / 1000 / 60,
		);
		return `${duration} minutes`;
	};

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
									{currentSession.incorrectPredictions} predictions
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
							<div className="text-4xl font-bold text-red-600">
								{currentSession.incorrectPredictions}
							</div>
							<div className="text-sm text-gray-600">
								Predictions identified as incorrect by manager feedback
							</div>
							<div className="bg-red-50 border border-red-200 rounded-lg p-3">
								<p className="text-sm text-red-700">
									<strong>Severity:</strong> High - Exceeds threshold by{" "}
									{currentSession.incorrectPredictions - 10} predictions
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							{getStatusIcon(currentSession.status)}
							Retraining Status
						</CardTitle>
						<CardDescription>
							Current state of the model retraining process
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<Badge className={getStatusColor(currentSession.status)}>
								{currentSession.status}
							</Badge>
							<span className="text-sm text-gray-600">
								{currentSession.progress}% Complete
							</span>
						</div>

						{currentSession.status === "In Progress" && (
							<div className="space-y-2">
								<Progress value={currentSession.progress} className="h-2" />
								<p className="text-xs text-gray-500">
									Estimated completion: ~
									{Math.ceil((100 - currentSession.progress) * 0.5)} minutes
								</p>
							</div>
						)}

						<div className="text-sm text-gray-600">
							<p>
								<strong>Session ID:</strong> {currentSession.id}
							</p>
							<p>
								<strong>Duration:</strong>{" "}
								{formatDuration(
									currentSession.initiatedAt,
									currentSession.completedAt,
								)}
							</p>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* 4. Timestamps */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Clock className="h-5 w-5 text-gsk-blue" />
						Process Timeline
					</CardTitle>
					<CardDescription>
						Retraining initiation and completion timestamps
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid md:grid-cols-3 gap-4">
						<div className="space-y-2">
							<p className="text-sm font-medium text-gray-700">Initiated</p>
							<p className="text-lg font-semibold">
								{currentSession.initiatedAt.toLocaleDateString()}
							</p>
							<p className="text-sm text-gray-500">
								{currentSession.initiatedAt.toLocaleTimeString()}
							</p>
						</div>

						<div className="space-y-2">
							<p className="text-sm font-medium text-gray-700">Completed</p>
							<p className="text-lg font-semibold">
								{currentSession.completedAt
									? currentSession.completedAt.toLocaleDateString()
									: "In Progress"}
							</p>
							<p className="text-sm text-gray-500">
								{currentSession.completedAt
									? currentSession.completedAt.toLocaleTimeString()
									: "Pending"}
							</p>
						</div>

						<div className="space-y-2">
							<p className="text-sm font-medium text-gray-700">Duration</p>
							<p className="text-lg font-semibold">
								{formatDuration(
									currentSession.initiatedAt,
									currentSession.completedAt,
								)}
							</p>
							<p className="text-sm text-gray-500">
								{currentSession.status === "In Progress"
									? "Elapsed time"
									: "Total time"}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* 5. Data Summary */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Database className="h-5 w-5 text-gsk-green" />
						Training Data Summary
					</CardTitle>
					<CardDescription>
						Summary of feedback data used for model retraining
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid md:grid-cols-2 gap-6">
						<div className="space-y-4">
							<div className="flex justify-between items-center">
								<span className="text-sm font-medium">
									Feedback Entries Used:
								</span>
								<Badge variant="outline">
									{currentSession.feedbackEntriesUsed}
								</Badge>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-sm font-medium">Total Available:</span>
								<Badge variant="outline">
									{currentSession.totalFeedbackEntries}
								</Badge>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-sm font-medium">Utilization Rate:</span>
								<Badge className="bg-green-100 text-green-800">
									{Math.round(
										(currentSession.feedbackEntriesUsed /
											currentSession.totalFeedbackEntries) *
											100,
									)}
									%
								</Badge>
							</div>
						</div>

						<div className="bg-gsk-blue/10 border border-gsk-blue/20 rounded-lg p-4">
							<h4 className="font-semibold text-gsk-blue mb-2">Data Source</h4>
							<p className="text-sm text-gray-700 mb-2">
								<strong>Firestore Collection:</strong> 'Feedback'
							</p>
							<p className="text-xs text-gray-600">
								Feedback entries contain manager corrections on root cause
								predictions, providing high-quality training data for model
								improvement.
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* 6. Logs and Error Messages */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<FileText className="h-5 w-5 text-gray-600" />
						Process Logs
					</CardTitle>
					<CardDescription>
						Detailed logs and messages from the retraining process
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ScrollArea className="h-64 w-full border rounded-lg p-4">
						<div className="space-y-3">
							{currentSession.logs.map((log, index) => (
								<div key={index} className="flex items-start gap-3 text-sm">
									<div className="mt-0.5">{getLogIcon(log.level)}</div>
									<div className="flex-1 space-y-1">
										<div className="flex items-center gap-2">
											<span className="text-xs text-gray-500 font-mono">
												{log.timestamp.toLocaleTimeString()}
											</span>
											<Badge variant="outline" className="text-xs">
												{log.level.toUpperCase()}
											</Badge>
										</div>
										<p className="text-gray-700">{log.message}</p>
									</div>
								</div>
							))}
						</div>
					</ScrollArea>
				</CardContent>
			</Card>

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
										{currentSession.accuracyBefore}%
									</Badge>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm">Expected Accuracy After:</span>
									<Badge className="bg-green-100 text-green-800">
										{currentSession.accuracyAfter || "~92.5%"}
									</Badge>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm">Projected Improvement:</span>
									<Badge className="bg-blue-100 text-blue-800">
										+
										{(
											(currentSession.accuracyAfter || 92.5) -
											currentSession.accuracyBefore
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
