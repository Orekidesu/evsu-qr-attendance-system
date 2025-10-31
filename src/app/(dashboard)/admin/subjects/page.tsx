import { SubjectsPageContent } from "@/components/admin/subjects/SubjectsPageContent";
import { AdminLayout } from "@/components/layouts/AdminLayout";

export default function SubjectsPage() {
  return (
    <AdminLayout breadcrumbs={[{ label: "Subjects" }]}>
      <SubjectsPageContent />
    </AdminLayout>
  );
}
