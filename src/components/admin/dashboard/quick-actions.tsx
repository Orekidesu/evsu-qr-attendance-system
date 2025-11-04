import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, UserPlus, BookPlus, LogIn } from "lucide-react";
import Link from "next/link";

export function QuickActions() {
  const actions = [
    {
      title: "Add New Student",
      description: "Create a new student account",
      icon: UserPlus,
      href: "/admin/students",
    },
    {
      title: "Create Subject",
      description: "Add a new subject to the system",
      icon: BookPlus,
      href: "/admin/subjects",
    },
    {
      title: "Add Program",
      description: "Create a new academic program",
      icon: Plus,
      href: "/admin/programs",
    },
    {
      title: "Enroll Student",
      description: "Enroll a student in a subject",
      icon: LogIn,
      href: "/admin/enrollments",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and operations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.title} href={action.href}>
                <Button
                  variant="outline"
                  className="w-full h-auto flex flex-col items-start p-4 gap-2 bg-transparent hover:bg-accent"
                >
                  <Icon className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold text-sm">{action.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {action.description}
                    </div>
                  </div>
                </Button>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
