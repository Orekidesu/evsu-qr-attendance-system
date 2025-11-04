"use client";

import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDashboardData } from "@/hooks/useDashboardData";
import { SummaryCards } from "./summary-cards";
import { RecentActivity } from "./recent-activity";
import { QuickActions } from "./quick-actions";

export function DashboardPageContent() {
  const { stats, recentStudents, recentSubjects, isLoading, error } =
    useDashboardData();

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <SummaryCards stats={stats} />

      <QuickActions />

      <RecentActivity
        recentStudents={recentStudents}
        recentSubjects={recentSubjects}
      />
    </div>
  );
}
