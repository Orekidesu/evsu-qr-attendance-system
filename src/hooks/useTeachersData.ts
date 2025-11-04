"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUsersByRole,
  updateUser,
  deleteUser,
} from "@/lib/firebase/firestore";
import { getAllSubjects } from "@/lib/firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase/config";
import { queryKeys } from "@/lib/queryKeys";
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

// Standalone function to fetch teachers with details
async function fetchTeachersWithDetails(): Promise<{
  teachers: TeacherWithDetails[];
  subjects: Subject[];
}> {
  // Fetch teachers and subjects in parallel
  const [teachersData, subjectsData] = await Promise.all([
    getUsersByRole("teacher"),
    getAllSubjects(),
  ]);

  // Enrich teachers with assigned subjects details and student count
  const enrichedTeachers: TeacherWithDetails[] = teachersData.map((teacher) => {
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
  });

  return {
    teachers: enrichedTeachers,
    subjects: subjectsData,
  };
}

export function useTeachersData() {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  // Query for fetching teachers with details
  const {
    data,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: queryKeys.teachers,
    queryFn: fetchTeachersWithDetails,
    enabled: !authLoading && !!user,
  });

  // Destructure data with fallback
  const { teachers, subjects } = data || { teachers: [], subjects: [] };

  // Format error message
  const error = queryError
    ? queryError instanceof Error
      ? queryError.message
      : "Failed to fetch teachers data"
    : null;

  // Mutation for adding a teacher
  const addTeacherMutation = useMutation({
    mutationFn: async (data: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
    }) => {
      if (!user) throw new Error("User not authenticated");

      // Get the current user's ID token
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("No authenticated user found");
      }

      const idToken = await currentUser.getIdToken();

      // Call the API route to create the teacher (server-side)
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          first_name: data.firstName,
          last_name: data.lastName,
          role: "teacher",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create teacher");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate teachers query to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.teachers });
    },
  });

  // Mutation for editing a teacher
  const editTeacherMutation = useMutation({
    mutationFn: async ({
      teacherId,
      data,
    }: {
      teacherId: string;
      data: {
        first_name: string;
        last_name: string;
        assigned_subjects?: string[];
      };
    }) => {
      if (!user) throw new Error("User not authenticated");
      await updateUser(teacherId, data);
    },
    onSuccess: () => {
      // Invalidate teachers query to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.teachers });
    },
  });

  // Mutation for deleting a teacher
  const deleteTeacherMutation = useMutation({
    mutationFn: async (teacherId: string) => {
      if (!user) throw new Error("User not authenticated");

      // Check if teacher has assigned subjects (using current subjects from cache)
      const teacherSubjects = subjects.filter(
        (subject) => subject.teacher_id === teacherId
      );

      if (teacherSubjects.length > 0) {
        throw new Error(
          `Cannot delete teacher. They are assigned to ${teacherSubjects.length} subject(s). Please reassign these subjects first.`
        );
      }

      await deleteUser(teacherId);
    },
    onSuccess: () => {
      // Invalidate teachers and subjects queries to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.teachers });
      queryClient.invalidateQueries({ queryKey: queryKeys.subjects });
    },
  });

  // Wrapper functions to maintain API compatibility
  const addTeacher = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => {
    return addTeacherMutation.mutateAsync(data);
  };

  const editTeacher = async (
    teacherId: string,
    data: {
      first_name: string;
      last_name: string;
      assigned_subjects?: string[];
    }
  ) => {
    return editTeacherMutation.mutateAsync({ teacherId, data });
  };

  const removeTeacher = async (teacherId: string) => {
    return deleteTeacherMutation.mutateAsync(teacherId);
  };

  const refetch = () => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.teachers });
  };

  return {
    teachers,
    subjects,
    isLoading,
    error,
    addTeacher,
    editTeacher,
    removeTeacher,
    refetch,
  };
}
