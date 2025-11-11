"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import type { TodaysClass } from "@/hooks/useTeacherDashboardData";

interface TodaysClassesProps {
  classes: TodaysClass[];
  isLoading: boolean;
}

export function TodaysClasses({ classes, isLoading }: TodaysClassesProps) {
  const router = useRouter();

  const handleQuickScan = (subjectId: string) => {
    router.push(`/teacher/attendance?subject=${subjectId}`);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Classes</CardTitle>
          <CardDescription>Classes scheduled for today</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (classes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Classes</CardTitle>
          <CardDescription>Classes scheduled for today</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              No classes scheduled for today. Enjoy your free day!
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today&apos;s Classes</CardTitle>
        <CardDescription>Classes scheduled for today</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {classes.map((cls) => (
            <div
              key={cls.subjectId}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
            >
              <div className="flex-1">
                <p className="font-semibold">
                  {cls.code} – {cls.title}
                </p>
                <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                  <Clock className="w-4 h-4" />
                  {cls.formattedTime}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant={cls.hasAttendanceToday ? "default" : "secondary"}
                >
                  {cls.hasAttendanceToday ? "Completed" : "Pending"}
                </Badge>
                <Button
                  size="sm"
                  onClick={() => handleQuickScan(cls.subjectId)}
                >
                  Quick Scan
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
