"use client";

import { AdminLayout } from "@/components/layouts/AdminLayout";
import { SummaryCards } from "@/components/admin/dashboard/summary-cards";
import { RecentActivity } from "@/components/admin/dashboard/recent-activity";
import { QuickActions } from "@/components/admin/dashboard/quick-actions";

export default function AdminPage() {
  return (
    <AdminLayout>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <SummaryCards />

        <QuickActions />

        <RecentActivity />
      </div>
    </AdminLayout>
  );
}
