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
import {
  validateEnrollment,
  validateBulkEnrollment,
  getValidationSummary,
} from "@/lib/utils/enrollmentValidation";

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

  const enrollStudent = async (
    data: CreateEnrollmentInput,
    options?: { skipValidation?: boolean; maxUnitsPerStudent?: number }
  ) => {
    try {
      const student = students.find((s) => s.id === data.student_id);
      const subject = subjects.find((s) => s.id === data.subject_id);

      if (!student || !subject) {
        throw new Error("Student or subject not found");
      }

      // Perform comprehensive validation unless explicitly skipped
      if (!options?.skipValidation) {
        const validation = validateEnrollment(
          student,
          subject,
          enrollments,
          subjects,
          { maxUnitsPerStudent: options?.maxUnitsPerStudent }
        );

        if (!validation.isValid) {
          const primaryError = validation.errors[0];
          throw new Error(primaryError.details || primaryError.message);
        }
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
    enrollmentInputs: CreateEnrollmentInput[],
    options?: {
      validateBeforeEnroll?: boolean;
      maxUnitsPerStudent?: number;
      showDetailedErrors?: boolean;
    }
  ) => {
    try {
      if (enrollmentInputs.length === 0) {
        toast.error("No Students Selected", {
          description: "Please select at least one student to enroll.",
        });
        return {
          successCount: 0,
          errorCount: 0,
          errors: [],
          skippedCount: 0,
          validationErrors: [],
        };
      }

      const { validateBeforeEnroll = true, showDetailedErrors = true } =
        options || {};

      // Get the subject being enrolled in (assumes all inputs are for same subject)
      const subjectId = enrollmentInputs[0]?.subject_id;
      const subject = subjects.find((s) => s.id === subjectId);

      if (!subject) {
        throw new Error("Subject not found");
      }

      let successCount = 0;
      let skippedCount = 0;
      let errorCount = 0;
      const errors: string[] = [];
      const validationErrors: Array<{
        studentId: string;
        studentName: string;
        errors: string[];
      }> = [];

      // Pre-validate if enabled
      if (validateBeforeEnroll) {
        const studentsToValidate = enrollmentInputs
          .map((input) => students.find((s) => s.id === input.student_id))
          .filter((s): s is Student => s !== undefined);

        const validationResults = validateBulkEnrollment(
          studentsToValidate,
          subject,
          enrollments,
          subjects,
          { maxUnitsPerStudent: options?.maxUnitsPerStudent }
        );

        const summary = getValidationSummary(validationResults);

        // Collect validation errors for detailed reporting
        validationResults.forEach((result, studentId) => {
          if (!result.isValid) {
            const student = students.find((s) => s.id === studentId);
            if (student) {
              validationErrors.push({
                studentId,
                studentName: `${student.first_name} ${student.last_name}`,
                errors: result.errors.map((e) => e.details || e.message),
              });
            }
          }
        });

        // If there are validation errors and detailed errors are enabled, show them
        if (summary.invalidCount > 0 && showDetailedErrors) {
          const errorTypes = Object.entries(summary.errorsByType)
            .map(([type, count]) => `${type}: ${count}`)
            .join(", ");

          toast.warning("Validation Issues Detected", {
            description: `${summary.invalidCount} of ${summary.totalStudents} student(s) cannot be enrolled. Issues: ${errorTypes}`,
          });
        }
      }

      // Proceed with enrollment
      for (const enrollmentInput of enrollmentInputs) {
        try {
          const student = students.find(
            (s) => s.id === enrollmentInput.student_id
          );
          if (!student) {
            errorCount++;
            errors.push("Student not found");
            continue;
          }

          // Validate individual enrollment
          if (validateBeforeEnroll) {
            const validation = validateEnrollment(
              student,
              subject,
              enrollments,
              subjects,
              { maxUnitsPerStudent: options?.maxUnitsPerStudent }
            );

            if (!validation.isValid) {
              skippedCount++;
              continue; // Skip invalid enrollments
            }
          } else {
            // At minimum, check for duplicates
            const alreadyEnrolled = enrollments.some(
              (e) =>
                e.student_id === enrollmentInput.student_id &&
                e.subject_id === enrollmentInput.subject_id
            );

            if (alreadyEnrolled) {
              skippedCount++;
              continue;
            }
          }

          await createEnrollment(enrollmentInput);
          successCount++;
        } catch (err) {
          errorCount++;
          const errorMsg = err instanceof Error ? err.message : "Unknown error";
          errors.push(errorMsg);
          console.error(
            "Bulk enrollment error for student:",
            enrollmentInput.student_id,
            errorMsg
          );
        }
      }

      await fetchData(); // Refresh data

      // Provide detailed feedback
      if (successCount === 0 && errorCount === 0 && skippedCount > 0) {
        toast.info("No New Enrollments", {
          description: `All ${skippedCount} selected student(s) could not be enrolled due to validation rules.`,
        });
      } else if (errorCount > 0) {
        toast.warning("Bulk Enrollment Completed with Issues", {
          description: `Enrolled: ${successCount}, Skipped: ${skippedCount}, Failed: ${errorCount}`,
        });
      } else if (skippedCount > 0) {
        toast.success("Bulk Enrollment Completed", {
          description: `Enrolled: ${successCount} student(s). ${skippedCount} skipped due to validation rules.`,
        });
      } else {
        toast.success("Bulk Enrollment Successful", {
          description: `Successfully enrolled ${successCount} student(s).`,
        });
      }

      return {
        successCount,
        errorCount,
        errors,
        skippedCount,
        validationErrors,
      };
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
