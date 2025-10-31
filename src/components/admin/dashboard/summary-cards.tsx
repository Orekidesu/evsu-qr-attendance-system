import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, GraduationCap, BookMarked } from "lucide-react"

export function SummaryCards() {
  const cards = [
    {
      title: "Total Students",
      value: "1,234",
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Total Teachers",
      value: "56",
      icon: GraduationCap,
      color: "text-green-500",
    },
    {
      title: "Total Programs",
      value: "12",
      icon: BookOpen,
      color: "text-purple-500",
    },
    {
      title: "Total Subjects",
      value: "89",
      icon: BookMarked,
      color: "text-orange-500",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <Icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
