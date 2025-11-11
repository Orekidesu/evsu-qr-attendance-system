import { TeacherLayout } from "@/components/layouts/TeacherLayout";
import { StudentsPageContent } from "@/components/teacher/students/StudentsPageContent";

export default function TeacherStudentsPage() {
  return (
    <TeacherLayout>
      <StudentsPageContent />
    </TeacherLayout>
  );
}
