// src/lib/firebase/firestore/students.ts
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config";
import type { Student, CreateStudentInput } from "../../types";

export const createStudent = async (
  data: CreateStudentInput
): Promise<string> => {
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

  const docRef = await addDoc(collection(db, "students"), {
    ...data,
    qr_code: data.qr_code,
    created_at: serverTimestamp(),
  });
  return docRef.id;
};

export const getStudent = async (
  studentId: string
): Promise<Student | null> => {
  const docSnap = await getDoc(doc(db, "students", studentId));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Student;
};

export const getAllStudents = async (): Promise<Student[]> => {
  const querySnapshot = await getDocs(collection(db, "students"));
  return querySnapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as Student
  );
};

export const getStudentsByProgram = async (
  programId: string
): Promise<Student[]> => {
  const q = query(
    collection(db, "students"),
    where("program_id", "==", programId)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as Student
  );
};

export const getStudentByStudentId = async (
  studentId: string
): Promise<Student | null> => {
  const q = query(
    collection(db, "students"),
    where("student_id", "==", studentId)
  );
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return null;
  const doc = querySnapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Student;
};

export const getStudentByQRCode = async (
  qrCode: string
): Promise<Student | null> => {
  const q = query(collection(db, "students"), where("qr_code", "==", qrCode));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return null;
  const doc = querySnapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Student;
};

export const updateStudent = async (
  studentId: string,
  data: Partial<CreateStudentInput>
): Promise<void> => {
  await updateDoc(doc(db, "students", studentId), data as never);
};

export const deleteStudent = async (studentId: string): Promise<void> => {
  await deleteDoc(doc(db, "students", studentId));
};
