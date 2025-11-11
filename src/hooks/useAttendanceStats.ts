"use client";

import { useState, useEffect, useMemo } from "react";
import { useAttendanceData, type EnrolledStudent } from "./useAttendanceData";
import type { Attendance, AttendanceStatus } from "@/lib/types/attendance";

export interface DailyStats {
  date: string;
  present: number;
  late: number;
  absent: number;
  total: number;
}

export interface StudentStats {
  studentId: string;
  student_id: string;
  name: string;
  present: number;
  late: number;
  absent: number;
  total: number;
  attendanceRate: number;
}

export interface OverallStats {
  totalSessions: number;
  totalStudents: number;
  totalPresent: number;
  totalLate: number;
  totalAbsent: number;
  overallRate: number;
}

export function useAttendanceStats(subjectId: string) {
  const { enrollmentsBySubject, fetchAttendance } = useAttendanceData();
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const enrolledStudents = useMemo(
    () => enrollmentsBySubject.get(subjectId) || [],
    [subjectId, enrollmentsBySubject]
  );

  // Fetch all attendance records
  useEffect(() => {
    const loadAttendance = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const records = await fetchAttendance(subjectId, "");
        setAttendanceRecords(records);
      } catch (err) {
        console.error("Error loading attendance for stats:", err);
        setError("Failed to load attendance statistics");
      } finally {
        setIsLoading(false);
      }
    };

    if (enrolledStudents.length > 0) {
      loadAttendance();
    } else {
      setIsLoading(false);
    }
  }, [subjectId, enrolledStudents, fetchAttendance]);

  // Calculate daily statistics
  const dailyStats = useMemo<DailyStats[]>(() => {
    const dailyMap = new Map<string, DailyStats>();

    attendanceRecords.forEach((record) => {
      if (!dailyMap.has(record.date)) {
        dailyMap.set(record.date, {
          date: record.date,
          present: 0,
          late: 0,
          absent: 0,
          total: 0,
        });
      }

      const stats = dailyMap.get(record.date)!;
      stats.total++;

      if (record.status === "Present") stats.present++;
      else if (record.status === "Late") stats.late++;
      else if (record.status === "Absent") stats.absent++;
    });

    return Array.from(dailyMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [attendanceRecords]);

  // Calculate per-student statistics
  const studentStats = useMemo<StudentStats[]>(() => {
    const studentMap = new Map<string, StudentStats>();

    // Initialize all enrolled students
    enrolledStudents.forEach((student: EnrolledStudent) => {
      studentMap.set(student.id, {
        studentId: student.id,
        student_id: student.student_id,
        name: `${student.first_name} ${student.last_name}`,
        present: 0,
        late: 0,
        absent: 0,
        total: 0,
        attendanceRate: 0,
      });
    });

    // Aggregate attendance data
    attendanceRecords.forEach((record: Attendance) => {
      const stats = studentMap.get(record.student_id);
      if (stats) {
        stats.total++;
        if (record.status === "Present") stats.present++;
        else if (record.status === "Late") stats.late++;
        else if (record.status === "Absent") stats.absent++;
      }
    });

    // Calculate attendance rates
    studentMap.forEach((stats: StudentStats) => {
      if (stats.total > 0) {
        stats.attendanceRate =
          ((stats.present + stats.late) / stats.total) * 100;
      }
    });

    return Array.from(studentMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [attendanceRecords, enrolledStudents]);

  // Calculate overall statistics
  const overallStats = useMemo<OverallStats>(() => {
    const uniqueDates = new Set(attendanceRecords.map((r) => r.date));
    const totalSessions = uniqueDates.size;

    const totalPresent = attendanceRecords.filter(
      (r) => r.status === "Present"
    ).length;
    const totalLate = attendanceRecords.filter(
      (r) => r.status === "Late"
    ).length;
    const totalAbsent = attendanceRecords.filter(
      (r) => r.status === "Absent"
    ).length;

    const totalRecords = attendanceRecords.length;
    const overallRate =
      totalRecords > 0 ? ((totalPresent + totalLate) / totalRecords) * 100 : 0;

    return {
      totalSessions,
      totalStudents: enrolledStudents.length,
      totalPresent,
      totalLate,
      totalAbsent,
      overallRate,
    };
  }, [attendanceRecords, enrolledStudents]);

  // Distribution data for pie chart
  const distributionData = useMemo(
    () => [
      { name: "Present", value: overallStats.totalPresent, color: "#10b981" },
      { name: "Late", value: overallStats.totalLate, color: "#f59e0b" },
      { name: "Absent", value: overallStats.totalAbsent, color: "#ef4444" },
    ],
    [overallStats]
  );

  return {
    isLoading,
    error,
    dailyStats,
    studentStats,
    overallStats,
    distributionData,
    hasData: attendanceRecords.length > 0,
  };
}
