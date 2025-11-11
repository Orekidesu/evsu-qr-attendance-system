import { TeacherLayout } from "@/components/layouts/TeacherLayout";

export default function TeacherPage() {
  return (
    <TeacherLayout>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
      </div>
    </TeacherLayout>
  );
}
