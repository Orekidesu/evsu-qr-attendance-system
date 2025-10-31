"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TeacherWithDetails } from "@/hooks/useTeachersData";

interface DeleteTeacherModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher: TeacherWithDetails;
  onDelete: () => void;
}

export function DeleteTeacherModal({
  open,
  onOpenChange,
  teacher,
  onDelete,
}: DeleteTeacherModalProps) {
  if (!teacher) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Teacher</DialogTitle>
          <DialogDescription>This action cannot be undone</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Confirm Deletion</AlertTitle>
            <AlertDescription>
              Are you sure you want to delete {teacher.first_name}{" "}
              {teacher.last_name}?
              {teacher.assignedSubjectsDetails.length > 0 &&
                " This teacher is currently assigned to subjects and must be reassigned first."}
            </AlertDescription>
          </Alert>

          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              Teacher to be deleted:
            </p>
            <p className="font-medium">
              {teacher.first_name} {teacher.last_name}
            </p>
            <p className="text-sm text-muted-foreground">{teacher.email}</p>
          </div>

          {teacher.assignedSubjectsDetails.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-muted-foreground mb-2">
                Assigned Subjects:
              </p>
              <div className="flex gap-1 flex-wrap">
                {teacher.assignedSubjectsDetails.map((subject) => (
                  <Badge key={subject.id} variant="outline">
                    {subject.courseCode}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onDelete}>
            Delete Teacher
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
