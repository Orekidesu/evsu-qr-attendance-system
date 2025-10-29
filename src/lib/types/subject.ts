// src/lib/types/subject.ts
import { Timestamp } from "firebase/firestore";

export interface Schedule {
  days: string[]; // ["Mon", "Wed", "Fri"]
  time_start: string; // "08:00"
  time_end: string; // "10:00"
}

export interface Subject {
  id: string;
  course_code: string;
  descriptive_title: string;
  program_id: string;
  teacher_id: string;
  schedules: Schedule[];
  created_at: Timestamp;
}

export interface CreateSubjectInput {
  course_code: string;
  descriptive_title: string;
  program_id: string;
  teacher_id: string;
  schedules: Schedule[];
}
