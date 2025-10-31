import { Timestamp } from "firebase/firestore";

export interface Student {
  id: string;
  student_id: string; // unique student number
  first_name: string;
  last_name: string;
  email?: string; // optional
  program_id: string;
  qr_code: string;
  created_at: Timestamp;
}

export interface CreateStudentInput {
  student_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  program_id: string;
  qr_code?: string; // will be auto-generated if not provided
}
