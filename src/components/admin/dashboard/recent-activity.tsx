import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserPlus, BookPlus } from "lucide-react";
import type { RecentStudent, RecentSubject } from "@/hooks/useDashboardData";

interface RecentActivityProps {
  recentStudents: RecentStudent[];
  recentSubjects: RecentSubject[];
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400)
    return `${Math.floor(seconds / 3600)} hour${Math.floor(seconds / 3600) > 1 ? "s" : ""} ago`;
  if (seconds < 604800)
    return `${Math.floor(seconds / 86400)} day${Math.floor(seconds / 86400) > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
}

export function RecentActivity({
  recentStudents,
  recentSubjects,
}: RecentActivityProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Recently Added Students */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Recently Added Students
          </CardTitle>
          <CardDescription>Last 5 students added to the system</CardDescription>
        </CardHeader>
        <CardContent>
          {recentStudents.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No students added yet
            </p>
          ) : (
            <div className="space-y-4">
              {recentStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{student.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {student.email}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {getTimeAgo(student.createdAt)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recently Created Subjects */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookPlus className="h-5 w-5" />
            Recently Created Subjects
          </CardTitle>
          <CardDescription>Last 5 subjects added to the system</CardDescription>
        </CardHeader>
        <CardContent>
          {recentSubjects.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No subjects created yet
            </p>
          ) : (
            <div className="space-y-4">
              {recentSubjects.map((subject) => (
                <div
                  key={subject.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{subject.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {subject.programName}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {getTimeAgo(subject.createdAt)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
