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
}

export function ProgramFormDialog({
  open,
  onOpenChange,
  onSave,
  initialData,
  mode,
}: ProgramFormDialogProps) {
  const [formData, setFormData] = useState<ProgramFormData>({
    name: "",
    abbreviation: "",
    academic_year: "",
  });
  const [isLoading, setIsLoading] = useState(false);
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
    }

    if (!formData.abbreviation.trim()) {
      newErrors.abbreviation = "Abbreviation is required";
    }

    if (!formData.academic_year.trim()) {
      newErrors.academic_year = "Academic year is required";
    } else if (!/^\d{4}-\d{4}$/.test(formData.academic_year)) {
      newErrors.academic_year = "Format should be YYYY-YYYY (e.g., 2025-2026)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await onSave(formData);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving program:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
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
            <Label htmlFor="program-name">Program Name</Label>
            <Input
              id="program-name"
              placeholder="e.g., Bachelor of Science in Information Technology"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="abbreviation">Abbreviation</Label>
            <Input
              id="abbreviation"
              placeholder="e.g., BSIT"
              value={formData.abbreviation}
              onChange={(e) =>
                setFormData({ ...formData, abbreviation: e.target.value })
              }
              disabled={isLoading}
            />
            {errors.abbreviation && (
              <p className="text-sm text-destructive">{errors.abbreviation}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="academic-year">Academic Year</Label>
            <Input
              id="academic-year"
              placeholder="e.g., 2025-2026"
              value={formData.academic_year}
              onChange={(e) =>
                setFormData({ ...formData, academic_year: e.target.value })
              }
              disabled={isLoading}
            />
            {errors.academic_year && (
              <p className="text-sm text-destructive">{errors.academic_year}</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
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
