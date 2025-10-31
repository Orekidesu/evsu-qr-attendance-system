import { AdminLayout } from "@/components/layouts/AdminLayout";

export default function UserPage() {
  return (
    <AdminLayout breadcrumbs={[{ label: "Users" }]}>
      <div className="flex items-center justify-center min-h-[400px]">
        <h1 className="text-4xl font-bold">Teachers Management</h1>
      </div>
    </AdminLayout>
  );
}
