"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OverallStats } from "@/hooks/useAttendanceStats";

interface SummaryCardsProps {
  stats: OverallStats;
}

export default function SummaryCards({ stats }: SummaryCardsProps) {
  const totalRecords = stats.totalPresent + stats.totalLate + stats.totalAbsent;
  const presentPercentage =
    totalRecords > 0
      ? ((stats.totalPresent / totalRecords) * 100).toFixed(1)
      : "0.0";
  const latePercentage =
    totalRecords > 0
      ? ((stats.totalLate / totalRecords) * 100).toFixed(1)
      : "0.0";
  const absentPercentage =
    totalRecords > 0
      ? ((stats.totalAbsent / totalRecords) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Overall Attendance Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{stats.overallRate.toFixed(1)}%</p>
          <p className="text-xs text-muted-foreground mt-1">
            {totalRecords} total records
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Present
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-green-600">
            {stats.totalPresent}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {presentPercentage}% of total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Late
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-yellow-600">
            {stats.totalLate}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {latePercentage}% of total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Absent
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-red-600">{stats.totalAbsent}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {absentPercentage}% of total
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
