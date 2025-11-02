"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { TeacherWithDetails } from "@/hooks/useTeachersData";

interface ViewTeacherModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher: TeacherWithDetails;
}

export function ViewTeacherModal({
  open,
  onOpenChange,
  teacher,
}: ViewTeacherModalProps) {
  if (!teacher) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Teacher Profile</DialogTitle>
          <DialogDescription>
            View teacher details and information
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">First Name</p>
              <p className="font-medium">{teacher.first_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Name</p>
              <p className="font-medium">{teacher.last_name}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{teacher.email}</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Assigned Subjects</CardTitle>
              <CardDescription>
                {teacher.assignedSubjectsDetails.length} subject
                {teacher.assignedSubjectsDetails.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {teacher.assignedSubjectsDetails.length > 0 ? (
                <div className="flex gap-2 flex-wrap">
                  {teacher.assignedSubjectsDetails.map((subject) => (
                    <Badge key={subject.id} variant="secondary">
                      {subject.courseCode} - {subject.title}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No subjects assigned yet
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Total Students
                </span>
                <span className="text-2xl font-bold">
                  {teacher.totalStudents}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
