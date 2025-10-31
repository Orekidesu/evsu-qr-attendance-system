"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getUsersByRole,
  updateUser,
  deleteUser,
} from "@/lib/firebase/firestore";
import { createUser } from "@/lib/firebase/auth";
import { getAllSubjects } from "@/lib/firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import type { User } from "@/lib/types/user";
import type { Subject } from "@/lib/types/subject";

export interface TeacherWithDetails extends User {
  assignedSubjectsDetails: Array<{
    id: string;
    courseCode: string;
    title: string;
  }>;
  totalStudents: number;
}

export function useTeachersData() {
  const { user, loading: authLoading } = useAuth();
  const [teachers, setTeachers] = useState<TeacherWithDetails[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
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
      // Fetch teachers and subjects in parallel
      const [teachersData, subjectsData] = await Promise.all([
        getUsersByRole("teacher"),
        getAllSubjects(),
      ]);

      setSubjects(subjectsData);

      // Enrich teachers with assigned subjects details and student count
      const enrichedTeachers: TeacherWithDetails[] = teachersData.map(
        (teacher) => {
          // Get subjects assigned to this teacher
          const teacherSubjects = subjectsData.filter(
            (subject) => subject.teacher_id === teacher.id
          );

          // Calculate total students (we'll use enrollments later if needed)
          const totalStudents = 0; // Placeholder - can be calculated from enrollments

          return {
            ...teacher,
            assignedSubjectsDetails: teacherSubjects.map((subject) => ({
              id: subject.id,
              courseCode: subject.course_code,
              title: subject.descriptive_title,
            })),
            totalStudents,
          };
        }
      );

      setTeachers(enrichedTeachers);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch teachers data";
      setError(errorMessage);
      console.error("Error fetching teachers:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Only fetch data when auth is done loading
    if (!authLoading) {
      fetchData();
    }
  }, [authLoading, fetchData]);

  const addTeacher = useCallback(
    async (data: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
    }) => {
      if (!user) throw new Error("User not authenticated");

      try {
        await createUser(data.email, data.password, {
          first_name: data.firstName,
          last_name: data.lastName,
          role: "teacher",
          assigned_subjects: [],
        });
        await fetchData();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create teacher";
        throw new Error(errorMessage);
      }
    },
    [user, fetchData]
  );

  const editTeacher = useCallback(
    async (
      teacherId: string,
      data: {
        first_name: string;
        last_name: string;
        assigned_subjects?: string[];
      }
    ) => {
      if (!user) throw new Error("User not authenticated");

      try {
        await updateUser(teacherId, data);
        await fetchData();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update teacher";
        throw new Error(errorMessage);
      }
    },
    [user, fetchData]
  );

  const removeTeacher = useCallback(
    async (teacherId: string) => {
      if (!user) throw new Error("User not authenticated");

      try {
        // Check if teacher has assigned subjects
        const teacherSubjects = subjects.filter(
          (subject) => subject.teacher_id === teacherId
        );

        if (teacherSubjects.length > 0) {
          throw new Error(
            `Cannot delete teacher. They are assigned to ${teacherSubjects.length} subject(s). Please reassign these subjects first.`
          );
        }

        await deleteUser(teacherId);
        await fetchData();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete teacher";
        throw new Error(errorMessage);
      }
    },
    [user, subjects, fetchData]
  );

  return {
    teachers,
    subjects,
    isLoading,
    error,
    addTeacher,
    editTeacher,
    removeTeacher,
    refetch: fetchData,
  };
}
