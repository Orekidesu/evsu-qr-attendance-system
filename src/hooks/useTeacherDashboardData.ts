"use client";

import { useState, useEffect, useMemo } from "react";
import { useAttendanceData } from "./useAttendanceData";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { Attendance } from "@/lib/types/attendance";
import type { Subject, Schedule } from "@/lib/types/subject";

export interface SubjectWithDetails extends Subject {
  studentCount: number;
  formattedSchedules: string;
}

export interface TodaysClass {
  subjectId: string;
  code: string;
  title: string;
  schedules: Schedule[];
  formattedTime: string;
  hasAttendanceToday: boolean;
}

export interface RecentAttendanceRecord extends Attendance {
  studentName: string;
  subjectCode: string;
  formattedDate: string;
  subjectId: string;
}

export interface DashboardStats {
  totalStudents: number;
  todayAttendanceRate: number;
  pendingClasses: number;
}

export function useTeacherDashboardData() {
  const { subjects, enrollmentsBySubject } = useAttendanceData();
  const [recentAttendance, setRecentAttendance] = useState<
    RecentAttendanceRecord[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Format schedules helper
  const formatSchedules = (schedules: Schedule[]): string => {
    if (!schedules || schedules.length === 0) return "N/A";
    return schedules
      .map((schedule) => {
        if (!schedule.days || !schedule.time_start || !schedule.time_end) {
          return "Invalid schedule";
        }
        return `${schedule.days.join("/")} ${schedule.time_start}–${schedule.time_end}`;
      })
      .join(", ");
  };

  // Get subjects with details
  const subjectsWithDetails: SubjectWithDetails[] = useMemo(() => {
    return subjects.map((subject) => {
      const enrolledStudents = enrollmentsBySubject.get(subject.id) || [];
      return {
        ...subject,
        studentCount: enrolledStudents.length,
        formattedSchedules: formatSchedules(subject.schedules),
      };
    });
  }, [subjects, enrollmentsBySubject]);

  // Get today's classes
  const todaysClasses: TodaysClass[] = useMemo(() => {
    const today = new Date();
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const currentDay = dayNames[today.getDay()];

    return subjects
      .filter((subject) => {
        return subject.schedules?.some((schedule) =>
          schedule.days?.includes(currentDay)
        );
      })
      .map((subject) => {
        const todaySchedules = subject.schedules.filter((schedule) =>
          schedule.days?.includes(currentDay)
        );

        return {
          subjectId: subject.id,
          code: subject.course_code,
          title: subject.descriptive_title,
          schedules: todaySchedules,
          formattedTime: todaySchedules
            .map((s) => `${s.time_start}–${s.time_end}`)
            .join(", "),
          hasAttendanceToday: false, // Will be updated after fetching attendance
        };
      });
  }, [subjects]);

  // Calculate dashboard stats
  const dashboardStats: DashboardStats = useMemo(() => {
    // Total students across all subjects (unique students)
    const allStudentIds = new Set<string>();
    enrollmentsBySubject.forEach((students) => {
      students.forEach((student: { id: string }) =>
        allStudentIds.add(student.id)
      );
    });

    // Today's attendance rate (calculated from recent attendance)
    const todayDate = new Date().toISOString().split("T")[0];
    const todayRecords = recentAttendance.filter((r) => r.date === todayDate);
    const presentOrLate = todayRecords.filter(
      (r) => r.status === "Present" || r.status === "Late"
    ).length;
    const todayAttendanceRate =
      todayRecords.length > 0
        ? Math.round((presentOrLate / todayRecords.length) * 100)
        : 0;

    return {
      totalStudents: allStudentIds.size,
      todayAttendanceRate,
      pendingClasses: todaysClasses.filter((c) => !c.hasAttendanceToday).length,
    };
  }, [enrollmentsBySubject, recentAttendance, todaysClasses]);

  // Fetch recent attendance records
  useEffect(() => {
    const fetchRecentAttendance = async () => {
      if (subjects.length === 0) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const allRecords: RecentAttendanceRecord[] = [];

        // Fetch recent attendance from each subject
        await Promise.all(
          subjects.map(async (subject) => {
            try {
              const attendanceRef = collection(
                db,
                "subjects",
                subject.id,
                "attendance"
              );
              const q = query(
                attendanceRef,
                orderBy("timestamp", "desc"),
                limit(5)
              );

              const snapshot = await getDocs(q);
              const enrolledStudents =
                enrollmentsBySubject.get(subject.id) || [];

              snapshot.docs.forEach((doc) => {
                const data = doc.data() as Attendance;
                const student = enrolledStudents.find(
                  (s: { id: string }) => s.id === data.student_id
                );

                if (student) {
                  allRecords.push({
                    ...data,
                    id: doc.id,
                    subjectId: subject.id,
                    studentName: `${student.first_name} ${student.last_name}`,
                    subjectCode: subject.course_code,
                    formattedDate:
                      data.timestamp?.toDate?.()?.toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }) || new Date(data.date).toLocaleDateString(),
                  });
                }
              });
            } catch (err) {
              console.error(
                `Error fetching attendance for subject ${subject.id}:`,
                err
              );
            }
          })
        );

        // Sort by timestamp and take top 10
        const sortedRecords = allRecords
          .sort((a, b) => {
            const timeA = a.timestamp?.toMillis?.() || 0;
            const timeB = b.timestamp?.toMillis?.() || 0;
            return timeB - timeA;
          })
          .slice(0, 10);

        setRecentAttendance(sortedRecords);
      } catch (err) {
        console.error("Error fetching recent attendance:", err);
        setError("Failed to load recent attendance");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentAttendance();
  }, [subjects, enrollmentsBySubject]);

  return {
    subjectsWithDetails,
    todaysClasses,
    recentAttendance,
    dashboardStats,
    isLoading,
    error,
  };
}
