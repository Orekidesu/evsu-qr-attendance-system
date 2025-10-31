"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getAllPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
} from "@/lib/firebase/firestore";
import { getSubjectsByProgram } from "@/lib/firebase/firestore";
import { getStudentsByProgram } from "@/lib/firebase/firestore";
import type { Program } from "@/lib/types/program";

export interface ProgramWithCounts extends Program {
  subjectsCount: number;
  studentsCount: number;
}

export function useProgramsData() {
  const [programs, setPrograms] = useState<ProgramWithCounts[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrograms = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
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
            console.error(
              `Error fetching counts for program ${program.id}:`,
              err
            );
            // Return program with zero counts if fetching fails
            return {
              ...program,
              subjectsCount: 0,
              studentsCount: 0,
            };
          }
        })
      );

      setPrograms(programsWithCounts);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch programs";
      setError(errorMessage);
      console.error("Error fetching programs:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  const addProgram = async (data: {
    name: string;
    abbreviation: string;
    academic_year: string;
  }) => {
    try {
      await createProgram(data);
      await fetchPrograms(); // Refresh the list
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
    try {
      await updateProgram(programId, data);
      await fetchPrograms(); // Refresh the list
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update program";
      throw new Error(errorMessage);
    }
  };

  const removeProgram = async (programId: string) => {
    try {
      await deleteProgram(programId);
      await fetchPrograms(); // Refresh the list
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete program";
      throw new Error(errorMessage);
    }
  };

  return {
    programs,
    isLoading,
    error,
    addProgram,
    editProgram,
    removeProgram,
    refreshPrograms: fetchPrograms,
  };
}
