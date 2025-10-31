// src/lib/types/user.ts
import { Timestamp } from "firebase/firestore";

export type UserRole = "admin" | "teacher";

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  assigned_subjects?: string[]; // only for teachers
  created_at: Timestamp;
}

export interface CreateUserInput {
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  assigned_subjects?: string[];
}
