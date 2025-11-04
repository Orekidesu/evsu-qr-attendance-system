import { EnrollmentsPageContent } from "@/components/admin/enrollments/EnrollmentsPageContent";
import { AdminLayout } from "@/components/layouts/AdminLayout";

export default function EnrollmentPage() {
  return (
    <AdminLayout breadcrumbs={[{ label: "Enrollments" }]}>
      <EnrollmentsPageContent />
    </AdminLayout>
  );
}
