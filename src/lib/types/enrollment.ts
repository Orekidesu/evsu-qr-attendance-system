// src/lib/types/enrollment.ts
import { Timestamp } from "firebase/firestore";

export interface Enrollment {
  id: string;
  student_id: string;
  subject_id: string;
  program_id: string;
  enrolled_at: Timestamp;
}

export interface CreateEnrollmentInput {
  student_id: string;
  subject_id: string;
  program_id: string;
}
