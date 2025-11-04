import { AdminLayout } from "@/components/layouts/AdminLayout";
import { SettingsPageContent } from "@/components/commons/settings/SettingsPageContent";

export default function SettingsPage() {
  return (
    <AdminLayout breadcrumbs={[{ label: "Settings" }]}>
      <SettingsPageContent />
    </AdminLayout>
  );
}
