"use client";

import { useState, useMemo } from "react";
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
import { AdminLayout } from "@/components/layouts/AdminLayout";

export function ProgramsPageContent() {
  const { programs, isLoading, error, addProgram, editProgram, removeProgram } =
    useProgramsData();

  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] =
    useState<ProgramWithCounts | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const filteredPrograms = useMemo(() => {
    return programs.filter((program) =>
      program.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [programs, searchQuery]);

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
    setActionError(null);
    try {
      if (selectedProgram) {
        await editProgram(selectedProgram.id, data);
      } else {
        await addProgram(data);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save program";
      setActionError(errorMessage);
      throw err; // Re-throw to let the dialog handle loading state
    }
  };

  const handleConfirmDelete = async () => {
    setActionError(null);
    try {
      if (selectedProgram) {
        await removeProgram(selectedProgram.id);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete program";
      setActionError(errorMessage);
      throw err; // Re-throw to let the dialog handle loading state
    }
  };

  return (
    <AdminLayout breadcrumbs={[{ label: "Programs" }]}>
      <div className="flex-1 space-y-8 p-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Programs</h1>
          <p className="text-muted-foreground">Manage all academic programs</p>
        </div>

        {/* Error Alert */}
        {(error || actionError) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error || actionError}
              {error && error.includes("authentication") && (
                <div className="mt-2">
                  <p className="text-sm">
                    Please make sure you are logged in and try refreshing the
                    page.
                  </p>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Search and Add Button */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by program name..."
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
            if (!open) {
              setIsAddModalOpen(false);
              setIsEditModalOpen(false);
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
          />
        )}
      </div>
    </AdminLayout>
  );
}
