"use client";

import { useState, useEffect, useMemo } from "react";
import { useAttendanceData, type EnrolledStudent } from "./useAttendanceData";
import { getAttendanceByStudent } from "@/lib/firebase/firestore/attendance";
import type { Attendance } from "@/lib/types/attendance";

export interface StudentWithAttendance {
  studentId: string;
  student_id: string;
  name: string;
  email: string;
  program_id: string;
  totalRecords: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  presentPercentage: number;
  latePercentage: number;
  absentPercentage: number;
}

export interface StudentAttendanceHistory extends Attendance {
  formattedDate: string;
  formattedTime: string;
}

export function useTeacherStudentsData(subjectId: string) {
  const { enrollmentsBySubject, subjects } = useAttendanceData();
  const [studentsData, setStudentsData] = useState<StudentWithAttendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const enrolledStudents = useMemo(
    () => enrollmentsBySubject.get(subjectId) || [],
    [subjectId, enrollmentsBySubject]
  );

  const selectedSubject = useMemo(
    () => subjects.find((s) => s.id === subjectId),
    [subjects, subjectId]
  );

  // Fetch attendance statistics for all enrolled students
  useEffect(() => {
    const loadStudentsData = async () => {
      if (!subjectId || enrolledStudents.length === 0) {
        setStudentsData([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const studentsWithAttendance = await Promise.all(
          enrolledStudents.map(async (student: EnrolledStudent) => {
            try {
              // Fetch all attendance records for this student in this subject
              const attendanceRecords = await getAttendanceByStudent(
                subjectId,
                student.id
              );

              const totalRecords = attendanceRecords.length;
              const presentCount = attendanceRecords.filter(
                (r) => r.status === "Present"
              ).length;
              const lateCount = attendanceRecords.filter(
                (r) => r.status === "Late"
              ).length;
              const absentCount = attendanceRecords.filter(
                (r) => r.status === "Absent"
              ).length;

              const presentPercentage =
                totalRecords > 0
                  ? Math.round((presentCount / totalRecords) * 100)
                  : 0;
              const latePercentage =
                totalRecords > 0
                  ? Math.round((lateCount / totalRecords) * 100)
                  : 0;
              const absentPercentage =
                totalRecords > 0
                  ? Math.round((absentCount / totalRecords) * 100)
                  : 0;

              return {
                studentId: student.id,
                student_id: student.student_id,
                name: `${student.first_name} ${student.last_name}`,
                email: student.email,
                program_id: student.program_id,
                totalRecords,
                presentCount,
                lateCount,
                absentCount,
                presentPercentage,
                latePercentage,
                absentPercentage,
              };
            } catch (err) {
              console.error(
                `Error fetching attendance for student ${student.id}:`,
                err
              );
              // Return student with zero stats if fetch fails
              return {
                studentId: student.id,
                student_id: student.student_id,
                name: `${student.first_name} ${student.last_name}`,
                email: student.email,
                program_id: student.program_id,
                totalRecords: 0,
                presentCount: 0,
                lateCount: 0,
                absentCount: 0,
                presentPercentage: 0,
                latePercentage: 0,
                absentPercentage: 0,
              };
            }
          })
        );

        setStudentsData(studentsWithAttendance);
      } catch (err) {
        console.error("Error loading students data:", err);
        setError("Failed to load students data");
      } finally {
        setIsLoading(false);
      }
    };

    loadStudentsData();
  }, [subjectId, enrolledStudents]);

  // Fetch detailed attendance history for a specific student
  const fetchStudentAttendanceHistory = async (
    studentId: string
  ): Promise<StudentAttendanceHistory[]> => {
    try {
      const records = await getAttendanceByStudent(subjectId, studentId);

      return records
        .map((record) => ({
          ...record,
          formattedDate: new Date(record.date).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          formattedTime:
            record.timestamp?.toDate?.()?.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }) || "N/A",
        }))
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
    } catch (err) {
      console.error("Error fetching student attendance history:", err);
      throw err;
    }
  };

  return {
    studentsData,
    isLoading,
    error,
    selectedSubject,
    fetchStudentAttendanceHistory,
    hasStudents: enrolledStudents.length > 0,
  };
}
