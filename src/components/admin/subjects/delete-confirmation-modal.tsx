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
import { AlertCircle } from "lucide-react";

interface Subject {
  id: string;
  courseCode: string;
  title: string;
  enrolledStudents: number;
}

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  subject: Subject;
  isDeleting?: boolean;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  subject,
  isDeleting = false,
}: DeleteConfirmationModalProps) {
  const hasEnrollments = subject.enrolledStudents > 0;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && !isDeleting && onClose()}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            Delete Subject
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this subject?
          </DialogDescription>
        </DialogHeader>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2 text-sm">
          <p className="font-semibold text-red-900">
            This action cannot be undone.
          </p>
          <p className="text-red-800">Impact warning:</p>
          <ul className="list-disc list-inside space-y-1 text-red-800">
            <li>
              {subject.enrolledStudents > 0 ? (
                <span className="font-medium">
                  {subject.enrolledStudents} students enrolled in this subject
                </span>
              ) : (
                "No students currently enrolled"
              )}
            </li>
            <li>All attendance records will be permanently deleted</li>
            <li>Course schedule will be removed from the system</li>
            <li>This action will affect historical data</li>
          </ul>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
          <p className="font-semibold text-amber-900">
            Deleting:{" "}
            <span className="font-bold">
              {subject.courseCode} - {subject.title}
            </span>
          </p>
        </div>

        {hasEnrollments && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm">
            <p className="font-semibold text-orange-900">
              ⚠️ Warning: This subject has active enrollments. Consider
              archiving instead of deleting.
            </p>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                Deleting...
              </>
            ) : (
              "Delete Subject"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
