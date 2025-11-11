"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Users } from "lucide-react";
import { useAttendanceData } from "@/hooks/useAttendanceData";
import { useTeacherStudentsData } from "@/hooks/useTeacherStudentsData";
import {
  StudentFilters,
  StudentsTable,
  StudentDetailModal,
} from "./students-page-components";
import type { StudentWithAttendance } from "@/hooks/useTeacherStudentsData";

export function StudentsPageContent() {
  const {
    subjects,
    isLoading: isLoadingSubjects,
    error: subjectsError,
  } = useAttendanceData();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("all");
  const [selectedStudent, setSelectedStudent] =
    useState<StudentWithAttendance | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Auto-select first subject on mount
  useState(() => {
    if (subjects.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(subjects[0].id);
    }
  });

  const {
    studentsData,
    isLoading: isLoadingStudents,
    error: studentsError,
    selectedSubject,
    fetchStudentAttendanceHistory,
    hasStudents,
  } = useTeacherStudentsData(selectedSubjectId);

  // Extract unique programs from students
  const programs = useMemo(() => {
    const uniquePrograms = new Set(
      studentsData.map((student) => student.program_name)
    );
    return Array.from(uniquePrograms).sort();
  }, [studentsData]);

  // Filter students based on search and program
  const filteredStudents = useMemo(() => {
    let filtered = studentsData;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(searchLower) ||
          student.student_id.toLowerCase().includes(searchLower)
      );
    }

    // Program filter
    if (selectedProgram !== "all") {
      filtered = filtered.filter(
        (student) => student.program_name === selectedProgram
      );
    }

    return filtered;
  }, [studentsData, searchTerm, selectedProgram]);

  const handleViewDetails = (student: StudentWithAttendance) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  // Loading state
  if (isLoadingSubjects) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Error state
  if (subjectsError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{subjectsError}</AlertDescription>
      </Alert>
    );
  }

  // No subjects state
  if (subjects.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          No subjects assigned. Please contact your administrator.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Subject Selection */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Students</h1>
            <p className="text-sm text-muted-foreground">
              View enrolled students and their attendance
            </p>
          </div>
        </div>

        {/* Subject Selector */}
        <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
          <SelectTrigger className="w-full sm:w-[300px]">
            <SelectValue placeholder="Select subject" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id}>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>
                    {subject.course_code} - {subject.descriptive_title}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Subject Info Card */}
      {selectedSubject && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedSubject.course_code} -{" "}
              {selectedSubject.descriptive_title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground">
              <div>
                <span className="font-medium">Schedules:</span>{" "}
                {selectedSubject.schedules?.join(", ") || "N/A"}
              </div>
              <div>
                <span className="font-medium">Total Students:</span>{" "}
                {studentsData.length}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <StudentFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedProgram={selectedProgram}
            onProgramChange={setSelectedProgram}
            programs={programs}
          />
        </CardContent>
      </Card>

      {/* Students Error */}
      {studentsError && (
        <Alert variant="destructive">
          <AlertDescription>{studentsError}</AlertDescription>
        </Alert>
      )}

      {/* Loading Students */}
      {isLoadingStudents && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Students Enrolled */}
      {!isLoadingStudents && !studentsError && !hasStudents && (
        <Alert>
          <AlertDescription>
            No students enrolled in this subject yet.
          </AlertDescription>
        </Alert>
      )}

      {/* Students Table */}
      {!isLoadingStudents && !studentsError && hasStudents && (
        <Card>
          <CardHeader>
            <CardTitle>Enrolled Students ({filteredStudents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <StudentsTable
              students={filteredStudents}
              onViewDetails={handleViewDetails}
            />
          </CardContent>
        </Card>
      )}

      {/* Student Detail Modal */}
      <StudentDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        student={selectedStudent}
        fetchAttendanceHistory={fetchStudentAttendanceHistory}
      />
    </div>
  );
}
