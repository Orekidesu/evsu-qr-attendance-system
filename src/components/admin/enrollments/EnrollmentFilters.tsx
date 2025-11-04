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
import type { Student, Subject, Program } from "@/lib/types";

interface EnrollmentFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filterStudent: string;
  onFilterStudentChange: (value: string) => void;
  filterSubject: string;
  onFilterSubjectChange: (value: string) => void;
  filterProgram: string;
  onFilterProgramChange: (value: string) => void;
  students: Student[];
  subjects: Subject[];
  programs: Program[];
  onEnrollClick: () => void;
  canEnroll: boolean;
}

export function EnrollmentFilters({
  searchQuery,
  onSearchChange,
  filterStudent,
  onFilterStudentChange,
  filterSubject,
  onFilterSubjectChange,
  filterProgram,
  onFilterProgramChange,
  students,
  subjects,
  programs,
  onEnrollClick,
  canEnroll,
}: EnrollmentFiltersProps) {
  const hasActiveFilters =
    filterStudent !== "all" ||
    filterSubject !== "all" ||
    filterProgram !== "all" ||
    searchQuery;

  const clearFilters = () => {
    onFilterStudentChange("all");
    onFilterSubjectChange("all");
    onFilterProgramChange("all");
    onSearchChange("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by student or subject..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <Button onClick={onEnrollClick} className="gap-2" disabled={!canEnroll}>
          <Plus className="h-4 w-4" />
          Enroll Student
        </Button>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-4">
        <Select value={filterStudent} onValueChange={onFilterStudentChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by student..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Students</SelectItem>
            {students.map((student) => (
              <SelectItem key={student.id} value={student.id}>
                {student.first_name} {student.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterSubject} onValueChange={onFilterSubjectChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by subject..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id}>
                {subject.course_code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterProgram} onValueChange={onFilterProgramChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by program..." />
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

        {hasActiveFilters && (
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}
