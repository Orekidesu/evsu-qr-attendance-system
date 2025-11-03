"use client";

import { useState, useEffect } from "react";
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
import { AlertCircle } from "lucide-react";
import type { CreateStudentInput } from "@/lib/types/student";
import type { Program } from "@/lib/types/program";

interface AddStudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateStudentInput) => Promise<void>;
  programs: Program[];
  isSubmitting?: boolean;
}

export function AddStudentModal({
  open,
  onOpenChange,
  onSubmit,
  programs,
  isSubmitting = false,
}: AddStudentModalProps) {
  const [formData, setFormData] = useState<CreateStudentInput>({
    student_id: "",
    first_name: "",
    last_name: "",
    email: "",
    program_id: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setFormData({
        student_id: "",
        first_name: "",
        last_name: "",
        email: "",
        program_id: "",
      });
      setErrors({});
    }
  }, [open]);

  // Email validation
  const validateEmail = (email: string): boolean => {
    if (!email) return true; // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Student ID validation (alphanumeric, no spaces)
  const validateStudentId = (id: string): boolean => {
    const idRegex = /^[A-Z0-9-]+$/;
    return idRegex.test(id);
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};

    // Student ID validation
    if (!formData.student_id.trim()) {
      newErrors.student_id = "Student ID is required";
    } else if (!validateStudentId(formData.student_id)) {
      newErrors.student_id =
        "Student ID can only contain uppercase letters, numbers, and hyphens";
    }

    // Name validation
    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required";
    } else if (formData.first_name.trim().length < 2) {
      newErrors.first_name = "First name must be at least 2 characters";
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required";
    } else if (formData.last_name.trim().length < 2) {
      newErrors.last_name = "Last name must be at least 2 characters";
    }

    // Email validation
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Program validation
    if (!formData.program_id) {
      newErrors.program_id = "Program is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    await onSubmit(formData);
  };

  // Handle Enter key submission
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isSubmitting) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => !isSubmitting && onOpenChange(open)}
    >
      <DialogContent onKeyDown={handleKeyDown}>
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>
            Create a new student record. A QR code will be automatically
            generated.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="student-id">Student ID *</Label>
            <Input
              id="student-id"
              placeholder="e.g., 2025-001"
              value={formData.student_id}
              onChange={(e) => {
                // Auto-uppercase and remove invalid characters
                const value = e.target.value
                  .toUpperCase()
                  .replace(/[^A-Z0-9-]/g, "");
                setFormData({ ...formData, student_id: value });
                // Clear error when user starts typing
                if (errors.student_id) {
                  setErrors({ ...errors, student_id: "" });
                }
              }}
              className={errors.student_id ? "border-destructive" : ""}
              disabled={isSubmitting}
              maxLength={20}
            />
            {errors.student_id && (
              <p className="text-sm text-destructive mt-1">
                {errors.student_id}
              </p>
            )}
            {!errors.student_id && formData.student_id && (
              <p className="text-xs text-muted-foreground mt-1">
                Valid student ID format
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first-name">First Name *</Label>
              <Input
                id="first-name"
                placeholder="First name"
                value={formData.first_name}
                onChange={(e) => {
                  setFormData({ ...formData, first_name: e.target.value });
                  if (errors.first_name) {
                    setErrors({ ...errors, first_name: "" });
                  }
                }}
                className={errors.first_name ? "border-destructive" : ""}
                disabled={isSubmitting}
                maxLength={50}
              />
              {errors.first_name && (
                <p className="text-sm text-destructive mt-1">
                  {errors.first_name}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="last-name">Last Name *</Label>
              <Input
                id="last-name"
                placeholder="Last name"
                value={formData.last_name}
                onChange={(e) => {
                  setFormData({ ...formData, last_name: e.target.value });
                  if (errors.last_name) {
                    setErrors({ ...errors, last_name: "" });
                  }
                }}
                className={errors.last_name ? "border-destructive" : ""}
                disabled={isSubmitting}
                maxLength={50}
              />
              {errors.last_name && (
                <p className="text-sm text-destructive mt-1">
                  {errors.last_name}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="student@example.com"
              value={formData.email}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  email: e.target.value.toLowerCase(),
                });
                if (errors.email) {
                  setErrors({ ...errors, email: "" });
                }
              }}
              className={errors.email ? "border-destructive" : ""}
              disabled={isSubmitting}
              maxLength={100}
            />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <Label htmlFor="program">Program *</Label>
            <Select
              value={formData.program_id}
              onValueChange={(value) => {
                setFormData({ ...formData, program_id: value });
                if (errors.program_id) {
                  setErrors({ ...errors, program_id: "" });
                }
              }}
              disabled={isSubmitting}
            >
              <SelectTrigger
                id="program"
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

          <div className="bg-muted p-3 rounded-lg flex gap-2 text-sm">
            <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p>
              A unique QR code will be automatically generated for this student.
            </p>
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
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                Creating...
              </>
            ) : (
              "Create Student"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
