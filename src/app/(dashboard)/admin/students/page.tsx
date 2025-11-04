import { AdminLayout } from "@/components/layouts/AdminLayout";
import { StudentsPageContent } from "@/components/admin/students/StudentsPageContent";

export default function StudentPage() {
  return (
    <AdminLayout breadcrumbs={[{ label: "Students" }]}>
      <StudentsPageContent />
    </AdminLayout>
  );
}
