"use client";

import { useState, useEffect, useCallback } from "react";
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

export function useStudentsData() {
  const { user, loading: authLoading } = useAuth();
  const [students, setStudents] = useState<StudentWithDetails[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
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
      const [studentsData, programsData, subjectsData] = await Promise.all([
        getAllStudents(),
        getAllPrograms(),
        getAllSubjects(),
      ]);

      setPrograms(programsData);
      setSubjects(subjectsData);

      // Enrich students with program name and enrolled subjects
      const enrichedStudents = await Promise.all(
        studentsData.map(async (student) => {
          try {
            const program = programsData.find(
              (p) => p.id === student.program_id
            );

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

      setStudents(enrichedStudents);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch students data";
      setError(errorMessage);
      console.error("Error fetching students:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      fetchData();
    }
  }, [authLoading, fetchData]);

  const addStudent = useCallback(
    async (studentData: CreateStudentInput) => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      try {
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

        // console.log("[Student Creation] Success! Refreshing data...");
        await fetchData(); // Refresh the list
      } catch (err) {
        console.error("[Student Creation] Error:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create student";
        throw new Error(errorMessage);
      }
    },
    [user, fetchData]
  );

  const editStudent = useCallback(
    async (id: string, studentData: Partial<CreateStudentInput>) => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      try {
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
        await fetchData(); // Refresh the list
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update student";
        throw new Error(errorMessage);
      }
    },
    [user, fetchData]
  );

  const removeStudent = useCallback(
    async (id: string) => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      try {
        await deleteStudent(id);
        await fetchData(); // Refresh the list
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete student";
        throw new Error(errorMessage);
      }
    },
    [user, fetchData]
  );

  const enrollStudentInSubject = useCallback(
    async (studentId: string, subjectId: string, programId: string) => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      try {
        await enrollStudent({
          student_id: studentId,
          subject_id: subjectId,
          program_id: programId,
        });
        await fetchData(); // Refresh to update enrolled subjects
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to enroll student";
        throw new Error(errorMessage);
      }
    },
    [user, fetchData]
  );

  const regenerateQRCode = useCallback(
    async (studentId: string, firebaseDocId: string) => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      try {
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

        await fetchData(); // Refresh the list to show new QR code

        return qrCode;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to regenerate QR code";
        throw new Error(errorMessage);
      }
    },
    [user, fetchData]
  );

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
    refreshData: fetchData,
  };
}
