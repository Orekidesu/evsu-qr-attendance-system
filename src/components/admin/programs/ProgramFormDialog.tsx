"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface ProgramFormData {
  name: string;
  abbreviation: string;
  academic_year: string;
}

interface ProgramFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: ProgramFormData) => Promise<void>;
  initialData?: ProgramFormData;
  mode: "add" | "edit";
  isSubmitting?: boolean;
  existingPrograms?: Array<{
    id: string;
    abbreviation: string;
    academic_year: string;
  }>;
  currentProgramId?: string;
}

export function ProgramFormDialog({
  open,
  onOpenChange,
  onSave,
  initialData,
  mode,
  isSubmitting = false,
  existingPrograms = [],
  currentProgramId,
}: ProgramFormDialogProps) {
  const [formData, setFormData] = useState<ProgramFormData>({
    name: "",
    abbreviation: "",
    academic_year: "",
  });
  const [errors, setErrors] = useState<Partial<ProgramFormData>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: "",
        abbreviation: "",
        academic_year: "",
      });
    }
    setErrors({});
  }, [initialData, open]);

  const validateForm = (): boolean => {
    const newErrors: Partial<ProgramFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Program name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Program name must be at least 3 characters";
    } else if (formData.name.trim().length > 100) {
      newErrors.name = "Program name must not exceed 100 characters";
    }

    if (!formData.abbreviation.trim()) {
      newErrors.abbreviation = "Abbreviation is required";
    } else if (formData.abbreviation.trim().length > 20) {
      newErrors.abbreviation = "Abbreviation must not exceed 20 characters";
    } else {
      // Check for duplicate
      const isDuplicate = existingPrograms.some(
        (program) =>
          program.abbreviation.toLowerCase() ===
            formData.abbreviation.trim().toLowerCase() &&
          program.academic_year === formData.academic_year.trim() &&
          program.id !== currentProgramId
      );
      if (isDuplicate) {
        newErrors.abbreviation = `Program with this abbreviation already exists for ${formData.academic_year}`;
      }
    }

    if (!formData.academic_year.trim()) {
      newErrors.academic_year = "Academic year is required";
    } else if (!/^\d{4}-\d{4}$/.test(formData.academic_year.trim())) {
      newErrors.academic_year = "Format should be YYYY-YYYY (e.g., 2025-2026)";
    } else {
      // Validate year range
      const [startYear, endYear] = formData.academic_year
        .split("-")
        .map(Number);
      if (endYear !== startYear + 1) {
        newErrors.academic_year =
          "End year must be exactly one year after start year";
      } else if (startYear < 2000 || startYear > 2100) {
        newErrors.academic_year = "Please enter a valid year range (2000-2100)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await onSave({
        name: formData.name.trim(),
        abbreviation: formData.abbreviation.trim().toUpperCase(),
        academic_year: formData.academic_year.trim(),
      });
    } catch (error) {
      console.error("Error saving program:", error);
      // Error is handled by parent component
    }
  };

  // Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isSubmitting) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Reset form when modal closes
  const handleOpenChange = (open: boolean) => {
    if (!open && !isSubmitting) {
      setFormData({
        name: "",
        abbreviation: "",
        academic_year: "",
      });
      setErrors({});
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent onKeyDown={handleKeyDown}>
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add New Program" : "Edit Program"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Enter the details for the new program"
              : "Update the program details"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="program-name">
              Program Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="program-name"
              placeholder="e.g., Bachelor of Science in Information Technology"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) {
                  setErrors({ ...errors, name: undefined });
                }
              }}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="abbreviation">
              Abbreviation <span className="text-red-500">*</span>
            </Label>
            <Input
              id="abbreviation"
              placeholder="e.g., BSIT"
              value={formData.abbreviation}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  abbreviation: e.target.value.toUpperCase(),
                });
                if (errors.abbreviation) {
                  setErrors({ ...errors, abbreviation: undefined });
                }
              }}
              disabled={isSubmitting}
              maxLength={20}
            />
            {errors.abbreviation && (
              <p className="text-sm text-destructive">{errors.abbreviation}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="academic-year">
              Academic Year <span className="text-red-500">*</span>
            </Label>
            <Input
              id="academic-year"
              placeholder="e.g., 2025-2026"
              value={formData.academic_year}
              onChange={(e) => {
                setFormData({ ...formData, academic_year: e.target.value });
                if (errors.academic_year) {
                  setErrors({ ...errors, academic_year: undefined });
                }
              }}
              disabled={isSubmitting}
              maxLength={9}
            />
            {errors.academic_year && (
              <p className="text-sm text-destructive">{errors.academic_year}</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === "add" ? "Adding..." : "Updating..."}
              </>
            ) : mode === "add" ? (
              "Add Program"
            ) : (
              "Update Program"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
