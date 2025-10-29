"use client";

import { AdminLayout } from "@/components/layouts/AdminLayout";

export default function AdminPage() {
  return (
    <AdminLayout>
      <div className="grid auto-rows-min gap-4 md:grid-cols-3 pt-4">
        <div className="bg-muted/50 aspect-video rounded-xl flex items-center justify-center">
          <p className="text-muted-foreground">Card 1</p>
        </div>
        <div className="bg-muted/50 aspect-video rounded-xl flex items-center justify-center">
          <p className="text-muted-foreground">Card 2</p>
        </div>
        <div className="bg-muted/50 aspect-video rounded-xl flex items-center justify-center">
          <p className="text-muted-foreground">Card 3</p>
        </div>
      </div>
      <div className="bg-muted/50 min-h-[400px] flex-1 rounded-xl flex items-center justify-center">
        <h1 className="text-4xl font-bold text-muted-foreground">
          Admin Dashboard
        </h1>
      </div>
    </AdminLayout>
  );
}
