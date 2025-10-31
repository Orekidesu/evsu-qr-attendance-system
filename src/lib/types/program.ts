// src/lib/types/program.ts
import { Timestamp } from "firebase/firestore";

export interface Program {
  id: string;
  name: string;
  abbreviation: string;
  academic_year: string;
  created_at: Timestamp;
}

export interface CreateProgramInput {
  name: string;
  abbreviation: string;
  academic_year: string;
}
