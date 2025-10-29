import { AdminLayout } from "@/components/layouts/AdminLayout";

export default function SettingPage() {
  return (
    <AdminLayout breadcrumbs={[{ label: "Settings" }]}>
      <div className="flex items-center justify-center min-h-[400px]">
        <h1 className="text-4xl font-bold">Settings</h1>
      </div>
    </AdminLayout>
  );
}
