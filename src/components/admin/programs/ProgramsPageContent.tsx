"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Plus, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProgramsTable } from "@/components/admin/programs/ProgramsTable";
import { ProgramFormDialog } from "@/components/admin/programs/ProgramFormDialog";
import { DeleteProgramDialog } from "@/components/admin/programs/DeleteProgramDialog";
import {
  useProgramsData,
  type ProgramWithCounts,
} from "@/hooks/useProgramsData";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

export function ProgramsPageContent() {
  const { programs, isLoading, error, addProgram, editProgram, removeProgram } =
    useProgramsData();

  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] =
    useState<ProgramWithCounts | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Show error toast when data loading fails
  useEffect(() => {
    if (error) {
      toast.error("Failed to Load Data", {
        description: error.includes("authentication")
          ? "Please make sure you are logged in and try refreshing the page."
          : error,
      });
    }
  }, [error]);

  // Keyboard shortcut: Ctrl/Cmd + K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("program-search")?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredPrograms = useMemo(() => {
    return programs.filter((program) =>
      program.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [programs, searchQuery]);

  // Check for duplicate program
  const isDuplicateProgram = (
    abbreviation: string,
    academicYear: string,
    excludeProgramId?: string
  ): boolean => {
    return programs.some(
      (program) =>
        program.abbreviation.toLowerCase() === abbreviation.toLowerCase() &&
        program.academic_year === academicYear &&
        program.id !== excludeProgramId
    );
  };

  const handleAddProgram = () => {
    setSelectedProgram(null);
    setIsAddModalOpen(true);
  };

  const handleEditProgram = (program: ProgramWithCounts) => {
    setSelectedProgram(program);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (program: ProgramWithCounts) => {
    setSelectedProgram(program);
    setIsDeleteModalOpen(true);
  };

  const handleSaveProgram = async (data: {
    name: string;
    abbreviation: string;
    academic_year: string;
  }) => {
    // Check for duplicates
    if (
      isDuplicateProgram(
        data.abbreviation,
        data.academic_year,
        selectedProgram?.id
      )
    ) {
      toast.error("Duplicate Program", {
        description: `A program with abbreviation "${data.abbreviation}" already exists for academic year ${data.academic_year}.`,
      });
      throw new Error(
        `Program ${data.abbreviation} already exists for ${data.academic_year}`
      );
    }

    setIsSubmitting(true);
    try {
      if (selectedProgram) {
        await editProgram(selectedProgram.id, data);
        toast.success("Program Updated", {
          description: `${data.name} has been successfully updated.`,
        });
      } else {
        await addProgram(data);
        toast.success("Program Added", {
          description: `${data.name} has been successfully created.`,
        });
      }
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save program";
      if (!errorMessage.includes("already exists")) {
        toast.error("Error", {
          description: errorMessage,
        });
      }
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedProgram) return;

    setIsDeleting(true);
    try {
      const programName = selectedProgram.name;
      await removeProgram(selectedProgram.id);
      setIsDeleteModalOpen(false);
      toast.success("Program Deleted", {
        description: `${programName} has been successfully deleted.`,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete program";
      toast.error("Error", {
        description: errorMessage,
      });
      throw err;
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex-1 space-y-8 p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Programs</h1>
        <p className="text-muted-foreground">Manage all academic programs</p>
      </div>

      {/* Search and Add Button */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="program-search"
            placeholder="Search by program name... (Ctrl+K)"
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <Button
          onClick={handleAddProgram}
          className="gap-2"
          disabled={isLoading}
        >
          <Plus className="h-4 w-4" />
          Add New Program
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Programs Table */}
      {!isLoading && (
        <ProgramsTable
          programs={filteredPrograms}
          onEdit={handleEditProgram}
          onDelete={handleDeleteClick}
        />
      )}

      {/* Add/Edit Program Modal */}
      <ProgramFormDialog
        open={isAddModalOpen || isEditModalOpen}
        onOpenChange={(open) => {
          if (!open && !isSubmitting) {
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
            setSelectedProgram(null);
          }
        }}
        onSave={handleSaveProgram}
        initialData={
          selectedProgram
            ? {
                name: selectedProgram.name,
                abbreviation: selectedProgram.abbreviation,
                academic_year: selectedProgram.academic_year,
              }
            : undefined
        }
        mode={isEditModalOpen ? "edit" : "add"}
        isSubmitting={isSubmitting}
        existingPrograms={programs}
        currentProgramId={selectedProgram?.id}
      />

      {/* Delete Confirmation Modal */}
      {selectedProgram && (
        <DeleteProgramDialog
          open={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
          onConfirm={handleConfirmDelete}
          programName={selectedProgram.name}
          subjectsCount={selectedProgram.subjectsCount}
          studentsCount={selectedProgram.studentsCount}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}
