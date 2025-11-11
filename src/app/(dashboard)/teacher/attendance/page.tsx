import { TeacherLayout } from "@/components/layouts/TeacherLayout";
import AttendancePageContent from "@/components/teacher/attendance/AttendancePageContent";

export default function AttendancePage() {
  return (
    <TeacherLayout breadcrumbs={[{ label: "Attendance" }]}>
      <AttendancePageContent />
    </TeacherLayout>
  );
}
