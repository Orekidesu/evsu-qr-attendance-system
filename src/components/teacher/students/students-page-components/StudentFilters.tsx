"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface StudentFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedProgram: string;
  onProgramChange: (value: string) => void;
  programs: string[];
}

export function StudentFilters({
  searchTerm,
  onSearchChange,
  selectedProgram,
  onProgramChange,
  programs,
}: StudentFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by name or student ID..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Program Filter */}
      <Select value={selectedProgram} onValueChange={onProgramChange}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="Filter by program" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Programs</SelectItem>
          {programs.map((program) => (
            <SelectItem key={program} value={program}>
              {program}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
