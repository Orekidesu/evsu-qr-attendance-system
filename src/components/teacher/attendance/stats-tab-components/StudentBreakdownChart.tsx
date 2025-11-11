"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { StudentStats } from "@/hooks/useAttendanceStats";

interface StudentBreakdownChartProps {
  data: StudentStats[];
}

export default function StudentBreakdownChart({
  data,
}: StudentBreakdownChartProps) {
  // Filter students with attendance data and limit to top 10
  const studentsWithData = data.filter((s) => s.total > 0).slice(0, 10);

  if (studentsWithData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Per-Student Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No student attendance data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Per-Student Breakdown</CardTitle>
        {data.length > 10 && (
          <p className="text-sm text-muted-foreground">
            Showing top 10 students (total:{" "}
            {data.filter((s) => s.total > 0).length})
          </p>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={studentsWithData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="present" fill="#10b981" name="Present" />
            <Bar dataKey="late" fill="#f59e0b" name="Late" />
            <Bar dataKey="absent" fill="#ef4444" name="Absent" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
