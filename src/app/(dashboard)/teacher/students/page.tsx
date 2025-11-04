import { TeacherLayout } from "@/components/layouts/TeacherLayout";

export default function StudentsPage() {
  return (
    <TeacherLayout breadcrumbs={[{ label: "My Students" }]}>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <h1 className="text-3xl font-bold">My Students</h1>
      </div>
    </TeacherLayout>
  );
}
