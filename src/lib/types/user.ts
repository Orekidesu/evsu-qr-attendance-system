// src/lib/types/user.ts
import { Timestamp } from "firebase/firestore";

export type UserRole = "admin" | "teacher" | "student";

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  program_id?: string; // only for students
  assigned_subjects?: string[]; // only for teachers
  qr_code?: string; // only for students
  created_at: Timestamp;
}

export interface CreateUserInput {
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  program_id?: string;
  assigned_subjects?: string[];
  qr_code?: string;
}
