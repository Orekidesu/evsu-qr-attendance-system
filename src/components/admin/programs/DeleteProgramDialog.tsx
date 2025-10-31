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
}

export function DeleteProgramDialog({
  open,
  onOpenChange,
  onConfirm,
  programName,
  subjectsCount,
  studentsCount,
}: DeleteProgramDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting program:", error);
    } finally {
      setIsLoading(false);
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
          </DialogDescription>
        </DialogHeader>
        {(subjectsCount > 0 || studentsCount > 0) && (
          <div className="space-y-2 rounded-lg bg-destructive/10 p-4">
            <p className="text-sm font-medium text-destructive">Warning:</p>
            <p className="text-sm text-muted-foreground">
              This will affect{" "}
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
              .
            </p>
          </div>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
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
