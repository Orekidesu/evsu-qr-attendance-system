import { TeacherLayout } from "@/components/layouts/TeacherLayout";
import { DashboardPageContent } from "@/components/teacher/dashboard/DashboardPageContent";

export default function TeacherPage() {
  return (
    <TeacherLayout>
      <DashboardPageContent />
    </TeacherLayout>
  );
}
