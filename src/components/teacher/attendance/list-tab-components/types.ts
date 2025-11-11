import type { AttendanceStatus } from "@/lib/types/attendance";

export interface AttendanceRecord {
  id: string;
  attendanceId: string;
  studentId: string;
  student_id: string;
  name: string;
  date: string;
  status: AttendanceStatus;
  time: string;
  schedule: string;
}
