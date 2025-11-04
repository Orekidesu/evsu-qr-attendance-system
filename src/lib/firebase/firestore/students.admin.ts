/**
 * Server-side student operations using Firebase Admin SDK
 * Use these functions in API routes for operations that require elevated permissions
 */

import { getAdminFirestore } from "../admin";
import type { CreateStudentInput, Student } from "../../types";

/**
 * Create a student using Admin SDK (bypasses security rules)
 * Only use this in authenticated API routes
 */
export async function createStudentAdmin(
  data: CreateStudentInput
): Promise<string> {
  // Validate that QR code is provided and properly formatted
  if (!data.qr_code) {
    throw new Error(
      "QR code is required. Please ensure the QR generation service is working."
    );
  }

  // Validate QR code format (should be EVSU:STU:xxx:xxx)
  const qrParts = data.qr_code.split(":");
  if (qrParts.length !== 4 || qrParts[0] !== "EVSU" || qrParts[1] !== "STU") {
    throw new Error(
      `Invalid QR code format. Expected 'EVSU:STU:xxx:xxx', got '${data.qr_code}'`
    );
  }

  const db = getAdminFirestore();
  const docRef = await db.collection("students").add({
    ...data,
    qr_code: data.qr_code,
    created_at: new Date(),
  });

  return docRef.id;
}

/**
 * Check if a student exists with the given student_id or email
 * Uses Admin SDK for server-side operations
 */
export async function checkStudentExistsAdmin(
  studentId: string,
  email?: string,
  excludeDocId?: string
): Promise<{
  exists: boolean;
  field?: "student_id" | "email";
  existingStudent?: Student;
}> {
  const db = getAdminFirestore();

  // Check student_id
  const studentIdQuery = db
    .collection("students")
    .where("student_id", "==", studentId)
    .limit(1);

  const studentIdSnapshot = await studentIdQuery.get();

  // If found, check if it's not the excluded document
  if (!studentIdSnapshot.empty) {
    const doc = studentIdSnapshot.docs[0];
    if (!excludeDocId || doc.id !== excludeDocId) {
      return {
        exists: true,
        field: "student_id",
        existingStudent: { id: doc.id, ...doc.data() } as Student,
      };
    }
  }

  // Check email if provided
  if (email && email.trim() !== "") {
    const emailQuery = db
      .collection("students")
      .where("email", "==", email)
      .limit(1);

    const emailSnapshot = await emailQuery.get();

    if (!emailSnapshot.empty) {
      const doc = emailSnapshot.docs[0];
      if (!excludeDocId || doc.id !== excludeDocId) {
        return {
          exists: true,
          field: "email",
          existingStudent: { id: doc.id, ...doc.data() } as Student,
        };
      }
    }
  }

  return { exists: false };
}

/**
 * Get a student by ID using Admin SDK
 */
export async function getStudentAdmin(
  studentId: string
): Promise<Student | null> {
  const db = getAdminFirestore();
  const docRef = db.collection("students").doc(studentId);
  const docSnap = await docRef.get();

  if (!docSnap.exists) {
    return null;
  }

  return { id: docSnap.id, ...docSnap.data() } as Student;
}

/**
 * Update a student using Admin SDK
 */
export async function updateStudentAdmin(
  studentId: string,
  data: Partial<CreateStudentInput>
): Promise<void> {
  const db = getAdminFirestore();
  const docRef = db.collection("students").doc(studentId);

  await docRef.update({
    ...data,
    updated_at: new Date(),
  });
}

/**
 * Delete a student using Admin SDK
 */
export async function deleteStudentAdmin(studentId: string): Promise<void> {
  const db = getAdminFirestore();
  const docRef = db.collection("students").doc(studentId);
  await docRef.delete();
}
