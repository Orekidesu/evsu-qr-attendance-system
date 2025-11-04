"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { queryKeys } from "@/lib/queryKeys";
import type { Subject, CreateSubjectInput } from "@/lib/types/subject";
import type { Program } from "@/lib/types/program";
import type { User } from "@/lib/types/user";

export interface SubjectWithDetails extends Subject {
  programName: string;
  teacherName: string;
  enrolledCount: number;
}

// Fetch function to get all subjects with enriched details
async function fetchSubjectsWithDetails(): Promise<{
  subjects: SubjectWithDetails[];
  programs: Program[];
  teachers: User[];
}> {
  // Fetch subjects, programs, and teachers in parallel
  const [subjectsData, programsData, teachersData] = await Promise.all([
    getAllSubjects(),
    getAllPrograms(),
    getUsersByRole("teacher"),
  ]);

  // Enrich subjects with program name, teacher name, and enrollment count
  const enrichedSubjects = await Promise.all(
    subjectsData.map(async (subject) => {
      try {
        const program = programsData.find((p) => p.id === subject.program_id);
        const teacher = teachersData.find((t) => t.id === subject.teacher_id);

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

  return {
    subjects: enrichedSubjects,
    programs: programsData,
    teachers: teachersData,
  };
}

export function useSubjectsData() {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  // Query for fetching subjects with details
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.subjects,
    queryFn: fetchSubjectsWithDetails,
    enabled: !authLoading && !!user, // Only fetch when auth is ready and user exists
  });

  const subjects = data?.subjects || [];
  const programs = data?.programs || [];
  const teachers = data?.teachers || [];

  // Mutation for adding a subject
  const addSubjectMutation = useMutation({
    mutationFn: (subjectData: CreateSubjectInput) => createSubject(subjectData),
    onSuccess: () => {
      // Invalidate subjects and related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.subjects });
      // Also invalidate programs query as subject counts might change
      queryClient.invalidateQueries({ queryKey: queryKeys.programs });
    },
  });

  // Mutation for editing a subject
  const editSubjectMutation = useMutation({
    mutationFn: ({
      id,
      subjectData,
    }: {
      id: string;
      subjectData: Partial<Subject>;
    }) => updateSubject(id, subjectData),
    onSuccess: () => {
      // Invalidate subjects and related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.subjects });
      queryClient.invalidateQueries({ queryKey: queryKeys.programs });
    },
  });

  // Mutation for deleting a subject
  const deleteSubjectMutation = useMutation({
    mutationFn: (id: string) => deleteSubject(id),
    onSuccess: () => {
      // Invalidate subjects and related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.subjects });
      queryClient.invalidateQueries({ queryKey: queryKeys.programs });
      queryClient.invalidateQueries({ queryKey: queryKeys.enrollments });
    },
  });

  const addSubject = async (subjectData: CreateSubjectInput) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      await addSubjectMutation.mutateAsync(subjectData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create subject";
      throw new Error(errorMessage);
    }
  };

  const editSubject = async (id: string, subjectData: Partial<Subject>) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      await editSubjectMutation.mutateAsync({ id, subjectData });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update subject";
      throw new Error(errorMessage);
    }
  };

  const removeSubject = async (id: string) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      await deleteSubjectMutation.mutateAsync(id);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete subject";
      throw new Error(errorMessage);
    }
  };

  return {
    subjects,
    programs,
    teachers,
    isLoading: isLoading || authLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : "Failed to fetch subjects data"
      : null,
    addSubject,
    editSubject,
    removeSubject,
    refreshData: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.subjects }),
  };
}
