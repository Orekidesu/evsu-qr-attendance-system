// src/lib/firebase/firestore.ts
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
  orderBy,
  serverTimestamp,
  type DocumentData,
  type WithFieldValue,
} from "firebase/firestore";
import { db } from "./config";
import type {
  User,
  Program,
  Subject,
  Attendance,
  Enrollment,
  CreateProgramInput,
  CreateSubjectInput,
  CreateAttendanceInput,
  CreateEnrollmentInput,
} from "../types";

// ==================== USERS ====================

export async function getUser(userId: string): Promise<User | null> {
  const docSnap = await getDoc(doc(db, "users", userId));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as User;
}

export async function getAllUsers(): Promise<User[]> {
  const querySnapshot = await getDocs(collection(db, "users"));
  return querySnapshot.docs.map(
    (document) => ({ id: document.id, ...document.data() }) as User
  );
}

export async function getUsersByRole(role: string): Promise<User[]> {
  const q = query(collection(db, "users"), where("role", "==", role));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(
    (document) => ({ id: document.id, ...document.data() }) as User
  );
}

export async function updateUser(
  userId: string,
  data: Partial<User>
): Promise<void> {
  await updateDoc(
    doc(db, "users", userId),
    data as WithFieldValue<DocumentData>
  );
}

export async function deleteUser(userId: string): Promise<void> {
  await deleteDoc(doc(db, "users", userId));
}

// ==================== PROGRAMS ====================

export async function createProgram(data: CreateProgramInput): Promise<string> {
  const docRef = await addDoc(collection(db, "programs"), {
    ...data,
    created_at: serverTimestamp(),
  });
  return docRef.id;
}

export async function getProgram(programId: string): Promise<Program | null> {
  const docSnap = await getDoc(doc(db, "programs", programId));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Program;
}

export async function getAllPrograms(): Promise<Program[]> {
  const querySnapshot = await getDocs(collection(db, "programs"));
  return querySnapshot.docs.map(
    (document) => ({ id: document.id, ...document.data() }) as Program
  );
}

export async function updateProgram(
  programId: string,
  data: Partial<CreateProgramInput>
): Promise<void> {
  await updateDoc(
    doc(db, "programs", programId),
    data as WithFieldValue<DocumentData>
  );
}

export async function deleteProgram(programId: string): Promise<void> {
  await deleteDoc(doc(db, "programs", programId));
}

// ==================== SUBJECTS ====================

export async function createSubject(data: CreateSubjectInput): Promise<string> {
  const docRef = await addDoc(collection(db, "subjects"), {
    ...data,
    created_at: serverTimestamp(),
  });
  return docRef.id;
}

export async function getSubject(subjectId: string): Promise<Subject | null> {
  const docSnap = await getDoc(doc(db, "subjects", subjectId));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Subject;
}

export async function getAllSubjects(): Promise<Subject[]> {
  const querySnapshot = await getDocs(collection(db, "subjects"));
  return querySnapshot.docs.map(
    (document) => ({ id: document.id, ...document.data() }) as Subject
  );
}

export async function getSubjectsByTeacher(
  teacherId: string
): Promise<Subject[]> {
  const q = query(
    collection(db, "subjects"),
    where("teacher_id", "==", teacherId)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(
    (document) => ({ id: document.id, ...document.data() }) as Subject
  );
}

export async function getSubjectsByProgram(
  programId: string
): Promise<Subject[]> {
  const q = query(
    collection(db, "subjects"),
    where("program_id", "==", programId)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(
    (document) => ({ id: document.id, ...document.data() }) as Subject
  );
}

export async function updateSubject(
  subjectId: string,
  data: Partial<CreateSubjectInput>
): Promise<void> {
  await updateDoc(
    doc(db, "subjects", subjectId),
    data as WithFieldValue<DocumentData>
  );
}

export async function deleteSubject(subjectId: string): Promise<void> {
  await deleteDoc(doc(db, "subjects", subjectId));
}

// ==================== ENROLLMENTS ====================

export async function enrollStudent(
  data: CreateEnrollmentInput
): Promise<string> {
  const docRef = await addDoc(collection(db, "enrollments"), {
    ...data,
    enrolled_at: serverTimestamp(),
  });
  return docRef.id;
}

export async function getEnrollmentsByStudent(
  studentId: string
): Promise<Enrollment[]> {
  const q = query(
    collection(db, "enrollments"),
    where("student_id", "==", studentId)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(
    (document) => ({ id: document.id, ...document.data() }) as Enrollment
  );
}

export async function getEnrollmentsBySubject(
  subjectId: string
): Promise<Enrollment[]> {
  const q = query(
    collection(db, "enrollments"),
    where("subject_id", "==", subjectId)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(
    (document) => ({ id: document.id, ...document.data() }) as Enrollment
  );
}

export async function deleteEnrollment(enrollmentId: string): Promise<void> {
  await deleteDoc(doc(db, "enrollments", enrollmentId));
}

// ==================== ATTENDANCE ====================

export async function markAttendance(
  subjectId: string,
  data: CreateAttendanceInput
): Promise<string> {
  const docRef = await addDoc(
    collection(db, "subjects", subjectId, "attendance"),
    {
      ...data,
      timestamp: serverTimestamp(),
    }
  );
  return docRef.id;
}

export async function getAttendanceBySubject(
  subjectId: string,
  date?: string
): Promise<Attendance[]> {
  const q = date
    ? query(
        collection(db, "subjects", subjectId, "attendance"),
        where("date", "==", date),
        orderBy("timestamp", "desc")
      )
    : query(
        collection(db, "subjects", subjectId, "attendance"),
        orderBy("timestamp", "desc")
      );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(
    (document) => ({ id: document.id, ...document.data() }) as Attendance
  );
}

export async function getAttendanceByStudent(
  subjectId: string,
  studentId: string
): Promise<Attendance[]> {
  const q = query(
    collection(db, "subjects", subjectId, "attendance"),
    where("student_id", "==", studentId),
    orderBy("date", "desc")
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(
    (document) => ({ id: document.id, ...document.data() }) as Attendance
  );
}

export async function updateAttendance(
  subjectId: string,
  attendanceId: string,
  data: Partial<CreateAttendanceInput>
): Promise<void> {
  await updateDoc(
    doc(db, "subjects", subjectId, "attendance", attendanceId),
    data as WithFieldValue<DocumentData>
  );
}

export async function deleteAttendance(
  subjectId: string,
  attendanceId: string
): Promise<void> {
  await deleteDoc(doc(db, "subjects", subjectId, "attendance", attendanceId));
}
