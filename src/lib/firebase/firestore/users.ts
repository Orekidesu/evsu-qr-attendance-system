// src/lib/firebase/firestore/users.ts
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  type DocumentData,
  type WithFieldValue,
} from "firebase/firestore";
import { db } from "../config";
import type { User } from "../../types";

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
