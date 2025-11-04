"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Upload, Download, FileArchive } from "lucide-react";
import type { Program } from "@/lib/types/program";
import type { StudentWithDetails } from "@/hooks/useStudentsData";

interface StudentsToolbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedProgram: string;
  setSelectedProgram: (program: string) => void;
  programs: Program[];
  students: StudentWithDetails[];
  onAddClick: () => void;
  onBulkImportClick?: () => void;
  onBulkQRDownload?: () => void;
  studentsCount: number;
  isLoading?: boolean;
}

export function StudentsToolbar({
  searchQuery,
  setSearchQuery,
  selectedProgram,
  setSelectedProgram,
  programs,
  students,
  onAddClick,
  onBulkImportClick,
  onBulkQRDownload,
  studentsCount,
  isLoading = false,
}: StudentsToolbarProps) {
  const handleDownloadTemplate = () => {
    // Create CSV content
    const csvContent = [
      // Header row
      "student_id,first_name,last_name,email",
      // Example rows
      "2025-001,Juan,Dela Cruz,juan.delacruz@example.com",
      "2025-002,Maria,Santos,maria.santos@example.com",
      "2025-003,Pedro,Reyes,pedro.reyes@example.com",
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "student_import_template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {studentsCount} student{studentsCount !== 1 ? "s" : ""} found
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleDownloadTemplate}
            className="gap-2"
            title="Download CSV template for bulk import"
          >
            <Download className="w-4 h-4" />
            Template
          </Button>
          {onBulkImportClick && (
            <Button
              variant="outline"
              onClick={onBulkImportClick}
              className="gap-2"
              title="Import multiple students from CSV"
            >
              <Upload className="w-4 h-4" />
              Bulk Import
            </Button>
          )}
          {onBulkQRDownload && studentsCount > 0 && (
            <Button
              variant="outline"
              onClick={onBulkQRDownload}
              className="gap-2"
              title={`Download QR codes for ${selectedProgram === "all" ? "all students" : "selected program"}`}
            >
              <FileArchive className="w-4 h-4" />
              Bulk QR
            </Button>
          )}
          <Button onClick={onAddClick} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Student
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select
          value={selectedProgram}
          onValueChange={setSelectedProgram}
          disabled={isLoading}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by program" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Programs</SelectItem>
            {programs.map((program) => (
              <SelectItem key={program.id} value={program.id}>
                {program.abbreviation}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
