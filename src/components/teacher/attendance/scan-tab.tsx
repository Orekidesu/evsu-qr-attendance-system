"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Video, Type, RotateCcw, X, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAttendanceData } from "@/hooks/useAttendanceData";
import { useCameraQR } from "@/hooks/useCameraQR";
import type { Schedule } from "@/lib/types/subject";
import type { AttendanceStatus, Attendance } from "@/lib/types/attendance";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ScanRecord {
  id: string;
  studentId: string;
  student_id: string;
  name: string;
  time: string;
  status: AttendanceStatus;
  attendanceId: string;
}

interface ScanTabProps {
  subjectId: string;
  schedule: Schedule;
  date: string;
}

export default function ScanTab({ subjectId, schedule, date }: ScanTabProps) {
  const {
    enrollmentsBySubject,
    recordAttendance,
    modifyAttendance,
    removeAttendance,
    fetchAttendance,
  } = useAttendanceData();

  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [manualEntry, setManualEntry] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const enrolledStudents = useMemo(
    () => enrollmentsBySubject.get(subjectId) || [],
    [subjectId, enrollmentsBySubject]
  );

  const totalStudents = enrolledStudents.length;
  const presentCount = scans.filter((s) => s.status === "Present").length;
  const lateCount = scans.filter((s) => s.status === "Late").length;
  const absentCount = totalStudents - presentCount - lateCount;

  // Load existing attendance records
  useEffect(() => {
    const loadAttendance = async () => {
      setIsLoading(true);
      try {
        const records = await fetchAttendance(subjectId, date);
        const mappedRecords: ScanRecord[] = records.map(
          (record: Attendance) => {
            const student = enrolledStudents.find(
              (s: { id: string }) => s.id === record.student_id
            );
            return {
              id: record.id,
              studentId: record.student_id,
              student_id: student?.student_id || "Unknown",
              name: student
                ? `${student.first_name} ${student.last_name}`
                : "Unknown Student",
              time:
                record.timestamp?.toDate?.()?.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                }) || "Unknown",
              status: record.status,
              attendanceId: record.id,
            };
          }
        );
        setScans(mappedRecords);
      } catch (error) {
        console.error("Error loading attendance:", error);
        toast.error("Failed to load attendance records");
      } finally {
        setIsLoading(false);
      }
    };

    loadAttendance();
  }, [subjectId, date, enrolledStudents, fetchAttendance]);

  // Handle scanning a student (from QR or manual entry)
  const handleScan = useCallback(
    async (studentIdInput: string) => {
      const student = enrolledStudents.find(
        (s: { student_id: string }) => s.student_id === studentIdInput
      );

      if (!student) {
        toast.error("Not Enrolled", {
          description: `Student ${studentIdInput} is not enrolled in this subject`,
        });
        return;
      }

      // Check if already scanned
      if (scans.some((r) => r.studentId === student.id)) {
        toast.warning("Already Marked", {
          description: `${student.first_name} ${student.last_name} already has attendance recorded`,
        });
        return;
      }

      try {
        // Determine if late
        const now = new Date();
        const scheduleStart = new Date();
        const [startHour, startMinute] = schedule.time_start
          .split(":")
          .map(Number);
        scheduleStart.setHours(startHour, startMinute, 0);

        const isLate = now > scheduleStart;
        const status: AttendanceStatus = isLate ? "Late" : "Present";

        // Save to Firestore
        const attendanceId = await recordAttendance(subjectId, {
          student_id: student.id,
          date,
          status,
          schedule,
        });

        const newRecord: ScanRecord = {
          id: attendanceId,
          studentId: student.id,
          student_id: student.student_id,
          name: `${student.first_name} ${student.last_name}`,
          time: now.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          status,
          attendanceId,
        };

        setScans([newRecord, ...scans]);
        toast.success("Attendance Marked", {
          description: `${newRecord.name} marked as ${status}`,
        });
        setManualEntry("");
      } catch (error) {
        console.error("Error recording attendance:", error);
        toast.error("Failed to Record", {
          description: "Failed to save attendance record",
        });
      }
    },
    [enrolledStudents, scans, schedule, subjectId, date, recordAttendance]
  );

  // Handle QR code scan with validation
  const handleQRScan = useCallback(
    async (qrCode: string) => {
      try {
        // Validate QR code via API
        const response = await fetch("/api/qr/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ qrCode }),
        });

        const result = await response.json();

        if (!response.ok || !result.valid) {
          toast.error("Invalid QR Code", {
            description: result.error || "QR code validation failed",
          });
          return;
        }

        await handleScan(result.studentId);
      } catch (error) {
        console.error("QR validation error:", error);
        toast.error("Validation Error", {
          description: "Failed to validate QR code",
        });
      }
    },
    [handleScan]
  );

  // Initialize camera with custom hook
  const camera = useCameraQR({
    elementId: "qr-reader",
    onScan: handleQRScan,
    fps: 10,
    qrboxSize: { width: 250, height: 250 },
    debugMode: process.env.NODE_ENV === "development",
  });

  const handleManualEntry = () => {
    if (manualEntry.trim()) {
      handleScan(manualEntry.trim().toUpperCase());
    }
  };

  const changeStatus = async (
    attendanceId: string,
    newStatus: AttendanceStatus
  ) => {
    try {
      await modifyAttendance(subjectId, attendanceId, { status: newStatus });
      setScans(
        scans.map((s) =>
          s.attendanceId === attendanceId ? { ...s, status: newStatus } : s
        )
      );
      toast.success("Status Updated", {
        description: `Attendance status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const undoScan = async (attendanceId: string) => {
    try {
      await removeAttendance(subjectId, attendanceId);
      setScans(scans.filter((s) => s.attendanceId !== attendanceId));
      toast.success("Record Removed", {
        description: "Attendance record removed",
      });
    } catch (error) {
      console.error("Error removing attendance:", error);
      toast.error("Failed to remove record");
    }
  };

  const clearAll = async () => {
    try {
      await Promise.all(
        scans.map((scan) => removeAttendance(subjectId, scan.attendanceId))
      );
      setScans([]);
      toast.success("All records cleared");
    } catch (error) {
      console.error("Error clearing records:", error);
      toast.error("Failed to clear records");
    }
  };

  const markRemainingAbsent = async () => {
    const notScannedStudents = enrolledStudents.filter(
      (student: { id: string }) =>
        !scans.some((s) => s.studentId === student.id)
    );

    if (notScannedStudents.length === 0) {
      toast.info("All students have been marked");
      return;
    }

    try {
      const newRecords: ScanRecord[] = [];

      for (const student of notScannedStudents) {
        const attendanceId = await recordAttendance(subjectId, {
          student_id: student.id,
          date,
          status: "Absent",
          schedule,
        });

        newRecords.push({
          id: attendanceId,
          studentId: student.id,
          student_id: student.student_id,
          name: `${student.first_name} ${student.last_name}`,
          time: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          status: "Absent",
          attendanceId,
        });
      }

      setScans([...scans, ...newRecords]);
      toast.success(`Marked ${notScannedStudents.length} students as absent`);
    } catch (error) {
      console.error("Error marking absent:", error);
      toast.error("Failed to mark students as absent");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Left Side - Camera and Controls */}
      <div className="lg:col-span-2 space-y-4">
        {/* Camera Viewfinder */}
        <Card>
          <CardHeader>
            <CardTitle>QR Camera Viewfinder</CardTitle>
            <CardDescription>
              {camera.isActive
                ? "Camera is active - point at QR code to scan"
                : "Start camera to begin scanning"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Camera Status Display */}
            {!camera.isActive && !camera.isInitializing && (
              <div className="bg-muted rounded-lg aspect-video flex items-center justify-center border-2 border-dashed">
                <div className="text-center">
                  <Video className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Point camera at QR code
                  </p>
                  {camera.error && (
                    <p className="text-xs text-destructive mt-2">
                      {camera.error}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Initializing State */}
            {camera.isInitializing && (
              <div className="bg-muted rounded-lg aspect-video flex items-center justify-center border-2 border-dashed">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Initializing camera...
                  </p>
                </div>
              </div>
            )}

            {/* Control Buttons */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              <Button
                variant={camera.isActive ? "destructive" : "default"}
                onClick={
                  camera.isActive ? camera.stopCamera : camera.startCamera
                }
                disabled={camera.isInitializing || camera.isProcessing}
              >
                <Video className="w-4 h-4 mr-2" />
                {camera.isInitializing
                  ? "Initializing..."
                  : camera.isActive
                    ? "Stop Camera"
                    : "Start Camera"}
              </Button>
              <Button variant="outline" disabled>
                <Type className="w-4 h-4 mr-2" />
                Manual Entry
              </Button>
            </div>

            {/* Camera View */}
            {camera.isActive && (
              <div className="mt-4">
                <div
                  id="qr-reader"
                  className="w-full max-w-md mx-auto border-2 border-primary rounded-lg overflow-hidden"
                  style={{ minHeight: "300px" }}
                />
                {camera.isProcessing && (
                  <div className="text-center text-sm text-muted-foreground mt-2 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing scan...
                  </div>
                )}
              </div>
            )}

            {/* Capability Warnings */}
            {!camera.capabilities.isSecureContext && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Security Warning</AlertTitle>
                <AlertDescription>
                  Camera access requires HTTPS connection. Please use HTTPS or
                  localhost.
                </AlertDescription>
              </Alert>
            )}

            {camera.capabilities.availableCameras === 0 &&
              !camera.isInitializing && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No Camera Detected</AlertTitle>
                  <AlertDescription>
                    No camera devices found. Please connect a camera or check
                    your device settings.
                  </AlertDescription>
                </Alert>
              )}

            {/* Manual Entry Input */}
            <div className="mt-4 space-y-2">
              <label className="text-sm font-medium">
                Or enter Student ID manually
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter Student ID"
                  value={manualEntry}
                  onChange={(e) => setManualEntry(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleManualEntry()}
                />
                <Button onClick={handleManualEntry}>Add</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Scans */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Scans</CardTitle>
            <CardDescription>{scans.length} students scanned</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {scans.length > 0 ? (
                scans.map((scan) => (
                  <div
                    key={scan.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{scan.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {scan.studentId}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground mr-2">
                      {scan.time}
                    </span>
                    <select
                      value={scan.status}
                      onChange={(e) =>
                        changeStatus(
                          scan.attendanceId,
                          e.target.value as AttendanceStatus
                        )
                      }
                      className="text-xs px-2 py-1 border rounded"
                    >
                      <option value="Present">Present</option>
                      <option value="Late">Late</option>
                      <option value="Absent">Absent</option>
                    </select>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => undoScan(scan.attendanceId)}
                      className="ml-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No scans yet. Start by clicking &quot;Start Camera&quot; or
                  entering a Student ID.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Side - Session Info */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Session Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Stats */}
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{totalStudents}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Present</p>
                <p className="text-2xl font-bold text-green-600">
                  {presentCount}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Late</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {lateCount}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Absent</p>
                <p className="text-2xl font-bold text-red-600">{absentCount}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-medium">Start Time: 09:00 AM</p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-4 border-t">
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={markRemainingAbsent}
              >
                Mark Remaining Absent
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full bg-transparent">
                    <X className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogTitle>Clear All Scans?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove all scanned records. This action cannot be
                    undone.
                  </AlertDialogDescription>
                  <div className="flex gap-2 justify-end">
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={clearAll}
                      className="bg-destructive"
                    >
                      Clear All
                    </AlertDialogAction>
                  </div>
                </AlertDialogContent>
              </AlertDialog>
              <Button className="w-full bg-primary">End Session</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
