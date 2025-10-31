// src/lib/firebase/firestore/subjects.ts
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
  type DocumentData,
  type WithFieldValue,
} from "firebase/firestore";
import { db } from "../config";
import type { Subject, CreateSubjectInput } from "../../types";

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
