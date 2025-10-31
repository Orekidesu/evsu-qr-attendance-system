import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserPlus, BookPlus } from "lucide-react"

export function RecentActivity() {
  const recentStudents = [
    { id: 1, name: "John Doe", email: "john@example.com", date: "2 hours ago" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", date: "5 hours ago" },
    { id: 3, name: "Mike Johnson", email: "mike@example.com", date: "1 day ago" },
    { id: 4, name: "Sarah Williams", email: "sarah@example.com", date: "2 days ago" },
    { id: 5, name: "Tom Brown", email: "tom@example.com", date: "3 days ago" },
  ]

  const recentSubjects = [
    { id: 1, name: "Mathematics 101", program: "Computer Science", date: "1 hour ago" },
    { id: 2, name: "Physics Basics", program: "Engineering", date: "4 hours ago" },
    { id: 3, name: "English Literature", program: "Liberal Arts", date: "1 day ago" },
    { id: 4, name: "Chemistry Advanced", program: "Science", date: "2 days ago" },
    { id: 5, name: "History of Art", program: "Fine Arts", date: "3 days ago" },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Recently Added Students */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Recently Added Students
          </CardTitle>
          <CardDescription>Last 5 students added to the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentStudents.map((student) => (
              <div key={student.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div className="flex-1">
                  <p className="font-medium text-sm">{student.name}</p>
                  <p className="text-xs text-muted-foreground">{student.email}</p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {student.date}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recently Created Subjects */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookPlus className="h-5 w-5" />
            Recently Created Subjects
          </CardTitle>
          <CardDescription>Last 5 subjects added to the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentSubjects.map((subject) => (
              <div key={subject.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div className="flex-1">
                  <p className="font-medium text-sm">{subject.name}</p>
                  <p className="text-xs text-muted-foreground">{subject.program}</p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {subject.date}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
