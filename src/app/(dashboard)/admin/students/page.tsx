"use client";
import { AdminLayout } from "@/components/layouts/AdminLayout";

import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { StudentsToolbar } from "@/components/admin/students/students-toolbar";
import { StudentsTable } from "@/components/admin/students/students-table";
import { AddStudentModal } from "@/components/admin/students/add-student-modal";
import { EditStudentModal } from "@/components/admin/students/edit-student-modal";
import { ViewStudentModal } from "@/components/admin/students/view-student-modal";
import { DeleteStudentModal } from "@/components/admin/students/delete-student-modal";
import { QrCodeModal } from "@/components/admin/students/qr-code-modal";
import {
  useStudentsData,
  type StudentWithDetails,
} from "@/hooks/useStudentsData";
import type { CreateStudentInput } from "@/lib/types/student";

export default function StudentPage() {
  const {
    students,
    programs,
    isLoading,
    error,
    addStudent,
    editStudent,
    removeStudent,
    regenerateQRCode,
  } = useStudentsData();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("all");
  const [sortBy, setSortBy] = useState<"student_id" | "name" | "program">(
    "student_id"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] =
    useState<StudentWithDetails | null>(null);

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

  // Filter and sort logic with useMemo
  const filteredAndSortedStudents = useMemo(() => {
    const filtered = students.filter((student) => {
      const matchesSearch =
        student.student_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${student.first_name} ${student.last_name}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ??
          false);

      const matchesProgram =
        selectedProgram === "all" || student.program_id === selectedProgram;

      return matchesSearch && matchesProgram;
    });

    // Sort logic
    const sorted = [...filtered].sort((a, b) => {
      let aValue: string;
      let bValue: string;

      if (sortBy === "name") {
        aValue = `${a.first_name} ${a.last_name}`;
        bValue = `${b.first_name} ${b.last_name}`;
      } else if (sortBy === "program") {
        aValue = a.programName;
        bValue = b.programName;
      } else {
        aValue = a.student_id;
        bValue = b.student_id;
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : 1;
      } else {
        return aValue > bValue ? -1 : 1;
      }
    });

    return sorted;
  }, [students, searchQuery, selectedProgram, sortBy, sortOrder]);

  const handleAddStudent = async (newStudent: CreateStudentInput) => {
    setIsSubmitting(true);
    try {
      await addStudent(newStudent);
      setAddModalOpen(false);
      toast.success("Student Created", {
        description: `${newStudent.student_id} has been successfully created.`,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create student";
      toast.error("Error", {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditStudent = async (
    updatedStudent: Partial<CreateStudentInput> & { id: string }
  ) => {
    if (!selectedStudent) return;
    setIsSubmitting(true);
    try {
      const { id, ...updateData } = updatedStudent;
      await editStudent(id, updateData);
      setEditModalOpen(false);
      setSelectedStudent(null);
      toast.success("Student Updated", {
        description: `Student has been successfully updated.`,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update student";
      toast.error("Error", {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!selectedStudent) return;
    setIsDeleting(true);
    try {
      const studentId = selectedStudent.student_id;
      await removeStudent(selectedStudent.id);
      setDeleteModalOpen(false);
      setSelectedStudent(null);
      toast.success("Student Deleted", {
        description: `${studentId} has been successfully deleted.`,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete student";
      toast.error("Error", {
        description: errorMessage,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewQrCode = (student: StudentWithDetails) => {
    setSelectedStudent(student);
    setQrModalOpen(true);
  };

  const handleEditClick = (student: StudentWithDetails) => {
    setSelectedStudent(student);
    setEditModalOpen(true);
  };

  const handleViewClick = (student: StudentWithDetails) => {
    setSelectedStudent(student);
    setViewModalOpen(true);
  };

  const handleDeleteClick = (student: StudentWithDetails) => {
    setSelectedStudent(student);
    setDeleteModalOpen(true);
  };

  const handleRegenerateQR = async (
    studentId: string,
    firebaseDocId: string
  ) => {
    try {
      await regenerateQRCode(studentId, firebaseDocId);
      toast.success("QR Code Regenerated", {
        description: `New QR code has been generated for ${studentId}.`,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to regenerate QR code";
      toast.error("Error", {
        description: errorMessage,
      });
      throw err; // Re-throw to let the modal handle loading state
    }
  };

  return (
    <AdminLayout breadcrumbs={[{ label: "Students" }]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Students</h1>
          <p className="text-muted-foreground">
            Manage student information, QR codes, and enrollments
          </p>
        </div>

        <StudentsToolbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedProgram={selectedProgram}
          setSelectedProgram={setSelectedProgram}
          programs={programs}
          onAddClick={() => setAddModalOpen(true)}
          studentsCount={filteredAndSortedStudents.length}
          isLoading={isLoading}
        />

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <StudentsTable
            students={filteredAndSortedStudents}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            onViewQr={handleViewQrCode}
            onEdit={handleEditClick}
            onView={handleViewClick}
            onDelete={handleDeleteClick}
          />
        )}

        <AddStudentModal
          open={addModalOpen}
          onOpenChange={(open) => {
            if (!open && !isSubmitting) {
              setAddModalOpen(false);
            }
          }}
          onSubmit={handleAddStudent}
          programs={programs}
          isSubmitting={isSubmitting}
        />

        {selectedStudent && (
          <>
            <EditStudentModal
              open={editModalOpen}
              onOpenChange={(open) => {
                if (!open && !isSubmitting) {
                  setEditModalOpen(false);
                  setSelectedStudent(null);
                }
              }}
              student={selectedStudent}
              onSubmit={handleEditStudent}
              programs={programs}
              isSubmitting={isSubmitting}
            />

            <ViewStudentModal
              open={viewModalOpen}
              onOpenChange={setViewModalOpen}
              student={selectedStudent}
              onRegenerateQR={handleRegenerateQR}
            />

            <DeleteStudentModal
              open={deleteModalOpen}
              onOpenChange={(open) => {
                if (!open && !isDeleting) {
                  setDeleteModalOpen(false);
                  setSelectedStudent(null);
                }
              }}
              student={selectedStudent}
              onConfirm={handleDeleteStudent}
              isDeleting={isDeleting}
            />

            <QrCodeModal
              open={qrModalOpen}
              onOpenChange={setQrModalOpen}
              student={selectedStudent}
              onRegenerateQR={handleRegenerateQR}
            />
          </>
        )}
      </div>
    </AdminLayout>
  );
}
