"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  MoreHorizontal,
  Plus,
  Trash2,
  Eye,
  Edit2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import SubjectForm from "@/components/admin/subjects/subject-form";
import SubjectDetailsModal from "@/components/admin/subjects/subject-details-modal";
import DeleteConfirmationModal from "@/components/admin/subjects/delete-confirmation-modal";
import {
  useSubjectsData,
  type SubjectWithDetails,
} from "@/hooks/useSubjectsData";

export function SubjectsPageContent() {
  const {
    subjects,
    programs,
    teachers,
    isLoading,
    error,
    addSubject,
    editSubject,
    removeSubject,
  } = useSubjectsData();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterProgram, setFilterProgram] = useState("all");
  const [filterTeacher, setFilterTeacher] = useState("all");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] =
    useState<SubjectWithDetails | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Validation function to check for conflicts
  const validateSubject = (
    formData: {
      courseCode: string;
      title: string;
      program: string;
      teacher: string;
      schedules: Array<{
        id: string;
        days: string[];
        startTime: string;
        endTime: string;
      }>;
    },
    editingSubjectId?: string
  ): string | null => {
    // Check for duplicate course code
    const duplicateCourseCode = subjects.find(
      (s) =>
        s.course_code.toLowerCase() === formData.courseCode.toLowerCase() &&
        s.id !== editingSubjectId
    );
    if (duplicateCourseCode) {
      return `Course code "${formData.courseCode}" already exists. Please use a different course code.`;
    }

    // Check for teacher schedule conflicts
    const teacherSubjects = subjects.filter(
      (s) => s.teacher_id === formData.teacher && s.id !== editingSubjectId
    );

    for (const schedule of formData.schedules) {
      for (const teacherSubject of teacherSubjects) {
        for (const existingSchedule of teacherSubject.schedules || []) {
          // Check if there's any day overlap
          const dayOverlap = schedule.days.some((day) =>
            existingSchedule.days.includes(day)
          );

          if (dayOverlap) {
            // Check if times overlap
            const newStart = schedule.startTime;
            const newEnd = schedule.endTime;
            const existingStart = existingSchedule.time_start;
            const existingEnd = existingSchedule.time_end;

            const timeOverlap =
              (newStart >= existingStart && newStart < existingEnd) ||
              (newEnd > existingStart && newEnd <= existingEnd) ||
              (newStart <= existingStart && newEnd >= existingEnd);

            if (timeOverlap) {
              const conflictDays = schedule.days.filter((day) =>
                existingSchedule.days.includes(day)
              );
              const teacherName = teachers.find(
                (t) => t.id === formData.teacher
              );
              return `Schedule conflict detected! Teacher ${
                teacherName
                  ? `${teacherName.first_name} ${teacherName.last_name}`
                  : "selected"
              } already has a class on ${conflictDays.join(
                ", "
              )} from ${existingStart} to ${existingEnd} (${teacherSubject.course_code}).`;
            }
          }
        }
      }
    }

    return null;
  };

  // Filter logic with useMemo for performance
  const filteredSubjects = useMemo(() => {
    let filtered = subjects;

    if (searchTerm) {
      filtered = filtered.filter(
        (s) =>
          s.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.descriptive_title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterProgram !== "all") {
      filtered = filtered.filter((s) => s.program_id === filterProgram);
    }

    if (filterTeacher !== "all") {
      filtered = filtered.filter((s) => s.teacher_id === filterTeacher);
    }

    return filtered;
  }, [subjects, searchTerm, filterProgram, filterTeacher]);

  const handleCreate = async (formData: {
    courseCode: string;
    title: string;
    program: string;
    teacher: string;
    schedules: Array<{
      id: string;
      days: string[];
      startTime: string;
      endTime: string;
    }>;
  }) => {
    setActionError(null);

    // Validate before submitting
    const validationError = validateSubject(formData);
    if (validationError) {
      setActionError(validationError);
      return;
    }

    try {
      await addSubject({
        course_code: formData.courseCode,
        descriptive_title: formData.title,
        program_id: formData.program,
        teacher_id: formData.teacher,
        schedules: formData.schedules.map((s) => ({
          days: s.days,
          time_start: s.startTime,
          time_end: s.endTime,
        })),
      });
      setIsCreateOpen(false);
      setActionError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create subject";
      setActionError(errorMessage);
      throw err;
    }
  };

  const handleEdit = async (formData: {
    courseCode: string;
    title: string;
    program: string;
    teacher: string;
    schedules: Array<{
      id: string;
      days: string[];
      startTime: string;
      endTime: string;
    }>;
  }) => {
    if (!selectedSubject) return;
    setActionError(null);

    // Validate before submitting
    const validationError = validateSubject(formData, selectedSubject.id);
    if (validationError) {
      setActionError(validationError);
      return;
    }

    try {
      await editSubject(selectedSubject.id, {
        course_code: formData.courseCode,
        descriptive_title: formData.title,
        program_id: formData.program,
        teacher_id: formData.teacher,
        schedules: formData.schedules.map((s) => ({
          days: s.days,
          time_start: s.startTime,
          time_end: s.endTime,
        })),
      });
      setIsEditOpen(false);
      setSelectedSubject(null);
      setActionError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update subject";
      setActionError(errorMessage);
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!selectedSubject) return;
    setActionError(null);
    try {
      await removeSubject(selectedSubject.id);
      setIsDeleteOpen(false);
      setSelectedSubject(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete subject";
      setActionError(errorMessage);
      throw err;
    }
  };

  const openEdit = (subject: SubjectWithDetails) => {
    setSelectedSubject(subject);
    setIsEditOpen(true);
  };

  const openView = (subject: SubjectWithDetails) => {
    setSelectedSubject(subject);
    setIsViewOpen(true);
  };

  const openDelete = (subject: SubjectWithDetails) => {
    setSelectedSubject(subject);
    setIsDeleteOpen(true);
  };

  // Transform subject data for form/modal compatibility
  const transformSubjectForDisplay = (subject: SubjectWithDetails) => ({
    id: subject.id,
    courseCode: subject.course_code,
    title: subject.descriptive_title,
    program: subject.program_id,
    teacher: subject.teacher_id,
    schedules: (subject.schedules || []).map((s, index) => ({
      id: `schedule-${index}`,
      days: s.days || [],
      startTime: s.time_start || "00:00",
      endTime: s.time_end || "00:00",
    })),
    enrolledStudents: subject.enrolledCount,
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Subjects</h1>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="gap-2"
          disabled={isLoading}
        >
          <Plus className="w-4 h-4" />
          Create New Subject
        </Button>
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

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <Label className="mb-2 block text-sm">
                Search by Code or Title
              </Label>
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="w-full md:w-48">
              <Label className="mb-2 block text-sm">Filter by Program</Label>
              <Select
                value={filterProgram}
                onValueChange={setFilterProgram}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
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

            <div className="w-full md:w-48">
              <Label className="mb-2 block text-sm">Filter by Teacher</Label>
              <Select
                value={filterTeacher}
                onValueChange={setFilterTeacher}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teachers</SelectItem>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.first_name} {teacher.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Subjects Table */}
      {!isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>All Subjects ({filteredSubjects.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredSubjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground mb-2">No subjects found</p>
                <p className="text-sm text-muted-foreground">
                  {searchTerm ||
                  filterProgram !== "all" ||
                  filterTeacher !== "all"
                    ? "Try adjusting your filters"
                    : "Add your first subject to get started"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-2 text-left font-semibold">
                        Course Code
                      </th>
                      <th className="px-4 py-2 text-left font-semibold">
                        Title
                      </th>
                      <th className="px-4 py-2 text-left font-semibold">
                        Program
                      </th>
                      <th className="px-4 py-2 text-left font-semibold">
                        Teacher
                      </th>
                      <th className="px-4 py-2 text-left font-semibold">
                        Schedules
                      </th>
                      <th className="px-4 py-2 text-left font-semibold">
                        Enrolled
                      </th>
                      <th className="px-4 py-2 text-center font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubjects.map((subject) => (
                      <tr
                        key={subject.id}
                        className="border-b hover:bg-muted/50"
                      >
                        <td className="px-4 py-3 font-semibold">
                          {subject.course_code}
                        </td>
                        <td className="px-4 py-3">
                          {subject.descriptive_title}
                        </td>
                        <td className="px-4 py-3">{subject.programName}</td>
                        <td className="px-4 py-3">{subject.teacherName}</td>
                        <td className="px-4 py-3 text-xs">
                          {subject.schedules && subject.schedules.length > 0 ? (
                            subject.schedules.map((s, idx) => (
                              <div key={idx}>
                                {s.days.join("/")} {s.time_start}-{s.time_end}
                              </div>
                            ))
                          ) : (
                            <span className="text-muted-foreground">
                              No schedules
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {subject.enrolledCount}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => openView(subject)}
                                className="gap-2 cursor-pointer"
                              >
                                <Eye className="w-4 h-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openEdit(subject)}
                                className="gap-2 cursor-pointer"
                              >
                                <Edit2 className="w-4 h-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openDelete(subject)}
                                className="gap-2 cursor-pointer text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Subject Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Subject</DialogTitle>
            <DialogDescription>
              Add a new subject to the system
            </DialogDescription>
          </DialogHeader>
          <SubjectForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateOpen(false)}
            programs={programs}
            teachers={teachers}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Subject Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Subject</DialogTitle>
            <DialogDescription>Update subject information</DialogDescription>
          </DialogHeader>
          {selectedSubject && (
            <SubjectForm
              initialData={transformSubjectForDisplay(selectedSubject)}
              onSubmit={handleEdit}
              onCancel={() => setIsEditOpen(false)}
              isEdit
              programs={programs}
              teachers={teachers}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Subject Details Modal */}
      {selectedSubject && (
        <SubjectDetailsModal
          isOpen={isViewOpen}
          onClose={() => setIsViewOpen(false)}
          subject={transformSubjectForDisplay(selectedSubject)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {selectedSubject && (
        <DeleteConfirmationModal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={handleDelete}
          subject={transformSubjectForDisplay(selectedSubject)}
        />
      )}
    </div>
  );
}
