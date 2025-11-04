"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  checkStudentExists,
} from "@/lib/firebase/firestore/students";
import { getAllPrograms } from "@/lib/firebase/firestore/programs";
import { getAllSubjects } from "@/lib/firebase/firestore/subjects";
import {
  getEnrollmentsByStudent,
  enrollStudent,
} from "@/lib/firebase/firestore/enrollments";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "@/lib/queryKeys";
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

// Standalone function to fetch students with details
async function fetchStudentsWithDetails(): Promise<{
  students: StudentWithDetails[];
  programs: Program[];
  subjects: Subject[];
}> {
  // Fetch all data in parallel
  const [studentsData, programsData, subjectsData] = await Promise.all([
    getAllStudents(),
    getAllPrograms(),
    getAllSubjects(),
  ]);

  // Enrich students with program name and enrolled subjects
  const enrichedStudents = await Promise.all(
    studentsData.map(async (student) => {
      try {
        const program = programsData.find((p) => p.id === student.program_id);

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

  return {
    students: enrichedStudents,
    programs: programsData,
    subjects: subjectsData,
  };
}

export function useStudentsData() {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  // Query for fetching students with details
  const {
    data,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: queryKeys.students,
    queryFn: fetchStudentsWithDetails,
    enabled: !authLoading && !!user,
  });

  // Destructure data with fallback
  const { students, programs, subjects } = data || {
    students: [],
    programs: [],
    subjects: [],
  };

  // Format error message
  const error = queryError
    ? queryError instanceof Error
      ? queryError.message
      : "Failed to fetch students data"
    : null;

  // Mutation for adding a student
  const addStudentMutation = useMutation({
    mutationFn: async (studentData: CreateStudentInput) => {
      if (!user) throw new Error("User not authenticated");

      console.log("[Student Creation] Starting for:", studentData.student_id);

      // Check for duplicates BEFORE generating QR code
      const duplicateCheck = await checkStudentExists(
        studentData.student_id,
        studentData.email
      );

      if (duplicateCheck.exists) {
        const field =
          duplicateCheck.field === "student_id" ? "Student ID" : "Email";
        const value =
          duplicateCheck.field === "student_id"
            ? studentData.student_id
            : studentData.email;
        throw new Error(
          `${field} "${value}" is already registered. Each student must have a unique ID and email.`
        );
      }

      console.log("[QR Generation] Starting...");

      // Generate secure QR code via API route
      const qrResponse = await fetch("/api/qr/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: studentData.student_id }),
      });

      console.log("[QR Generation] API Response Status:", qrResponse.status);

      if (!qrResponse.ok) {
        const errorData = await qrResponse.json().catch(() => ({}));
        console.error("[QR Generation] API Error:", errorData);
        throw new Error(
          errorData.error ||
            `QR generation failed with status ${qrResponse.status}`
        );
      }

      const responseData = await qrResponse.json();
      console.log("[QR Generation] Success!");

      if (!responseData.success || !responseData.qrCode) {
        throw new Error(
          responseData.error || "QR code generation returned invalid response"
        );
      }

      const qrCode = responseData.qrCode;

      // Validate QR code format before saving
      if (!qrCode.startsWith("EVSU:STU:")) {
        throw new Error(
          `Invalid QR code format received: ${qrCode}. Expected format: EVSU:STU:xxx:xxx`
        );
      }

      // Create student with generated QR code
      console.log("[Student Creation] Saving to Firestore...");
      await createStudent({
        ...studentData,
        qr_code: qrCode,
      });
    },
    onSuccess: () => {
      // Invalidate students and programs queries (student count affects programs)
      queryClient.invalidateQueries({ queryKey: queryKeys.students });
      queryClient.invalidateQueries({ queryKey: queryKeys.programs });
    },
  });

  // Mutation for editing a student
  const editStudentMutation = useMutation({
    mutationFn: async ({
      id,
      studentData,
    }: {
      id: string;
      studentData: Partial<CreateStudentInput>;
    }) => {
      if (!user) throw new Error("User not authenticated");

      // Check for duplicates if email is being changed
      if (studentData.email) {
        const duplicateCheck = await checkStudentExists(
          studentData.student_id || "", // We can't change student_id in edit, so this is safe
          studentData.email,
          id // Exclude current student from duplicate check
        );

        if (duplicateCheck.exists && duplicateCheck.field === "email") {
          throw new Error(
            `Email "${studentData.email}" is already registered to another student.`
          );
        }
      }

      await updateStudent(id, studentData);
    },
    onSuccess: () => {
      // Invalidate students query to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.students });
    },
  });

  // Mutation for deleting a student
  const deleteStudentMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("User not authenticated");
      await deleteStudent(id);
    },
    onSuccess: () => {
      // Invalidate students, programs, and enrollments queries
      queryClient.invalidateQueries({ queryKey: queryKeys.students });
      queryClient.invalidateQueries({ queryKey: queryKeys.programs });
      queryClient.invalidateQueries({ queryKey: queryKeys.enrollments });
    },
  });

  // Mutation for enrolling a student in a subject
  const enrollStudentMutation = useMutation({
    mutationFn: async ({
      studentId,
      subjectId,
      programId,
    }: {
      studentId: string;
      subjectId: string;
      programId: string;
    }) => {
      if (!user) throw new Error("User not authenticated");

      await enrollStudent({
        student_id: studentId,
        subject_id: subjectId,
        program_id: programId,
      });
    },
    onSuccess: () => {
      // Invalidate students, subjects, and enrollments queries
      queryClient.invalidateQueries({ queryKey: queryKeys.students });
      queryClient.invalidateQueries({ queryKey: queryKeys.subjects });
      queryClient.invalidateQueries({ queryKey: queryKeys.enrollments });
    },
  });

  // Mutation for regenerating QR code
  const regenerateQRMutation = useMutation({
    mutationFn: async ({
      studentId,
      firebaseDocId,
    }: {
      studentId: string;
      firebaseDocId: string;
    }) => {
      if (!user) throw new Error("User not authenticated");

      // Call API to regenerate QR code
      const response = await fetch("/api/qr/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, firebaseDocId }),
      });

      if (!response.ok) {
        throw new Error("Failed to regenerate QR code");
      }

      const { qrCode } = await response.json();
      return qrCode;
    },
    onSuccess: () => {
      // Invalidate students query to show new QR code
      queryClient.invalidateQueries({ queryKey: queryKeys.students });
    },
  });

  // Wrapper functions to maintain API compatibility
  const addStudent = async (studentData: CreateStudentInput) => {
    return addStudentMutation.mutateAsync(studentData);
  };

  const editStudent = async (
    id: string,
    studentData: Partial<CreateStudentInput>
  ) => {
    return editStudentMutation.mutateAsync({ id, studentData });
  };

  const removeStudent = async (id: string) => {
    return deleteStudentMutation.mutateAsync(id);
  };

  const enrollStudentInSubject = async (
    studentId: string,
    subjectId: string,
    programId: string
  ) => {
    return enrollStudentMutation.mutateAsync({
      studentId,
      subjectId,
      programId,
    });
  };

  const regenerateQRCode = async (studentId: string, firebaseDocId: string) => {
    return regenerateQRMutation.mutateAsync({ studentId, firebaseDocId });
  };

  const refreshData = () => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.students });
  };

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
    regenerateQRCode,
    refreshData,
  };
}
