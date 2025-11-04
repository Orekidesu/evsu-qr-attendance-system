"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import type { Program } from "@/lib/types/program";
import type { CreateStudentInput } from "@/lib/types/student";

interface EditStudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: StudentWithDetails;
  onSubmit: (
    data: Partial<CreateStudentInput> & { id: string }
  ) => Promise<void>;
  programs: Program[];
  isSubmitting?: boolean;
}

export function EditStudentModal({
  open,
  onOpenChange,
  student,
  onSubmit,
  programs,
  isSubmitting = false,
}: EditStudentModalProps) {
  const [formData, setFormData] = useState({
    id: student.id,
    student_id: student.student_id,
    first_name: student.first_name,
    last_name: student.last_name,
    email: student.email || "",
    program_id: student.program_id,
  });
  const [programChanged, setProgramChanged] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim())
      newErrors.first_name = "First name is required";
    if (!formData.last_name.trim())
      newErrors.last_name = "Last name is required";
    if (!formData.program_id) newErrors.program_id = "Program is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    await onSubmit(formData);
    setErrors({});
  };

  const handleProgramChange = (value: string) => {
    setFormData({ ...formData, program_id: value });
    setProgramChanged(value !== student.program_id);
  };

  return (
    <Dialog key={student.id} open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Student</DialogTitle>
          <DialogDescription>
            Update student information. Student ID cannot be changed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-student-id">Student ID</Label>
            <Input
              id="edit-student-id"
              value={formData.student_id}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Cannot be changed
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-first-name">First Name *</Label>
              <Input
                id="edit-first-name"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
                className={errors.first_name ? "border-destructive" : ""}
                disabled={isSubmitting}
              />
              {errors.first_name && (
                <p className="text-sm text-destructive mt-1">
                  {errors.first_name}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="edit-last-name">Last Name *</Label>
              <Input
                id="edit-last-name"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
                className={errors.last_name ? "border-destructive" : ""}
                disabled={isSubmitting}
              />
              {errors.last_name && (
                <p className="text-sm text-destructive mt-1">
                  {errors.last_name}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="edit-email">Email (Optional)</Label>
            <Input
              id="edit-email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="edit-program">Program *</Label>
            <Select
              value={formData.program_id}
              onValueChange={handleProgramChange}
              disabled={isSubmitting}
            >
              <SelectTrigger
                id="edit-program"
                className={errors.program_id ? "border-destructive" : ""}
              >
                <SelectValue placeholder="Select a program" />
              </SelectTrigger>
              <SelectContent>
                {programs.map((program) => (
                  <SelectItem key={program.id} value={program.id}>
                    {program.abbreviation}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.program_id && (
              <p className="text-sm text-destructive mt-1">
                {errors.program_id}
              </p>
            )}
          </div>

          {programChanged && student.enrolledSubjects.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This student is enrolled in {student.enrolledSubjects.length}{" "}
                subject
                {student.enrolledSubjects.length !== 1 ? "s" : ""}. Changing the
                program may affect these enrollments.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
