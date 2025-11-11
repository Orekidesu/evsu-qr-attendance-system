"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, TrendingUp, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardStats } from "@/hooks/useTeacherDashboardData";

interface QuickStatsProps {
  stats: DashboardStats;
  isLoading: boolean;
}

export function QuickStats({ stats, isLoading }: QuickStatsProps) {
  const statCards = [
    {
      label: "Total Students",
      value: stats.totalStudents.toString(),
      icon: Users,
    },
    {
      label: "Today's Attendance Rate",
      value: `${stats.todayAttendanceRate}%`,
      icon: TrendingUp,
    },
    {
      label: "Pending Classes",
      value: stats.pendingClasses.toString(),
      icon: AlertCircle,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <Icon className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
