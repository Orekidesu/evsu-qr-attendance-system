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
import { Search, Plus } from "lucide-react";
import type { Program } from "@/lib/types/program";

interface StudentsToolbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedProgram: string;
  setSelectedProgram: (program: string) => void;
  programs: Program[];
  onAddClick: () => void;
  studentsCount: number;
  isLoading?: boolean;
}

export function StudentsToolbar({
  searchQuery,
  setSearchQuery,
  selectedProgram,
  setSelectedProgram,
  programs,
  onAddClick,
  studentsCount,
  isLoading = false,
}: StudentsToolbarProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {studentsCount} student{studentsCount !== 1 ? "s" : ""} found
        </div>
        <Button onClick={onAddClick} className="gap-2">
          <Plus className="w-4 h-4" />
          Add New Student
        </Button>
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
