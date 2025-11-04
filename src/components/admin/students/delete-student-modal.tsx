"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import type { StudentWithDetails } from "@/hooks/useStudentsData";

interface DeleteStudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: StudentWithDetails;
  onConfirm: () => Promise<void>;
  isDeleting?: boolean;
}

export function DeleteStudentModal({
  open,
  onOpenChange,
  student,
  onConfirm,
  isDeleting = false,
}: DeleteStudentModalProps) {
  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => !open && !isDeleting && onOpenChange(open)}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Student</DialogTitle>
          <DialogDescription>This action cannot be undone.</DialogDescription>
        </DialogHeader>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You are about to delete{" "}
            <strong>
              {student.first_name} {student.last_name}
            </strong>{" "}
            ({student.student_id})
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          {student.enrolledSubjects.length > 0 && (
            <div className="bg-muted p-3 rounded-lg text-sm">
              <p className="font-medium mb-2">Impact Analysis</p>
              <p>
                This student is enrolled in{" "}
                <strong>{student.enrolledSubjects.length}</strong> subject(s):
              </p>
              <ul className="list-disc list-inside mt-2 text-xs space-y-1">
                {student.enrolledSubjects.map((subject) => (
                  <li key={subject.id}>
                    {subject.courseCode} - {subject.title}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-muted-foreground">
                All enrollments will be automatically removed.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                Deleting...
              </>
            ) : (
              "Delete Student"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
