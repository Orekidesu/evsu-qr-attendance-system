// src/lib/firebase/firestore/attendance.ts
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
  type DocumentData,
  type WithFieldValue,
} from "firebase/firestore";
import { db } from "../config";
import type { Attendance, CreateAttendanceInput } from "../../types";

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
