"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllEnrollments,
  enrollStudent as createEnrollment,
  deleteEnrollment,
} from "@/lib/firebase/firestore/enrollments";
import { getAllStudents } from "@/lib/firebase/firestore/students";
import { getAllSubjects } from "@/lib/firebase/firestore/subjects";
import { getAllPrograms } from "@/lib/firebase/firestore/programs";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "@/lib/queryKeys";
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

// Standalone function to fetch enrollments with details
async function fetchEnrollmentsWithDetails(): Promise<{
  enrollments: EnrollmentWithDetails[];
  students: Student[];
  subjects: Subject[];
  programs: Program[];
}> {
  // Fetch all data in parallel
  const [enrollmentsData, studentsData, subjectsData, programsData] =
    await Promise.all([
      getAllEnrollments(),
      getAllStudents(),
      getAllSubjects(),
      getAllPrograms(),
    ]);

  // Enrich enrollments with related data
  const enrichedEnrollments: EnrollmentWithDetails[] = enrollmentsData
    .map((enrollment) => {
      const student = studentsData.find((s) => s.id === enrollment.student_id);
      const subject = subjectsData.find((s) => s.id === enrollment.subject_id);
      const program = programsData.find((p) => p.id === enrollment.program_id);

      // Skip enrollments with missing references
      if (!student || !subject || !program) {
        console.warn(`Enrollment ${enrollment.id} has missing references:`, {
          student: !!student,
          subject: !!subject,
          program: !!program,
        });
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

  return {
    enrollments: enrichedEnrollments,
    students: studentsData,
    subjects: subjectsData,
    programs: programsData,
  };
}

export function useEnrollmentsData() {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  // Query for fetching enrollments with details
  const {
    data,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: queryKeys.enrollments,
    queryFn: fetchEnrollmentsWithDetails,
    enabled: !authLoading && !!user,
  });

  // Destructure data with fallback
  const { enrollments, students, subjects, programs } = data || {
    enrollments: [],
    students: [],
    subjects: [],
    programs: [],
  };

  // Format error message
  const error = queryError
    ? queryError instanceof Error
      ? queryError.message
      : "Failed to fetch enrollments data"
    : null;

  // Mutation for enrolling a single student
  const enrollStudentMutation = useMutation({
    mutationFn: async ({
      data,
      options,
    }: {
      data: CreateEnrollmentInput;
      options?: { skipValidation?: boolean; maxUnitsPerStudent?: number };
    }) => {
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
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.enrollments });
      queryClient.invalidateQueries({ queryKey: queryKeys.students });
      queryClient.invalidateQueries({ queryKey: queryKeys.subjects });
      toast.success("Student enrolled successfully");
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to enroll student";
      toast.error("Enrollment Failed", { description: errorMessage });
    },
  });

  // Mutation for enrolling multiple students
  const enrollMultipleStudentsMutation = useMutation({
    mutationFn: async ({
      enrollmentInputs,
      options,
    }: {
      enrollmentInputs: CreateEnrollmentInput[];
      options?: {
        validateBeforeEnroll?: boolean;
        maxUnitsPerStudent?: number;
        showDetailedErrors?: boolean;
      };
    }) => {
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

      return {
        successCount,
        errorCount,
        errors,
        skippedCount,
        validationErrors,
      };
    },
    onSuccess: (result) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.enrollments });
      queryClient.invalidateQueries({ queryKey: queryKeys.students });
      queryClient.invalidateQueries({ queryKey: queryKeys.subjects });

      // Provide detailed feedback
      if (
        result.successCount === 0 &&
        result.errorCount === 0 &&
        result.skippedCount > 0
      ) {
        toast.info("No New Enrollments", {
          description: `All ${result.skippedCount} selected student(s) could not be enrolled due to validation rules.`,
        });
      } else if (result.errorCount > 0) {
        toast.warning("Bulk Enrollment Completed with Issues", {
          description: `Enrolled: ${result.successCount}, Skipped: ${result.skippedCount}, Failed: ${result.errorCount}`,
        });
      } else if (result.skippedCount > 0) {
        toast.success("Bulk Enrollment Completed", {
          description: `Enrolled: ${result.successCount} student(s). ${result.skippedCount} skipped due to validation rules.`,
        });
      } else {
        toast.success("Bulk Enrollment Successful", {
          description: `Successfully enrolled ${result.successCount} student(s).`,
        });
      }
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to enroll students";
      toast.error("Bulk Enrollment Failed", { description: errorMessage });
    },
  });

  // Mutation for removing an enrollment
  const removeEnrollmentMutation = useMutation({
    mutationFn: async (enrollmentId: string) => {
      await deleteEnrollment(enrollmentId);
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.enrollments });
      queryClient.invalidateQueries({ queryKey: queryKeys.students });
      queryClient.invalidateQueries({ queryKey: queryKeys.subjects });
      toast.success("Enrollment removed successfully");
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to remove enrollment";
      toast.error("Remove Failed", { description: errorMessage });
    },
  });

  // Wrapper functions to maintain API compatibility
  const enrollStudent = async (
    data: CreateEnrollmentInput,
    options?: { skipValidation?: boolean; maxUnitsPerStudent?: number }
  ) => {
    return enrollStudentMutation.mutateAsync({ data, options });
  };

  const enrollMultipleStudents = async (
    enrollmentInputs: CreateEnrollmentInput[],
    options?: {
      validateBeforeEnroll?: boolean;
      maxUnitsPerStudent?: number;
      showDetailedErrors?: boolean;
    }
  ) => {
    return enrollMultipleStudentsMutation.mutateAsync({
      enrollmentInputs,
      options,
    });
  };

  const removeEnrollment = async (enrollmentId: string) => {
    return removeEnrollmentMutation.mutateAsync(enrollmentId);
  };

  const refreshData = () => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.enrollments });
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
    refreshData,
  };
}
