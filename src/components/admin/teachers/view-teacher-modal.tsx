"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function ViewTeacherModal({ open, onOpenChange, teacher }) {
  if (!teacher) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Teacher Profile</DialogTitle>
          <DialogDescription>View teacher details and information</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">First Name</p>
              <p className="font-medium">{teacher.firstName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Name</p>
              <p className="font-medium">{teacher.lastName}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{teacher.email}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <Badge className="mt-1" variant={teacher.status === "Active" ? "default" : "outline"}>
              {teacher.status}
            </Badge>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Assigned Subjects</CardTitle>
              <CardDescription>{teacher.assignedSubjects.length} subjects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                {teacher.assignedSubjects.map((subject) => (
                  <Badge key={subject} variant="secondary">
                    {subject}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Students</span>
                <span className="text-2xl font-bold">{teacher.totalStudents}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
