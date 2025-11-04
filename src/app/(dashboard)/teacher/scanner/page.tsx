import { TeacherLayout } from "@/components/layouts/TeacherLayout";

export default function ScannerPage() {
  return (
    <TeacherLayout breadcrumbs={[{ label: "Scanner" }]}>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <h1 className="text-3xl font-bold">QR Code Scanner</h1>
      </div>
    </TeacherLayout>
  );
}
