"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useTeacherDashboardData } from "@/hooks/useTeacherDashboardData";
import {
  QuickStats,
  MySubjects,
  TodaysClasses,
  RecentAttendanceFeed,
} from "./dashboard-components";

export function DashboardPageContent() {
  const {
    subjectsWithDetails,
    todaysClasses,
    recentAttendance,
    dashboardStats,
    isLoading,
    error,
  } = useTeacherDashboardData();

  // Error state
  if (error) {
    return (
      <div className="space-y-6 p-6">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-8 p-6">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-6 w-96" />
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>

        {/* Content Skeleton */}
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const handleRefreshFeed = () => {
    // This will trigger a re-fetch by the hook
    window.location.reload();
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Today is{" "}
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Quick Stats */}
      <QuickStats stats={dashboardStats} isLoading={false} />

      {/* My Subjects */}
      <MySubjects subjects={subjectsWithDetails} isLoading={false} />

      {/* Today's Classes */}
      <TodaysClasses classes={todaysClasses} isLoading={false} />

      {/* Recent Attendance Feed */}
      <RecentAttendanceFeed
        records={recentAttendance}
        isLoading={false}
        onUpdateAction={handleRefreshFeed}
      />
    </div>
  );
}
