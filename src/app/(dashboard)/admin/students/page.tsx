import { AdminLayout } from "@/components/layouts/AdminLayout";

export default function StudentPage() {
  return (
    <AdminLayout breadcrumbs={[{ label: "Students" }]}>
      <h1>
        <center>This is the students management page</center>
      </h1>
    </AdminLayout>
  );
}
