"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { updateAttendance } from "@/lib/firebase/firestore/attendance";
import { toast } from "sonner";
import type { RecentAttendanceRecord } from "@/hooks/useTeacherDashboardData";

interface RecentAttendanceFeedProps {
  records: RecentAttendanceRecord[];
  isLoading: boolean;
  onUpdateAction?: () => void;
}

export function RecentAttendanceFeed({
  records,
  isLoading,
  onUpdateAction,
}: RecentAttendanceFeedProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const getStatusColor = (status: "Present" | "Late" | "Absent") => {
    switch (status) {
      case "Present":
        return "bg-green-500";
      case "Late":
        return "bg-yellow-500";
      case "Absent":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleStatusChange = async (
    record: RecentAttendanceRecord,
    newStatus: "Present" | "Late" | "Absent"
  ) => {
    setUpdatingId(record.id);
    try {
      await updateAttendance(record.subjectId, record.id, {
        status: newStatus,
      });
      toast.success("Attendance Updated", {
        description: `${record.studentName} marked as ${newStatus}`,
      });
      if (onUpdateAction) {
        onUpdateAction();
      }
    } catch (err) {
      console.error("Error updating attendance:", err);
      toast.error("Update Failed", {
        description: "Failed to update attendance status",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance Feed</CardTitle>
          <CardDescription>Latest attendance records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (records.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance Feed</CardTitle>
          <CardDescription>Latest attendance records</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              No recent attendance records found. Start scanning to see records
              here.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Attendance Feed</CardTitle>
        <CardDescription>
          Latest {records.length} attendance records
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {records.map((record) => (
            <div
              key={record.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
            >
              <div className="flex-1">
                <p className="font-semibold">{record.studentName}</p>
                <p className="text-sm text-muted-foreground">
                  {record.subjectCode} • {record.formattedDate}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={getStatusColor(record.status)}>
                  {record.status}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={updatingId === record.id}
                    >
                      {updatingId === record.id ? "Updating..." : "Edit"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleStatusChange(record, "Present")}
                    >
                      Mark Present
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleStatusChange(record, "Late")}
                    >
                      Mark Late
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleStatusChange(record, "Absent")}
                    >
                      Mark Absent
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
