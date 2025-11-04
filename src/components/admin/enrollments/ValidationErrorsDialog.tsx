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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";

interface ValidationError {
  studentId: string;
  studentName: string;
  errors: string[];
}

interface ValidationErrorsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  validationErrors: ValidationError[];
  totalStudents: number;
  validStudents: number;
  onProceed?: () => void;
  showProceedButton?: boolean;
}

export function ValidationErrorsDialog({
  open,
  onOpenChange,
  validationErrors,
  totalStudents,
  validStudents,
  onProceed,
  showProceedButton = false,
}: ValidationErrorsDialogProps) {
  const invalidCount = validationErrors.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            Enrollment Validation Results
          </DialogTitle>
          <DialogDescription>
            {invalidCount > 0
              ? `${invalidCount} of ${totalStudents} student(s) cannot be enrolled due to validation issues.`
              : `All ${totalStudents} student(s) can be enrolled.`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-4 my-4">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-semibold">{validStudents} Valid</span>
          </div>
          <div className="flex items-center gap-2 text-red-600">
            <XCircle className="h-5 w-5" />
            <span className="font-semibold">{invalidCount} Invalid</span>
          </div>
        </div>

        {invalidCount > 0 && (
          <div className="overflow-y-auto max-h-96 pr-4">
            <div className="space-y-3">
              {validationErrors.map((error) => (
                <Alert
                  key={error.studentId}
                  variant="destructive"
                  className="bg-red-50"
                >
                  <AlertDescription>
                    <div className="font-semibold mb-2">
                      {error.studentName}
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {error.errors.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        )}

        {invalidCount === 0 && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-semibold text-green-700">
                All students passed validation!
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                You can proceed with the enrollment.
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="flex justify-between items-center mt-4">
          <p className="text-sm text-muted-foreground">
            {validStudents > 0 &&
              showProceedButton &&
              `${validStudents} student(s) will be enrolled`}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {showProceedButton && validStudents > 0 && onProceed && (
              <Button onClick={onProceed}>
                Proceed with {validStudents} Student(s)
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
