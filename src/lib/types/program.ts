// src/lib/types/program.ts
import { Timestamp } from "firebase/firestore";

export interface Program {
  id: string;
  name: string;
  academic_year: string;
  created_at: Timestamp;
}

export interface CreateProgramInput {
  name: string;
  academic_year: string;
}
