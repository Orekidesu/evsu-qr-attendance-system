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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { Student, Subject, Program } from "@/lib/types";

interface EnrollmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enrollFormData: {
    studentId: string;
    subjectId: string;
  };
  onFormDataChange: (data: { studentId: string; subjectId: string }) => void;
  students: Student[];
  programs: Program[];
  availableSubjects: Subject[];
  onSave: () => void;
  isSubmitting: boolean;
}

export function EnrollmentFormDialog({
  open,
  onOpenChange,
  enrollFormData,
  onFormDataChange,
  students,
  programs,
  availableSubjects,
  onSave,
  isSubmitting,
}: EnrollmentFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enroll Student</DialogTitle>
          <DialogDescription>
            Select a student and subject to create a new enrollment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="student">Student</Label>
            <Select
              value={enrollFormData.studentId}
              onValueChange={(value) =>
                onFormDataChange({
                  ...enrollFormData,
                  studentId: value,
                  subjectId: "",
                })
              }
            >
              <SelectTrigger id="student">
                <SelectValue placeholder="Select a student..." />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => {
                  const program = programs.find(
                    (p) => p.id === student.program_id
                  );
                  return (
                    <SelectItem key={student.id} value={student.id}>
                      {student.student_id} - {student.first_name}{" "}
                      {student.last_name}
                      {program && ` (${program.abbreviation})`}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Select
              value={enrollFormData.subjectId}
              onValueChange={(value) =>
                onFormDataChange({ ...enrollFormData, subjectId: value })
              }
              disabled={!enrollFormData.studentId}
            >
              <SelectTrigger id="subject">
                <SelectValue
                  placeholder={
                    enrollFormData.studentId
                      ? "Select a subject..."
                      : "Select a student first"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {availableSubjects.length > 0 ? (
                  availableSubjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.course_code} - {subject.descriptive_title}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No subjects available for this program
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={onSave}
            disabled={
              isSubmitting ||
              !enrollFormData.studentId ||
              !enrollFormData.subjectId
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enrolling...
              </>
            ) : (
              "Enroll Student"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
