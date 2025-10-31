"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TeacherWithDetails } from "@/hooks/useTeachersData";

interface EditTeacherModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher: TeacherWithDetails;
  onEdit: (data: { id: string; first_name: string; last_name: string }) => void;
}

export function EditTeacherModal({
  open,
  onOpenChange,
  teacher,
  onEdit,
}: EditTeacherModalProps) {
  const [firstName, setFirstName] = useState(teacher.first_name);
  const [lastName, setLastName] = useState(teacher.last_name);
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    onEdit({
      id: teacher.id,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
    });
  };

  if (!teacher) return null;

  return (
    <Dialog key={teacher.id} open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Teacher</DialogTitle>
          <DialogDescription>Update teacher information</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="firstName">
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  if (errors.firstName) {
                    setErrors({ ...errors, firstName: undefined });
                  }
                }}
                className={errors.firstName ? "border-red-500" : ""}
              />
              {errors.firstName && (
                <p className="text-sm text-red-500">{errors.firstName}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="lastName">
                Last Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  if (errors.lastName) {
                    setErrors({ ...errors, lastName: undefined });
                  }
                }}
                className={errors.lastName ? "border-red-500" : ""}
              />
              {errors.lastName && (
                <p className="text-sm text-red-500">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={teacher.email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Assigned Subjects</Label>
            <div className="p-3 bg-muted rounded-md">
              {teacher.assignedSubjectsDetails.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {teacher.assignedSubjectsDetails.map((subject) => (
                    <div
                      key={subject.id}
                      className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-sm"
                    >
                      {subject.courseCode} - {subject.title}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No subjects assigned yet
                </p>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Subjects are managed in the Subjects page
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
