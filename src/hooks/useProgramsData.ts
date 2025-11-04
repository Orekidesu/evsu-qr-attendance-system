"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
} from "@/lib/firebase/firestore";
import { getSubjectsByProgram } from "@/lib/firebase/firestore";
import { getStudentsByProgram } from "@/lib/firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "@/lib/queryKeys";
import type { Program } from "@/lib/types/program";

export interface ProgramWithCounts extends Program {
  subjectsCount: number;
  studentsCount: number;
}

// Fetch function to get all programs with counts
async function fetchProgramsWithCounts(): Promise<ProgramWithCounts[]> {
  const programsData = await getAllPrograms();

  // Fetch counts for each program in parallel
  const programsWithCounts = await Promise.all(
    programsData.map(async (program) => {
      try {
        const [subjects, students] = await Promise.all([
          getSubjectsByProgram(program.id),
          getStudentsByProgram(program.id),
        ]);

        return {
          ...program,
          subjectsCount: subjects.length,
          studentsCount: students.length,
        };
      } catch (err) {
        console.error(`Error fetching counts for program ${program.id}:`, err);
        // Return program with zero counts if fetching fails
        return {
          ...program,
          subjectsCount: 0,
          studentsCount: 0,
        };
      }
    })
  );

  return programsWithCounts;
}

export function useProgramsData() {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  // Query for fetching programs
  const {
    data: programs = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.programs,
    queryFn: fetchProgramsWithCounts,
    enabled: !authLoading && !!user, // Only fetch when auth is ready and user exists
  });

  // Mutation for adding a program
  const addProgramMutation = useMutation({
    mutationFn: (data: {
      name: string;
      abbreviation: string;
      academic_year: string;
    }) => createProgram(data),
    onSuccess: () => {
      // Invalidate and refetch programs
      queryClient.invalidateQueries({ queryKey: queryKeys.programs });
    },
  });

  // Mutation for editing a program
  const editProgramMutation = useMutation({
    mutationFn: ({
      programId,
      data,
    }: {
      programId: string;
      data: {
        name: string;
        abbreviation: string;
        academic_year: string;
      };
    }) => updateProgram(programId, data),
    onSuccess: () => {
      // Invalidate and refetch programs
      queryClient.invalidateQueries({ queryKey: queryKeys.programs });
    },
  });

  // Mutation for deleting a program
  const deleteProgramMutation = useMutation({
    mutationFn: (programId: string) => deleteProgram(programId),
    onSuccess: () => {
      // Invalidate and refetch programs
      queryClient.invalidateQueries({ queryKey: queryKeys.programs });
    },
  });

  const addProgram = async (data: {
    name: string;
    abbreviation: string;
    academic_year: string;
  }) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      await addProgramMutation.mutateAsync(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to add program";
      throw new Error(errorMessage);
    }
  };

  const editProgram = async (
    programId: string,
    data: {
      name: string;
      abbreviation: string;
      academic_year: string;
    }
  ) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      await editProgramMutation.mutateAsync({ programId, data });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update program";
      throw new Error(errorMessage);
    }
  };

  const removeProgram = async (programId: string) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      await deleteProgramMutation.mutateAsync(programId);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete program";
      throw new Error(errorMessage);
    }
  };

  return {
    programs,
    isLoading: isLoading || authLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : "Failed to fetch programs"
      : null,
    addProgram,
    editProgram,
    removeProgram,
    refreshPrograms: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.programs }),
  };
}
