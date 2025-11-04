import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, GraduationCap, BookMarked } from "lucide-react";
import type { DashboardStats } from "@/hooks/useDashboardData";

interface SummaryCardsProps {
  stats: DashboardStats;
}

export function SummaryCards({ stats }: SummaryCardsProps) {
  const cards = [
    {
      title: "Total Students",
      value: stats.totalStudents.toLocaleString(),
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Total Teachers",
      value: stats.totalTeachers.toLocaleString(),
      icon: GraduationCap,
      color: "text-green-500",
    },
    {
      title: "Total Programs",
      value: stats.totalPrograms.toLocaleString(),
      icon: BookOpen,
      color: "text-purple-500",
    },
    {
      title: "Total Subjects",
      value: stats.totalSubjects.toLocaleString(),
      icon: BookMarked,
      color: "text-orange-500",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
