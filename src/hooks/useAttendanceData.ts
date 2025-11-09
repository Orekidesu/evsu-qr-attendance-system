"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "@/lib/queryKeys";
import { getAllSubjects } from "@/lib/firebase/firestore/subjects";
import { getEnrollmentsBySubject } from "@/lib/firebase/firestore/enrollments";
import { getAllStudents } from "@/lib/firebase/firestore/students";
import {
  markAttendance,
  getAttendanceBySubject,
  updateAttendance,
  deleteAttendance,
} from "@/lib/firebase/firestore/attendance";
import type { Subject } from "@/lib/types/subject";
import type { Attendance, CreateAttendanceInput } from "@/lib/types/attendance";

export interface EnrolledStudent {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  program_id: string;
}

// Fetch teacher's subjects with enrollments
async function fetchTeacherSubjects(teacherId: string): Promise<{
  subjects: Subject[];
  enrollmentsBySubject: Map<string, EnrolledStudent[]>;
}> {
  const allSubjects = await getAllSubjects();
  const teacherSubjects = allSubjects.filter(
    (subject) => subject.teacher_id === teacherId
  );

  const allStudents = await getAllStudents();
  const studentsMap = new Map(allStudents.map((s) => [s.id, s]));

  const enrollmentsBySubject = new Map<string, EnrolledStudent[]>();

  await Promise.all(
    teacherSubjects.map(async (subject) => {
      const enrollments = await getEnrollmentsBySubject(subject.id);
      const enrolledStudents: EnrolledStudent[] = enrollments
        .map((enrollment) => {
          const student = studentsMap.get(enrollment.student_id);
          if (!student) return null;

          return {
            id: student.id,
            student_id: student.student_id,
            first_name: student.first_name,
            last_name: student.last_name,
            email: student.email || "",
            program_id: student.program_id,
          };
        })
        .filter((s): s is EnrolledStudent => s !== null);

      enrollmentsBySubject.set(subject.id, enrolledStudents);
    })
  );

  return {
    subjects: teacherSubjects,
    enrollmentsBySubject,
  };
}

// Fetch attendance for a specific session
async function fetchAttendanceForSession(
  subjectId: string,
  date: string
): Promise<Attendance[]> {
  return await getAttendanceBySubject(subjectId, date);
}

export function useAttendanceData() {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  // Query for fetching teacher's subjects with enrollments
  const {
    data: subjectsData,
    isLoading: isLoadingSubjects,
    error: subjectsError,
  } = useQuery({
    queryKey: queryKeys.teachers,
    queryFn: () => fetchTeacherSubjects(user!.id),
    enabled: !authLoading && !!user && user.role === "teacher",
  });

  const { subjects, enrollmentsBySubject } = subjectsData || {
    subjects: [],
    enrollmentsBySubject: new Map(),
  };

  // Mutation for marking attendance
  const markAttendanceMutation = useMutation({
    mutationFn: async ({
      subjectId,
      data,
    }: {
      subjectId: string;
      data: CreateAttendanceInput;
    }) => {
      if (!user) throw new Error("User not authenticated");
      return await markAttendance(subjectId, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["attendance", variables.subjectId, variables.data.date],
      });
    },
  });

  // Mutation for updating attendance
  const updateAttendanceMutation = useMutation({
    mutationFn: async ({
      subjectId,
      attendanceId,
      data,
    }: {
      subjectId: string;
      attendanceId: string;
      data: Partial<CreateAttendanceInput>;
    }) => {
      return await updateAttendance(subjectId, attendanceId, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["attendance", variables.subjectId],
      });
    },
  });

  // Mutation for deleting attendance
  const deleteAttendanceMutation = useMutation({
    mutationFn: async ({
      subjectId,
      attendanceId,
    }: {
      subjectId: string;
      attendanceId: string;
    }) => {
      return await deleteAttendance(subjectId, attendanceId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["attendance", variables.subjectId],
      });
    },
  });

  // Function to fetch attendance for a specific session
  const fetchAttendance = useCallback(
    async (subjectId: string, date: string) => {
      return await queryClient.fetchQuery({
        queryKey: ["attendance", subjectId, date],
        queryFn: () => fetchAttendanceForSession(subjectId, date),
      });
    },
    [queryClient]
  );

  // Wrapper functions
  const recordAttendance = async (
    subjectId: string,
    data: CreateAttendanceInput
  ) => {
    return markAttendanceMutation.mutateAsync({ subjectId, data });
  };

  const modifyAttendance = async (
    subjectId: string,
    attendanceId: string,
    data: Partial<CreateAttendanceInput>
  ) => {
    return updateAttendanceMutation.mutateAsync({
      subjectId,
      attendanceId,
      data,
    });
  };

  const removeAttendance = async (subjectId: string, attendanceId: string) => {
    return deleteAttendanceMutation.mutateAsync({ subjectId, attendanceId });
  };

  const error = subjectsError
    ? subjectsError instanceof Error
      ? subjectsError.message
      : "Failed to fetch subjects data"
    : null;

  return {
    subjects,
    enrollmentsBySubject,
    isLoading: isLoadingSubjects,
    error,
    recordAttendance,
    modifyAttendance,
    removeAttendance,
    fetchAttendance,
  };
}
