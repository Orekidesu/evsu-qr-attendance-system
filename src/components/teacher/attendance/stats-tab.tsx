"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAttendanceStats } from "@/hooks/useAttendanceStats";
import {
  SummaryCards,
  AttendanceTrendsChart,
  DistributionChart,
  StudentBreakdownChart,
} from "./stats-tab-components";

interface StatsTabProps {
  subjectId: string;
}

export default function StatsTab({ subjectId }: StatsTabProps) {
  const {
    isLoading,
    error,
    dailyStats,
    studentStats,
    overallStats,
    distributionData,
    hasData,
  } = useAttendanceStats(subjectId);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Empty state
  if (!hasData) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            No attendance data available yet. Start marking attendance to see
            statistics.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <SummaryCards stats={overallStats} />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Attendance Trends */}
        <AttendanceTrendsChart data={dailyStats} />

        {/* Overall Attendance Distribution */}
        <DistributionChart data={distributionData} />
      </div>

      {/* Per-Student Breakdown */}
      <StudentBreakdownChart data={studentStats} />
    </div>
  );
}
