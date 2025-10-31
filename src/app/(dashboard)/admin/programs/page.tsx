import { AdminLayout } from "@/components/layouts/AdminLayout";

export default function ProgramPage() {
  return (
    <AdminLayout breadcrumbs={[{ label: "Programs" }]}>
      <div className="flex items-center justify-center min-h-[400px]">
        <h1 className="text-4xl font-bold">Programs Management</h1>
      </div>
    </AdminLayout>
  );
}
