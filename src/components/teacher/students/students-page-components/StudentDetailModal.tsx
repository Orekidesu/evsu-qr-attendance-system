"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Mail, BookOpen, Calendar, Clock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  StudentWithAttendance,
  StudentAttendanceHistory,
} from "@/hooks/useTeacherStudentsData";

interface StudentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentWithAttendance | null;
  fetchAttendanceHistory: (
    studentId: string
  ) => Promise<StudentAttendanceHistory[]>;
}

export function StudentDetailModal({
  isOpen,
  onClose,
  student,
  fetchAttendanceHistory,
}: StudentDetailModalProps) {
  const [attendanceHistory, setAttendanceHistory] = useState<
    StudentAttendanceHistory[]
  >([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      if (!student) return;

      setIsLoadingHistory(true);
      setHistoryError(null);

      try {
        const history = await fetchAttendanceHistory(student.studentId);
        setAttendanceHistory(history);
      } catch (err) {
        console.error("Error loading attendance history:", err);
        setHistoryError("Failed to load attendance history");
      } finally {
        setIsLoadingHistory(false);
      }
    };

    if (isOpen && student) {
      loadHistory();
    } else {
      setAttendanceHistory([]);
      setHistoryError(null);
    }
  }, [isOpen, student, fetchAttendanceHistory]);

  if (!student) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getStatusColor = (status: string) => {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Student Details</DialogTitle>
        </DialogHeader>

        {/* Student Profile */}
        <div className="flex items-center gap-4 p-6 bg-muted/50 rounded-lg">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="text-2xl">
              {getInitials(student.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="text-2xl font-bold">{student.name}</h3>
            <div className="flex flex-col gap-1 mt-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                {student.student_id}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                {student.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BookOpen className="h-4 w-4" />
                {student.program_name}
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Present
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {student.presentPercentage}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {student.presentCount} of {student.totalRecords} sessions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Late
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {student.latePercentage}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {student.lateCount} of {student.totalRecords} sessions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Absent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {student.absentPercentage}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {student.absentCount} of {student.totalRecords} sessions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Attendance History */}
        <div className="mt-6">
          <h4 className="text-lg font-semibold mb-4">Attendance History</h4>

          {isLoadingHistory && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          )}

          {historyError && (
            <Alert variant="destructive">
              <AlertDescription>{historyError}</AlertDescription>
            </Alert>
          )}

          {!isLoadingHistory &&
            !historyError &&
            attendanceHistory.length === 0 && (
              <Alert>
                <AlertDescription>
                  No attendance records found for this student.
                </AlertDescription>
              </Alert>
            )}

          {!isLoadingHistory &&
            !historyError &&
            attendanceHistory.length > 0 && (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {attendanceHistory.map((record, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {record.formattedDate}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {record.formattedTime}
                          </span>
                        </div>
                        {record.schedule && (
                          <span className="text-xs text-muted-foreground mt-1">
                            Schedule: {record.schedule.days?.join(", ")}{" "}
                            {record.schedule.time_start} -{" "}
                            {record.schedule.time_end}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge className={getStatusColor(record.status)}>
                      {record.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
