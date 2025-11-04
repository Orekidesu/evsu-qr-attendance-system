import { TeacherLayout } from "@/components/layouts/TeacherLayout";
import { SettingsPageContent } from "@/components/commons/settings/SettingsPageContent";

export default function SettingsPage() {
  return (
    <TeacherLayout breadcrumbs={[{ label: "Settings" }]}>
      <SettingsPageContent />
    </TeacherLayout>
  );
}
