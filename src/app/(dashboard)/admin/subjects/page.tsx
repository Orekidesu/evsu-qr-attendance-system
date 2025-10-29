import { AdminLayout } from "@/components/layouts/AdminLayout";

export default function SubjectPage() {
  return (
    <AdminLayout breadcrumbs={[{ label: "Subjects" }]}>
      <div className="flex items-center justify-center min-h-[400px]">
        <h1 className="text-4xl font-bold">Subjects Management</h1>
      </div>
    </AdminLayout>
  );
}
