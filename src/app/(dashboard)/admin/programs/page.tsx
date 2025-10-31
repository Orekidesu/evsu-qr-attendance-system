import { ProgramsPageContent } from "@/components/admin/programs/ProgramsPageContent";
import { AdminLayout } from "@/components/layouts/AdminLayout";

export default function ProgramPage() {
  return (
    <AdminLayout breadcrumbs={[{ label: "Programs" }]}>
      <ProgramsPageContent />
    </AdminLayout>
  );
}
