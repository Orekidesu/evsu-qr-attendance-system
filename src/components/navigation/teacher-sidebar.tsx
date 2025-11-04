"use client";

import type * as React from "react";
import {
  Command,
  Settings,
  Users,
  QrCode,
  ClipboardCheck,
  LayoutDashboard,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

import { NavMain } from "@/components/navigation/nav-main";
import { NavUser } from "@/components/navigation/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navMain = [
  {
    title: "Dashboard",
    url: "/teacher",
    icon: LayoutDashboard,
    isActive: true,
  },
  {
    title: "Scanner",
    url: "/teacher/scanner",
    icon: QrCode,
  },
  {
    title: "Attendance",
    url: "/teacher/attendance",
    icon: ClipboardCheck,
  },
  {
    title: "My Students",
    url: "/teacher/students",
    icon: Users,
  },
  {
    title: "Settings",
    url: "/teacher/settings",
    icon: Settings,
  },
];

export function TeacherSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();

  const userData = {
    name: user ? `${user.first_name} ${user.last_name}` : "Teacher",
    email: user?.email || "teacher@example.com",
    avatar: "/avatars/teacher.jpg",
  };

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/teacher">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    EVSU QR Attendance
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
