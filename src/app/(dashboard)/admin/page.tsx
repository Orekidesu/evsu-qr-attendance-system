import { AdminLayout } from "@/components/layouts/AdminLayout";
import { DashboardPageContent } from "@/components/admin/dashboard/DashboardPageContent";

export default function AdminPage() {
  return (
    <AdminLayout>
      <DashboardPageContent />
    </AdminLayout>
  );
}
