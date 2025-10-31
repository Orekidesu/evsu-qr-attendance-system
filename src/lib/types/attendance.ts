// src/lib/types/attendance.ts
import { Timestamp } from "firebase/firestore";
import { Schedule } from "./subject";

export type AttendanceStatus = "Present" | "Absent" | "Late";

export interface Attendance {
  id: string;
  student_id: string;
  date: string; // YYYY-MM-DD format
  status: AttendanceStatus;
  schedule: Schedule;
  timestamp: Timestamp;
}

export interface CreateAttendanceInput {
  student_id: string;
  date: string;
  status: AttendanceStatus;
  schedule: Schedule;
}
