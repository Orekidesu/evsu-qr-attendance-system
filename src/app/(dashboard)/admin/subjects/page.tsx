"use client";
import { AdminLayout } from "@/components/layouts/AdminLayout";

import { useState } from "react";
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
import { MoreHorizontal, Plus, Trash2, Eye, Edit2 } from "lucide-react";
import SubjectForm from "@/components/admin/subjects/subject-form";
import SubjectDetailsModal from "@/components/admin/subjects/subject-details-modal";
import DeleteConfirmationModal from "@/components/admin/subjects/delete-confirmation-modal";

interface Schedule {
  id: string;
  days: string[];
  startTime: string;
  endTime: string;
}

interface Subject {
  id: string;
  courseCode: string;
  title: string;
  program: string;
  teacher: string;
  schedules: Schedule[];
  enrolledStudents: number;
}

const STATIC_SUBJECTS: Subject[] = [
  {
    id: "1",
    courseCode: "IT101",
    title: "Intro to Programming",
    program: "BS IT",
    teacher: "Dr. Ahmed Khan",
    schedules: [
      { id: "s1", days: ["Mon", "Wed"], startTime: "08:00", endTime: "10:00" },
      { id: "s2", days: ["Tue", "Thu"], startTime: "14:00", endTime: "16:00" },
    ],
    enrolledStudents: 45,
  },
  {
    id: "2",
    courseCode: "IT102",
    title: "Data Structures",
    program: "BS IT",
    teacher: "Prof. Sarah Smith",
    schedules: [
      {
        id: "s3",
        days: ["Mon", "Wed", "Fri"],
        startTime: "10:00",
        endTime: "11:30",
      },
    ],
    enrolledStudents: 38,
  },
  {
    id: "3",
    courseCode: "CS201",
    title: "Database Management",
    program: "BS CS",
    teacher: "Dr. Ahmed Khan",
    schedules: [
      { id: "s4", days: ["Tue", "Thu"], startTime: "09:00", endTime: "11:00" },
    ],
    enrolledStudents: 32,
  },
  {
    id: "4",
    courseCode: "CS202",
    title: "Web Development",
    program: "BS CS",
    teacher: "Mr. John Doe",
    schedules: [
      {
        id: "s5",
        days: ["Mon", "Wed", "Fri"],
        startTime: "13:00",
        endTime: "14:30",
      },
    ],
    enrolledStudents: 50,
  },
  {
    id: "5",
    courseCode: "ENG101",
    title: "English Composition",
    program: "BA English",
    teacher: "Mrs. Emily Johnson",
    schedules: [
      { id: "s6", days: ["Tue", "Thu"], startTime: "10:00", endTime: "12:00" },
    ],
    enrolledStudents: 25,
  },
];

const PROGRAMS = ["BS IT", "BS CS", "BA English", "BS Business", "BA History"];
const TEACHERS = [
  "Dr. Ahmed Khan",
  "Prof. Sarah Smith",
  "Mr. John Doe",
  "Mrs. Emily Johnson",
  "Dr. Lisa Anderson",
];

