import { TeachersPageContent } from "@/components/admin/teachers/TeachersPageContent";
import { AdminLayout } from "@/components/layouts/AdminLayout";

export default function TeachersPage() {
  return (
    <AdminLayout breadcrumbs={[{ label: "Teachers" }]}>
      <TeachersPageContent />
    </AdminLayout>
  );
}
