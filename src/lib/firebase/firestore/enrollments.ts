// src/lib/firebase/firestore/enrollments.ts
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config";
import type { Enrollment, CreateEnrollmentInput } from "../../types";

export async function getAllEnrollments(): Promise<Enrollment[]> {
  const querySnapshot = await getDocs(collection(db, "enrollments"));
  return querySnapshot.docs.map(
    (document) => ({ id: document.id, ...document.data() }) as Enrollment
  );
}

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
