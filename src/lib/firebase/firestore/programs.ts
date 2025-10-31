// src/lib/firebase/firestore/programs.ts
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  type DocumentData,
  type WithFieldValue,
} from "firebase/firestore";
import { db } from "../config";
import type { Program, CreateProgramInput } from "../../types";

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
