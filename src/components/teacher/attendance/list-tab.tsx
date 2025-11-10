"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Download, Trash2, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAttendanceData } from "@/hooks/useAttendanceData";
import type { AttendanceStatus, Attendance } from "@/lib/types/attendance";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AttendanceRecord {
  id: string;
  attendanceId: string;
  studentId: string;
  student_id: string;
  name: string;
  date: string;
  status: AttendanceStatus;
  time: string;
  schedule: string;
}

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

  // Get status badge color
  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case "Present":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Late":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Absent":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Export placeholder functions
  const handleExportCSV = () => {
    try {
      // Prepare CSV headers
      const headers = [
        "Student ID",
        "Student Name",
        "Date",
        "Time",
        "Schedule",
        "Status",
      ];

      // Prepare CSV rows from filtered records
      const rows = filteredRecords.map((record) => [
        record.student_id,
        record.name,
        new Date(record.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        record.time,
        record.schedule,
        record.status,
      ]);

      // Combine headers and rows
      const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
        ),
      ].join("\n");

      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      // Generate filename with subject name and formatted date range
      const subject = subjects.find((s) => s.id === subjectId);
      const subjectName = subject
        ? subject.descriptive_title.replace(/[^a-zA-Z0-9]/g, "_")
        : subjectId;
      const dateFromFormatted = new Date(dateFrom).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const dateToFormatted = new Date(dateTo).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const timestamp = new Date()
        .toISOString()
        .slice(0, 16)
        .replace("T", "_")
        .replace(/:/g, "-");
      const filename = `${subjectName}_Attendance_${dateFromFormatted}_to_${dateToFormatted}_${timestamp}.csv`;

      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("CSV Downloaded", {
        description: `Exported ${filteredRecords.length} records successfully`,
      });
    } catch (err) {
      console.error("Error exporting CSV:", err);
      toast.error("Export Failed", {
        description: "Could not generate CSV file",
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <Input
                placeholder="Student name or ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">From</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                max={dateTo}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">To</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                min={dateFrom}
                max={today}
              />
            </div>
          </div>

          {/* Export Button */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV ({filteredRecords.length} records)
            </Button>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((record) => (
                    <TableRow key={record.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        {record.student_id}
                      </TableCell>
                      <TableCell>{record.name}</TableCell>
                      <TableCell>
                        {new Date(record.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {record.time}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {record.schedule}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={record.status}
                          onValueChange={(value) =>
                            handleStatusChange(
                              record.attendanceId,
                              value as AttendanceStatus
                            )
                          }
                        >
                          <SelectTrigger
                            className={`w-28 h-7 text-xs ${getStatusColor(record.status)}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Present">Present</SelectItem>
                            <SelectItem value="Late">Late</SelectItem>
                            <SelectItem value="Absent">Absent</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogTitle>Delete Record?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this attendance
                              record for {record.name}? This action cannot be
                              undone.
                            </AlertDialogDescription>
                            <div className="flex gap-2 justify-end">
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleDeleteRecord(record.attendanceId)
                                }
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </div>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      {records.length === 0
                        ? "No attendance records yet"
                        : "No records match your filters"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <p className="text-sm text-muted-foreground">
            Showing {filteredRecords.length} of {records.length} records
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
