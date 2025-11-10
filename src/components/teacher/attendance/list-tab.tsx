"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAttendanceData } from "@/hooks/useAttendanceData";
import type { AttendanceStatus, Attendance } from "@/lib/types/attendance";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  FilterControls,
  ExportButton,
  AttendanceTable,
  type AttendanceRecord,
} from "./list-tab-components";

interface ListTabProps {
  subjectId: string;
  date: string;
}

export default function ListTab({ subjectId, date }: ListTabProps) {
  const {
    subjects,
    enrollmentsBySubject,
    removeAttendance,
    modifyAttendance,
    fetchAttendance,
  } = useAttendanceData();

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Get current date for default date range
  const today = new Date().toISOString().split("T")[0];
  const firstDayOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  )
    .toISOString()
    .split("T")[0];

  const [dateFrom, setDateFrom] = useState(firstDayOfMonth);
  const [dateTo, setDateTo] = useState(today);

  const enrolledStudents = useMemo(
    () => enrollmentsBySubject.get(subjectId) || [],
    [subjectId, enrollmentsBySubject]
  );

  // Load attendance records
  useEffect(() => {
    const loadAttendanceRecords = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch all attendance records for the subject
        const attendanceData = await fetchAttendance(subjectId, "");

        // Map to AttendanceRecord format with student details
        const mappedRecords: AttendanceRecord[] = attendanceData.map(
          (record: Attendance) => {
            const student = enrolledStudents.find(
              (s: { id: string }) => s.id === record.student_id
            );

            return {
              id: record.id,
              attendanceId: record.id,
              studentId: student?.id || record.student_id,
              student_id: student?.student_id || "Unknown",
              name: student
                ? `${student.first_name} ${student.last_name}`
                : "Unknown Student",
              date: record.date,
              status: record.status,
              time:
                record.timestamp?.toDate?.()?.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                }) || "N/A",
              schedule: `${record.schedule.time_start} - ${record.schedule.time_end}`,
            };
          }
        );

        setRecords(mappedRecords);
      } catch (err) {
        console.error("Error loading attendance records:", err);
        setError("Failed to load attendance records");
        toast.error("Failed to load records", {
          description: "Could not fetch attendance data from the database",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (enrolledStudents.length > 0) {
      loadAttendanceRecords();
    } else {
      setIsLoading(false);
    }
  }, [subjectId, enrolledStudents, fetchAttendance]);

  // Filter records based on status, search term, and date range
  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesStatus =
        statusFilter === "all" ||
        record.status.toLowerCase() === statusFilter.toLowerCase();

      const matchesSearch =
        record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.student_id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDateRange = record.date >= dateFrom && record.date <= dateTo;

      return matchesStatus && matchesSearch && matchesDateRange;
    });
  }, [records, statusFilter, searchTerm, dateFrom, dateTo]);

  // Delete attendance record
  const handleDeleteRecord = async (attendanceId: string) => {
    try {
      await removeAttendance(subjectId, attendanceId);
      setRecords(records.filter((r) => r.attendanceId !== attendanceId));
      toast.success("Record Deleted", {
        description: "Attendance record has been removed",
      });
    } catch (err) {
      console.error("Error deleting record:", err);
      toast.error("Failed to Delete", {
        description: "Could not remove the attendance record",
      });
    }
  };

  // Change status of attendance record
  const handleStatusChange = async (
    attendanceId: string,
    newStatus: AttendanceStatus
  ) => {
    try {
      await modifyAttendance(subjectId, attendanceId, { status: newStatus });
      setRecords(
        records.map((r) =>
          r.attendanceId === attendanceId ? { ...r, status: newStatus } : r
        )
      );
      toast.success("Status Updated", {
        description: `Status changed to ${newStatus}`,
      });
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to Update", {
        description: "Could not update the attendance status",
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Empty enrolled students state
  if (enrolledStudents.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            No students enrolled in this subject
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <FilterControls
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            dateFrom={dateFrom}
            onDateFromChange={setDateFrom}
            dateTo={dateTo}
            onDateToChange={setDateTo}
            today={today}
          />

          {/* Export Button */}
          <ExportButton
            filteredRecords={filteredRecords}
            subjects={subjects}
            subjectId={subjectId}
            dateFrom={dateFrom}
            dateTo={dateTo}
          />

          {/* Table */}
          <AttendanceTable
            filteredRecords={filteredRecords}
            totalRecords={records.length}
            onStatusChange={handleStatusChange}
            onDeleteRecord={handleDeleteRecord}
          />
        </CardContent>
      </Card>
    </div>
  );
}
