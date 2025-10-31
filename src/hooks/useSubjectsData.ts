"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getAllSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} from "@/lib/firebase/firestore";
import { getAllPrograms } from "@/lib/firebase/firestore";
import { getUsersByRole } from "@/lib/firebase/firestore";
import { getEnrollmentsBySubject } from "@/lib/firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import type { Subject, CreateSubjectInput } from "@/lib/types/subject";
import type { Program } from "@/lib/types/program";
import type { User } from "@/lib/types/user";

export interface SubjectWithDetails extends Subject {
  programName: string;
  teacherName: string;
  enrolledCount: number;
}

export function useSubjectsData() {
  const { user, loading: authLoading } = useAuth();
  const [subjects, setSubjects] = useState<SubjectWithDetails[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    // Don't fetch if user is not authenticated
    if (!user) {
      setError("User not authenticated");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Fetch subjects, programs, and teachers in parallel
      const [subjectsData, programsData, teachersData] = await Promise.all([
        getAllSubjects(),
        getAllPrograms(),
        getUsersByRole("teacher"),
      ]);

      setPrograms(programsData);
      setTeachers(teachersData);

      // Enrich subjects with program name, teacher name, and enrollment count
      const enrichedSubjects = await Promise.all(
        subjectsData.map(async (subject) => {
          try {
            const program = programsData.find(
              (p) => p.id === subject.program_id
            );
            const teacher = teachersData.find(
              (t) => t.id === subject.teacher_id
            );

            // Fetch enrollment count
            const enrollments = await getEnrollmentsBySubject(subject.id);

            return {
              ...subject,
              schedules: subject.schedules || [],
              programName: program ? program.abbreviation : "Unknown Program",
              teacherName: teacher
                ? `${teacher.first_name} ${teacher.last_name}`
                : "Unknown Teacher",
              enrolledCount: enrollments.length,
            };
          } catch (err) {
            console.error(`Error enriching subject ${subject.id}:`, err);
            // Return subject with default values if enrichment fails
            return {
              ...subject,
              schedules: subject.schedules || [],
              programName: "Unknown Program",
              teacherName: "Unknown Teacher",
              enrolledCount: 0,
            };
          }
        })
      );

      setSubjects(enrichedSubjects);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch subjects data";
      setError(errorMessage);
      console.error("Error fetching subjects:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Wait for auth to finish loading before fetching
    if (!authLoading) {
      fetchData();
    }
  }, [authLoading, fetchData]);

  const addSubject = useCallback(
    async (subjectData: CreateSubjectInput) => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      try {
        await createSubject(subjectData);
        await fetchData(); // Refresh the list
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create subject";
        throw new Error(errorMessage);
      }
    },
    [user, fetchData]
  );

  const editSubject = useCallback(
    async (id: string, subjectData: Partial<Subject>) => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      try {
        await updateSubject(id, subjectData);
        await fetchData(); // Refresh the list
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update subject";
        throw new Error(errorMessage);
      }
    },
    [user, fetchData]
  );

  const removeSubject = useCallback(
    async (id: string) => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      try {
        await deleteSubject(id);
        await fetchData(); // Refresh the list
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete subject";
        throw new Error(errorMessage);
      }
    },
    [user, fetchData]
  );

  return {
    subjects,
    programs,
    teachers,
    isLoading,
    error,
    addSubject,
    editSubject,
    removeSubject,
    refreshData: fetchData,
  };
}
