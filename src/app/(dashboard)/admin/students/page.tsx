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
import { BulkImportModal } from "@/components/admin/students/bulk-import-modal";
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
  const [bulkImportModalOpen, setBulkImportModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] =
    useState<StudentWithDetails | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
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

  const handleBulkQRDownload = async () => {
    try {
      // Filter students based on selected program
      const studentsToDownload =
        selectedProgram === "all"
          ? filteredAndSortedStudents
          : filteredAndSortedStudents.filter(
              (s) => s.program_id === selectedProgram
            );

      if (studentsToDownload.length === 0) {
        toast.error("No Students Found", {
          description: "No students to download QR codes for.",
        });
        return;
      }

      // Get program name for filename
      const programName =
        selectedProgram === "all"
          ? "All_Programs"
          : programs.find((p) => p.id === selectedProgram)?.abbreviation ||
            "Unknown";

      const date = new Date().toISOString().split("T")[0];

      toast.info("Preparing QR Codes", {
        description: `Generating ${studentsToDownload.length} QR codes. This may take a moment...`,
      });

      // Create a container for all QR codes (hidden)
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.left = "-9999px";
      document.body.appendChild(container);

      // Generate all QR codes as data URLs
      const QRCode = (await import("qrcode")).default;
      const qrPromises = studentsToDownload.map(async (student) => {
        return new Promise<{ student: typeof student; dataUrl: string }>(
          (resolve) => {
            QRCode.toDataURL(
              student.qr_code,
              {
                errorCorrectionLevel: "H",
                margin: 2,
                width: 250,
              },
              (err: Error | null | undefined, url: string) => {
                if (err) {
                  console.error(
                    `Error generating QR for ${student.student_id}:`,
                    err
                  );
                  resolve({ student, dataUrl: "" });
                } else {
                  resolve({ student, dataUrl: url });
                }
              }
            );
          }
        );
      });

      const qrData = await Promise.all(qrPromises);
      document.body.removeChild(container);

      // Download using JSZip
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const folder = zip.folder(`EVSU_QR_Codes_${programName}_${date}`);

      if (!folder) {
        throw new Error("Failed to create zip folder");
      }

      // Add each QR code to zip
      qrData.forEach(({ student, dataUrl }) => {
        if (dataUrl) {
          const sanitizedName =
            `${student.first_name}_${student.last_name}`.replace(
              /[^a-zA-Z0-9_]/g,
              "_"
            );
          const filename = `EVSU_QR_${student.student_id}_${sanitizedName}.png`;

          // Convert data URL to blob
          const base64Data = dataUrl.split(",")[1];
          folder.file(filename, base64Data, { base64: true });
        }
      });

      // Generate and download zip
      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = `EVSU_QR_Codes_${programName}_${date}.zip`;
      link.click();
      URL.revokeObjectURL(link.href);

      toast.success("QR Codes Downloaded", {
        description: `Successfully downloaded ${studentsToDownload.length} QR codes.`,
      });
    } catch (err) {
      console.error("Bulk QR download error:", err);
      toast.error("Download Failed", {
        description:
          err instanceof Error ? err.message : "Failed to download QR codes",
      });
    }
  };

  const handleBulkImport = async (file: File, programId: string) => {
    setIsImporting(true);
    try {
      // Parse CSV file with proper handling of quoted values
      const text = await file.text();
      const lines = text.trim().split("\n");

      // Parse CSV properly handling quoted values
      const parseCSVLine = (line: string): string[] => {
        const result: string[] = [];
        let current = "";
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
          const char = line[i];

          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === "," && !inQuotes) {
            result.push(current.trim());
            current = "";
          } else {
            current += char;
          }
        }
        result.push(current.trim());
        return result;
      };

      const headers = parseCSVLine(lines[0]);
      console.log("CSV Headers:", headers);

      // Parse students
      const students = lines
        .slice(1)
        .filter((line: string) => line.trim() !== "") // Skip empty lines
        .map((line: string) => {
          const values = parseCSVLine(line);
          const student: Record<string, string> = {};
          headers.forEach((header, index) => {
            student[header] = values[index] || "";
          });
          return student;
        });

      console.log("Parsed students:", students);
      console.log("Program ID:", programId);

      // Send to API
      const response = await fetch("/api/students/bulk-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          students: students,
          program_id: programId,
        }),
      });

      const result = await response.json();
      console.log("API Response:", result);

      if (!response.ok) {
        throw new Error(result.error || "Failed to import students");
      }

      if (result.failed > 0) {
        toast.warning("Import Completed with Errors", {
          description: `Imported: ${result.imported} students. Failed: ${result.failed} students. Check console for details.`,
        });
        console.error("Bulk import errors:", result.errors);
      } else {
        toast.success("Bulk Import Successful!", {
          description: `Successfully imported ${result.imported} student(s).`,
        });
      }

      setBulkImportModalOpen(false);
      // Refresh the list after import
      window.location.reload(); // Simple refresh for now
    } catch (err: unknown) {
      console.error("Bulk import error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to import students";
      toast.error("Import Failed", {
        description: errorMessage,
      });
    } finally {
      setIsImporting(false);
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
          students={filteredAndSortedStudents}
          onAddClick={() => setAddModalOpen(true)}
          onBulkImportClick={() => setBulkImportModalOpen(true)}
          onBulkQRDownload={handleBulkQRDownload}
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

        <BulkImportModal
          open={bulkImportModalOpen}
          onOpenChange={setBulkImportModalOpen}
          programs={programs}
          onImport={handleBulkImport}
          isImporting={isImporting}
        />
      </div>
    </AdminLayout>
  );
}
