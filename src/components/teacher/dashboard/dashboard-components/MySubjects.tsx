"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Users, BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import type { SubjectWithDetails } from "@/hooks/useTeacherDashboardData";

interface MySubjectsProps {
  subjects: SubjectWithDetails[];
  isLoading: boolean;
}

export function MySubjects({ subjects, isLoading }: MySubjectsProps) {
  const router = useRouter();

  const handleScanAttendance = (subjectId: string) => {
    router.push(`/teacher/attendance?subject=${subjectId}`);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            My Subjects
          </CardTitle>
          <CardDescription>
            Your assigned subjects and schedules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (subjects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            My Subjects
          </CardTitle>
          <CardDescription>
            Your assigned subjects and schedules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              No subjects assigned yet. Please contact your administrator.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          My Subjects
        </CardTitle>
        <CardDescription>Your assigned subjects and schedules</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow space-y-3"
            >
              <div>
                <p className="text-sm font-semibold text-muted-foreground">
                  {subject.course_code}
                </p>
                <p className="font-bold text-lg">{subject.descriptive_title}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {subject.formattedSchedules}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  {subject.studentCount} students
                </div>
              </div>
              <Button
                className="w-full"
                onClick={() => handleScanAttendance(subject.id)}
              >
                Scan Attendance
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
