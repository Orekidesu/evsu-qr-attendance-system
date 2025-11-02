"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from "@/lib/firebase/firestore/students";
import { getAllPrograms } from "@/lib/firebase/firestore/programs";
import { getAllSubjects } from "@/lib/firebase/firestore/subjects";
import {
  getEnrollmentsByStudent,
  enrollStudent,
} from "@/lib/firebase/firestore/enrollments";
import { useAuth } from "@/contexts/AuthContext";
import type { Student, CreateStudentInput } from "@/lib/types/student";
import type { Program } from "@/lib/types/program";
import type { Subject } from "@/lib/types/subject";

export interface StudentWithDetails extends Student {
  programName: string;
  enrolledSubjects: Array<{
    id: string;
    courseCode: string;
    title: string;
  }>;
}

export function useStudentsData() {
  const { user, loading: authLoading } = useAuth();
  const [students, setStudents] = useState<StudentWithDetails[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) {
      setError("User not authenticated");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Fetch all data in parallel
      const [studentsData, programsData, subjectsData] = await Promise.all([
        getAllStudents(),
        getAllPrograms(),
        getAllSubjects(),
      ]);

      setPrograms(programsData);
      setSubjects(subjectsData);

      // Enrich students with program name and enrolled subjects
      const enrichedStudents = await Promise.all(
        studentsData.map(async (student) => {
          try {
            const program = programsData.find(
              (p) => p.id === student.program_id
            );

            // Fetch enrollments for this student
            const enrollments = await getEnrollmentsByStudent(student.id);
            const enrolledSubjects = enrollments
              .map((enrollment) => {
                const subject = subjectsData.find(
                  (s) => s.id === enrollment.subject_id
                );
                return subject
                  ? {
                      id: subject.id,
                      courseCode: subject.course_code,
                      title: subject.descriptive_title,
                    }
                  : null;
              })
              .filter(Boolean) as Array<{
              id: string;
              courseCode: string;
              title: string;
            }>;

            return {
              ...student,
              programName: program ? program.abbreviation : "Unknown Program",
              enrolledSubjects,
            };
          } catch (err) {
            console.error(`Error enriching student ${student.id}:`, err);
            return {
              ...student,
              programName: "Unknown Program",
              enrolledSubjects: [],
            };
          }
        })
      );

      setStudents(enrichedStudents);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch students data";
      setError(errorMessage);
      console.error("Error fetching students:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      fetchData();
    }
  }, [authLoading, fetchData]);

  const addStudent = useCallback(
    async (studentData: CreateStudentInput) => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      try {
        await createStudent(studentData);
        await fetchData(); // Refresh the list
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create student";
        throw new Error(errorMessage);
      }
    },
    [user, fetchData]
  );

  const editStudent = useCallback(
    async (id: string, studentData: Partial<CreateStudentInput>) => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      try {
        await updateStudent(id, studentData);
        await fetchData(); // Refresh the list
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update student";
        throw new Error(errorMessage);
      }
    },
    [user, fetchData]
  );

  const removeStudent = useCallback(
    async (id: string) => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      try {
        await deleteStudent(id);
        await fetchData(); // Refresh the list
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete student";
        throw new Error(errorMessage);
      }
    },
    [user, fetchData]
  );

  const enrollStudentInSubject = useCallback(
    async (studentId: string, subjectId: string, programId: string) => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      try {
        await enrollStudent({
          student_id: studentId,
          subject_id: subjectId,
          program_id: programId,
        });
        await fetchData(); // Refresh to update enrolled subjects
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to enroll student";
        throw new Error(errorMessage);
      }
    },
    [user, fetchData]
  );

  return {
    students,
    programs,
    subjects,
    isLoading,
    error,
    addStudent,
    editStudent,
    removeStudent,
    enrollStudentInSubject,
    refreshData: fetchData,
  };
}
