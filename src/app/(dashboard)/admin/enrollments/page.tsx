import { AdminLayout } from "@/components/layouts/AdminLayout";

export default function EnrollmentPage() {
  return (
    <AdminLayout breadcrumbs={[{ label: "Enrollments" }]}>
      <h1>
        <center>This is the Enrollment page</center>
      </h1>
    </AdminLayout>
  );
}
