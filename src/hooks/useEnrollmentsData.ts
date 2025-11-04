"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getAllEnrollments,
  enrollStudent as createEnrollment,
  deleteEnrollment,
} from "@/lib/firebase/firestore/enrollments";
import { getAllStudents } from "@/lib/firebase/firestore/students";
import { getAllSubjects } from "@/lib/firebase/firestore/subjects";
import { getAllPrograms } from "@/lib/firebase/firestore/programs";
import { useAuth } from "@/contexts/AuthContext";
import type { Enrollment, CreateEnrollmentInput } from "@/lib/types/enrollment";
import type { Student } from "@/lib/types/student";
import type { Subject } from "@/lib/types/subject";
import type { Program } from "@/lib/types/program";
import { toast } from "sonner";

export interface EnrollmentWithDetails extends Enrollment {
  studentName: string;
  studentNumber: string;
  subjectCode: string;
  subjectTitle: string;
  programName: string;
}

export function useEnrollmentsData() {
  const { user, loading: authLoading } = useAuth();
  const [enrollments, setEnrollments] = useState<EnrollmentWithDetails[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
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
      const [enrollmentsData, studentsData, subjectsData, programsData] =
        await Promise.all([
          getAllEnrollments(),
          getAllStudents(),
          getAllSubjects(),
          getAllPrograms(),
        ]);

      setStudents(studentsData);
      setSubjects(subjectsData);
      setPrograms(programsData);

      // Enrich enrollments with related data
      const enrichedEnrollments: EnrollmentWithDetails[] = enrollmentsData
        .map((enrollment) => {
          const student = studentsData.find(
            (s) => s.id === enrollment.student_id
          );
          const subject = subjectsData.find(
            (s) => s.id === enrollment.subject_id
          );
          const program = programsData.find(
            (p) => p.id === enrollment.program_id
          );

          // Skip enrollments with missing references
          if (!student || !subject || !program) {
            console.warn(
              `Enrollment ${enrollment.id} has missing references:`,
              {
                student: !!student,
                subject: !!subject,
                program: !!program,
              }
            );
            return null;
          }

          return {
            ...enrollment,
            studentName: `${student.first_name} ${student.last_name}`,
            studentNumber: student.student_id,
            subjectCode: subject.course_code,
            subjectTitle: subject.descriptive_title,
            programName: program.abbreviation,
          };
        })
        .filter((e): e is EnrollmentWithDetails => e !== null);

      setEnrollments(enrichedEnrollments);
    } catch (err) {
      console.error("Error fetching enrollments data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch enrollments data"
      );
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      fetchData();
    }
  }, [authLoading, fetchData]);

  const enrollStudent = async (data: CreateEnrollmentInput) => {
    try {
      // Check if already enrolled
      const alreadyEnrolled = enrollments.some(
        (e) =>
          e.student_id === data.student_id && e.subject_id === data.subject_id
      );

      if (alreadyEnrolled) {
        throw new Error("Student is already enrolled in this subject");
      }

      await createEnrollment(data);
      await fetchData(); // Refresh data
      toast.success("Student enrolled successfully");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to enroll student";
      toast.error("Enrollment Failed", { description: errorMessage });
      throw err;
    }
  };

  const enrollMultipleStudents = async (
    enrollments: CreateEnrollmentInput[]
  ) => {
    try {
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (const enrollment of enrollments) {
        try {
          // Check if already enrolled
          const alreadyEnrolled = enrollments.some(
            (e) =>
              e.student_id === enrollment.student_id &&
              e.subject_id === enrollment.subject_id
          );

          if (!alreadyEnrolled) {
            await createEnrollment(enrollment);
            successCount++;
          }
        } catch (err) {
          errorCount++;
          errors.push(err instanceof Error ? err.message : "Unknown error");
        }
      }

      await fetchData(); // Refresh data

      if (errorCount > 0) {
        toast.warning("Bulk Enrollment Completed with Errors", {
          description: `Enrolled: ${successCount}, Failed: ${errorCount}`,
        });
      } else {
        toast.success("Bulk Enrollment Successful", {
          description: `Successfully enrolled ${successCount} student(s)`,
        });
      }

      return { successCount, errorCount, errors };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to enroll students";
      toast.error("Bulk Enrollment Failed", { description: errorMessage });
      throw err;
    }
  };

  const removeEnrollment = async (enrollmentId: string) => {
    try {
      await deleteEnrollment(enrollmentId);
      await fetchData(); // Refresh data
      toast.success("Enrollment removed successfully");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to remove enrollment";
      toast.error("Remove Failed", { description: errorMessage });
      throw err;
    }
  };

  return {
    enrollments,
    students,
    subjects,
    programs,
    isLoading,
    error,
    enrollStudent,
    enrollMultipleStudents,
    removeEnrollment,
    refreshData: fetchData,
  };
}
