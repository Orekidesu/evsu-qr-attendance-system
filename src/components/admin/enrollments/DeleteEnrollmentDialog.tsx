"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import type { EnrollmentWithDetails } from "@/hooks/useEnrollmentsData";

interface DeleteEnrollmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enrollment: EnrollmentWithDetails | null;
  onConfirm: () => void;
  isSubmitting: boolean;
}

export function DeleteEnrollmentDialog({
  open,
  onOpenChange,
  enrollment,
  onConfirm,
  isSubmitting,
}: DeleteEnrollmentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Enrollment</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove this enrollment? This action cannot
            be undone.
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This will permanently remove the enrollment record.
          </AlertDescription>
        </Alert>

        {enrollment && (
          <div className="space-y-2 py-4">
            <p className="text-sm">
              <span className="font-medium">Student:</span>{" "}
              {enrollment.studentName}
            </p>
            <p className="text-sm">
              <span className="font-medium">Subject:</span>{" "}
              {enrollment.subjectCode} - {enrollment.subjectTitle}
            </p>
            <p className="text-sm">
              <span className="font-medium">Program:</span>{" "}
              {enrollment.programName}
            </p>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Removing...
              </>
            ) : (
              "Remove"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
