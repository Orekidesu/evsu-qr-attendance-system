"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAttendanceData } from "@/hooks/useAttendanceData";
import { useCameraQR } from "@/hooks/useCameraQR";
import type { Schedule } from "@/lib/types/subject";
import type { AttendanceStatus, Attendance } from "@/lib/types/attendance";
import {
  CameraViewfinder,
  RecentScans,
  SessionInfo,
  type ScanRecord,
} from "./scan-tab-components";

interface ScanTabProps {
  subjectId: string;
  schedule: Schedule;
  date: string;
}

// Debounce configuration
const SCAN_COOLDOWN_MS = 2500; // 2.5 seconds between scans
const DUPLICATE_SCAN_WINDOW_MS = 5000; // 5 seconds to prevent immediate duplicate

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

  // Debounce and duplicate prevention refs
  const lastScanTime = useRef<number>(0);
  const recentlyScannedQRs = useRef<Map<string, number>>(new Map());
  const scanCooldownTimer = useRef<NodeJS.Timeout | null>(null);

  const enrolledStudents = useMemo(
    () => enrollmentsBySubject.get(subjectId) || [],
    [subjectId, enrollmentsBySubject]
  );

  const totalStudents = enrolledStudents.length;
  const presentCount = scans.filter((s) => s.status === "Present").length;
  const lateCount = scans.filter((s) => s.status === "Late").length;
  const absentCount = totalStudents - presentCount - lateCount;

  // Format schedule start time for display
  const scheduleStartTime = useMemo(() => {
    try {
      const [hour, minute] = schedule.time_start.split(":").map(Number);
      const time = new Date();
      time.setHours(hour, minute);
      return time.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "09:00 AM";
    }
  }, [schedule.time_start]);

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

  // Cleanup debounce timers on unmount
  useEffect(() => {
    return () => {
      if (scanCooldownTimer.current) {
        clearTimeout(scanCooldownTimer.current);
      }
      // Clear old entries from recently scanned map
      recentlyScannedQRs.current.clear();
    };
  }, []);

  // Check if QR code was recently scanned
  const isRecentlyScanned = useCallback((studentId: string): boolean => {
    const now = Date.now();
    const lastScanTimestamp = recentlyScannedQRs.current.get(studentId);

    if (lastScanTimestamp) {
      const timeSinceLastScan = now - lastScanTimestamp;
      if (timeSinceLastScan < DUPLICATE_SCAN_WINDOW_MS) {
        return true;
      }
      // Clean up old entry
      recentlyScannedQRs.current.delete(studentId);
    }

    return false;
  }, []);

  // Check if scanner is in cooldown period
  const isInCooldown = useCallback((): boolean => {
    const now = Date.now();
    const timeSinceLastScan = now - lastScanTime.current;
    return timeSinceLastScan < SCAN_COOLDOWN_MS;
  }, []);

  // Handle scanning a student (from QR or manual entry)
  const handleScan = useCallback(
    async (studentIdInput: string, isQRScan: boolean = false) => {
      // Debounce check for QR scans
      if (isQRScan && isInCooldown()) {
        // Silent ignore during cooldown
        return;
      }

      const student = enrolledStudents.find(
        (s: { student_id: string }) => s.student_id === studentIdInput
      );

      if (!student) {
        toast.error("Not Enrolled", {
          description: `Student ${studentIdInput} is not enrolled in this subject`,
        });
        return;
      }

      // Check if already has attendance record for today/schedule
      if (scans.some((r) => r.studentId === student.id)) {
        toast.warning("Already Marked", {
          description: `${student.first_name} ${student.last_name} already has attendance recorded for this session`,
        });
        return;
      }

      // Check if this QR was scanned very recently (rapid duplicate prevention)
      if (isQRScan && isRecentlyScanned(student.id)) {
        // Silent ignore - prevents duplicate toast spam
        return;
      }

      try {
        // Update last scan time for debounce
        if (isQRScan) {
          lastScanTime.current = Date.now();
          recentlyScannedQRs.current.set(student.id, Date.now());

          // Set cooldown timer to clean up after window expires
          if (scanCooldownTimer.current) {
            clearTimeout(scanCooldownTimer.current);
          }
          scanCooldownTimer.current = setTimeout(() => {
            const now = Date.now();
            // Clean up entries older than the duplicate window
            recentlyScannedQRs.current.forEach((timestamp, key) => {
              if (now - timestamp > DUPLICATE_SCAN_WINDOW_MS) {
                recentlyScannedQRs.current.delete(key);
              }
            });
          }, DUPLICATE_SCAN_WINDOW_MS);
        }

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
    [
      enrolledStudents,
      scans,
      schedule,
      subjectId,
      date,
      recordAttendance,
      isInCooldown,
      isRecentlyScanned,
    ]
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

        // Pass true to indicate this is a QR scan (triggers debounce)
        await handleScan(result.studentId, true);
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
      // Pass false to indicate manual entry (bypasses debounce cooldown)
      handleScan(manualEntry.trim().toUpperCase(), false);
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
        <CameraViewfinder
          camera={camera}
          manualEntry={manualEntry}
          onManualEntryChange={setManualEntry}
          onManualEntrySubmit={handleManualEntry}
        />

        <RecentScans
          scans={scans}
          onStatusChange={changeStatus}
          onRemoveScan={undoScan}
        />
      </div>

      {/* Right Side - Session Info */}
      <div className="space-y-4">
        <SessionInfo
          totalStudents={totalStudents}
          presentCount={presentCount}
          lateCount={lateCount}
          absentCount={absentCount}
          scheduleStartTime={scheduleStartTime}
          onMarkRemainingAbsent={markRemainingAbsent}
          onClearAll={clearAll}
        />
      </div>
    </div>
  );
}