export default function SubjectPage() {
  const [subjects, setSubjects] = useState<Subject[]>(STATIC_SUBJECTS);
  const [filteredSubjects, setFilteredSubjects] =
    useState<Subject[]>(STATIC_SUBJECTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProgram, setFilterProgram] = useState("all");
  const [filterTeacher, setFilterTeacher] = useState("all");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  // Filter logic
  const applyFilters = (term: string, program: string, teacher: string) => {
    let filtered = subjects;

    if (term) {
      filtered = filtered.filter(
        (s) =>
          s.courseCode.toLowerCase().includes(term.toLowerCase()) ||
          s.title.toLowerCase().includes(term.toLowerCase())
      );
    }

    if (program !== "all") {
      filtered = filtered.filter((s) => s.program === program);
    }

    if (teacher !== "all") {
      filtered = filtered.filter((s) => s.teacher === teacher);
    }

    setFilteredSubjects(filtered);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    applyFilters(value, filterProgram, filterTeacher);
  };

  const handleFilterProgram = (value: string) => {
    setFilterProgram(value);
    applyFilters(searchTerm, value, filterTeacher);
  };

  const handleFilterTeacher = (value: string) => {
    setFilterTeacher(value);
    applyFilters(searchTerm, filterProgram, value);
  };

  const handleCreate = (formData: any) => {
    const newSubject: Subject = {
      id: String(subjects.length + 1),
      courseCode: formData.courseCode,
      title: formData.title,
      program: formData.program,
      teacher: formData.teacher,
      schedules: formData.schedules,
      enrolledStudents: 0,
    };
    const updatedSubjects = [...subjects, newSubject];
    setSubjects(updatedSubjects);
    applyFilters(searchTerm, filterProgram, filterTeacher);
    setIsCreateOpen(false);
  };

  const handleEdit = (formData: any) => {
    if (!selectedSubject) return;
    const updatedSubjects = subjects.map((s) =>
      s.id === selectedSubject.id
        ? {
            ...s,
            courseCode: formData.courseCode,
            title: formData.title,
            program: formData.program,
            teacher: formData.teacher,
            schedules: formData.schedules,
          }
        : s
    );
    setSubjects(updatedSubjects);
    applyFilters(searchTerm, filterProgram, filterTeacher);
    setIsEditOpen(false);
    setSelectedSubject(null);
  };

  const handleDelete = () => {
    if (!selectedSubject) return;
    const updatedSubjects = subjects.filter((s) => s.id !== selectedSubject.id);
    setSubjects(updatedSubjects);
    applyFilters(searchTerm, filterProgram, filterTeacher);
    setIsDeleteOpen(false);
    setSelectedSubject(null);
  };

  const openEdit = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsEditOpen(true);
  };

  const openView = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsViewOpen(true);
  };

  const openDelete = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsDeleteOpen(true);
  };

  return (
    <AdminLayout breadcrumbs={[{ label: "Subjects" }]}>
      <div className="flex flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Subjects</h1>
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Create New Subject
          </Button>
        </div>

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
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>

              <div className="w-full md:w-48">
                <Label className="mb-2 block text-sm">Filter by Program</Label>
                <Select
                  value={filterProgram}
                  onValueChange={handleFilterProgram}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Programs</SelectItem>
                    {PROGRAMS.map((program) => (
                      <SelectItem key={program} value={program}>
                        {program}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full md:w-48">
                <Label className="mb-2 block text-sm">Filter by Teacher</Label>
                <Select
                  value={filterTeacher}
                  onValueChange={handleFilterTeacher}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Teachers</SelectItem>
                    {TEACHERS.map((teacher) => (
                      <SelectItem key={teacher} value={teacher}>
                        {teacher}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subjects Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Subjects ({filteredSubjects.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-2 text-left font-semibold">
                      Course Code
                    </th>
                    <th className="px-4 py-2 text-left font-semibold">Title</th>
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
                  {filteredSubjects.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-muted-foreground"
                      >
                        No subjects found
                      </td>
                    </tr>
                  ) : (
                    filteredSubjects.map((subject) => (
                      <tr
                        key={subject.id}
                        className="border-b hover:bg-muted/50"
                      >
                        <td className="px-4 py-3 font-semibold">
                          {subject.courseCode}
                        </td>
                        <td className="px-4 py-3">{subject.title}</td>
                        <td className="px-4 py-3">{subject.program}</td>
                        <td className="px-4 py-3">{subject.teacher}</td>
                        <td className="px-4 py-3 text-xs">
                          {subject.schedules.map((s) => (
                            <div key={s.id}>
                              {s.days.join("/")} {s.startTime}-{s.endTime}
                            </div>
                          ))}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {subject.enrolledStudents}
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

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
                initialData={selectedSubject}
                onSubmit={handleEdit}
                onCancel={() => setIsEditOpen(false)}
                isEdit
              />
            )}
          </DialogContent>
        </Dialog>

        {/* View Subject Details Modal */}
        {selectedSubject && (
          <SubjectDetailsModal
            isOpen={isViewOpen}
            onClose={() => setIsViewOpen(false)}
            subject={selectedSubject}
          />
        )}

        {/* Delete Confirmation Modal */}
        {selectedSubject && (
          <DeleteConfirmationModal
            isOpen={isDeleteOpen}
            onClose={() => setIsDeleteOpen(false)}
            onConfirm={handleDelete}
            subject={selectedSubject}
          />
        )}
      </div>
    </AdminLayout>
  );
}
