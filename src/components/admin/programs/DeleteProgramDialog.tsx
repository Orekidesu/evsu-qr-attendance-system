import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface DeleteProgramDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  programName: string;
  subjectsCount: number;
  studentsCount: number;
  isDeleting?: boolean;
}

export function DeleteProgramDialog({
  open,
  onOpenChange,
  onConfirm,
  programName,
  subjectsCount,
  studentsCount,
  isDeleting = false,
}: DeleteProgramDialogProps) {
  const hasDependencies = subjectsCount > 0 || studentsCount > 0;

  const handleConfirm = async () => {
    if (hasDependencies) {
      // Prevent deletion if there are dependencies
      return;
    }

    try {
      await onConfirm();
    } catch (error) {
      console.error("Error deleting program:", error);
      // Error is handled by parent component
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Program</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold">{programName}</span>?
            {hasDependencies && (
              <span className="block mt-2 text-destructive">
                This action cannot be completed.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        {hasDependencies && (
          <div className="space-y-2 rounded-lg bg-destructive/10 p-4 border border-destructive/20">
            <p className="text-sm font-medium text-destructive">
              Cannot Delete Program:
            </p>
            <p className="text-sm text-muted-foreground">
              This program is currently associated with{" "}
              {subjectsCount > 0 && (
                <span className="font-semibold">
                  {subjectsCount} subject{subjectsCount !== 1 ? "s" : ""}
                </span>
              )}
              {subjectsCount > 0 && studentsCount > 0 && " and "}
              {studentsCount > 0 && (
                <span className="font-semibold">
                  {studentsCount} student{studentsCount !== 1 ? "s" : ""}
                </span>
              )}
              . Please remove or reassign them before deleting this program.
            </p>
          </div>
        )}
        {!hasDependencies && (
          <div className="space-y-2 rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              This action cannot be undone. This will permanently delete the
              program.
            </p>
          </div>
        )}
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
            disabled={isDeleting || hasDependencies}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
