"use client";

import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  useEnrollmentsData,
  type EnrollmentWithDetails,
} from "@/hooks/useEnrollmentsData";
import {
  validateBulkEnrollment,
  getValidationSummary,
} from "@/lib/utils/enrollmentValidation";
import { EnrollmentFilters } from "./EnrollmentFilters";
import { EnrollmentsTable } from "./EnrollmentsTable";
import { BulkEnrollmentTab } from "./BulkEnrollmentTab";
import { EnrollmentFormDialog } from "./EnrollmentFormDialog";
import { DeleteEnrollmentDialog } from "./DeleteEnrollmentDialog";
import { ValidationErrorsDialog } from "./ValidationErrorsDialog";

export function EnrollmentsPageContent() {
  const {
    enrollments,
    students,
    subjects,
    programs,
    isLoading,
    error,
    enrollStudent,
    enrollMultipleStudents,
    removeEnrollment,
  } = useEnrollmentsData();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStudent, setFilterStudent] = useState("all");
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterProgram, setFilterProgram] = useState("all");
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] =
    useState<EnrollmentWithDetails | null>(null);
  const [enrollFormData, setEnrollFormData] = useState({
    studentId: "",
    subjectId: "",
  });
  const [enrollBySubjectData, setEnrollBySubjectData] = useState<{
    [key: string]: boolean;
  }>({});
  const [selectedSubjectForBulk, setSelectedSubjectForBulk] = useState("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidationDialogOpen, setIsValidationDialogOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Array<{ studentId: string; studentName: string; errors: string[] }>
  >([]);
  const [validationSummary, setValidationSummary] = useState<{
    totalStudents: number;
    validCount: number;
    invalidCount: number;
  }>({ totalStudents: 0, validCount: 0, invalidCount: 0 });

  // Apply filters
  const filteredEnrollments = useMemo(() => {
    return enrollments.filter((enrollment) => {
      const matchesSearch =
        enrollment.studentName
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        enrollment.subjectTitle
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        enrollment.subjectCode
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        enrollment.studentNumber
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesStudent =
        filterStudent === "all" || enrollment.student_id === filterStudent;
      const matchesSubject =
        filterSubject === "all" || enrollment.subject_id === filterSubject;
      const matchesProgram =
        filterProgram === "all" || enrollment.program_id === filterProgram;

      return (
        matchesSearch && matchesStudent && matchesSubject && matchesProgram
      );
    });
  }, [enrollments, searchQuery, filterStudent, filterSubject, filterProgram]);

  // Get selected student and filter subjects by program
  const selectedStudent = useMemo(
    () => students.find((s) => s.id === enrollFormData.studentId),
    [students, enrollFormData.studentId]
  );

  const availableSubjects = useMemo(() => {
    if (!selectedStudent) return [];
    return subjects.filter((s) => s.program_id === selectedStudent.program_id);
  }, [subjects, selectedStudent]);

  // Get students in selected program for bulk enrollment
  const studentsInSelectedProgram = useMemo(() => {
    if (selectedSubjectForBulk === "all") return [];
    const subject = subjects.find((s) => s.id === selectedSubjectForBulk);
    if (!subject) return [];
    return students.filter((s) => s.program_id === subject.program_id);
  }, [students, subjects, selectedSubjectForBulk]);

  const handleEnrollClick = () => {
    setEnrollFormData({ studentId: "", subjectId: "" });
    setIsEnrollModalOpen(true);
  };

  const handleDeleteClick = (enrollment: EnrollmentWithDetails) => {
    setSelectedEnrollment(enrollment);
    setIsDeleteModalOpen(true);
  };

  const handleSaveEnrollment = async () => {
    if (!enrollFormData.studentId || !enrollFormData.subjectId) {
      toast.error("Missing Information", {
        description: "Please select both a student and a subject.",
      });
      return;
    }

    const student = students.find((s) => s.id === enrollFormData.studentId);
    const subject = subjects.find((s) => s.id === enrollFormData.subjectId);

    if (!student || !subject) {
      toast.error("Invalid Selection", {
        description: "The selected student or subject could not be found.",
      });
      return;
    }

    // Extra validation: ensure subject belongs to student's program
    if (student.program_id !== subject.program_id) {
      toast.error("Program Mismatch", {
        description:
          "The selected subject does not belong to the student's program.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await enrollStudent({
        student_id: enrollFormData.studentId,
        subject_id: enrollFormData.subjectId,
        program_id: student.program_id,
      });
      setIsEnrollModalOpen(false);
      setEnrollFormData({ studentId: "", subjectId: "" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedEnrollment) return;

    setIsSubmitting(true);
    try {
      await removeEnrollment(selectedEnrollment.id);
      setIsDeleteModalOpen(false);
      setSelectedEnrollment(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkEnroll = async () => {
    if (selectedSubjectForBulk === "all") {
      toast.error("No Subject Selected", {
        description: "Please select a subject first.",
      });
      return;
    }

    const subject = subjects.find((s) => s.id === selectedSubjectForBulk);
    if (!subject) {
      toast.error("Invalid Subject", {
        description: "The selected subject could not be found.",
      });
      return;
    }

    const studentsToEnroll = studentsInSelectedProgram.filter(
      (student) => enrollBySubjectData[student.id]
    );

    if (studentsToEnroll.length === 0) {
      toast.error("No Students Selected", {
        description: "Please select at least one student to enroll.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const enrollmentInputs = studentsToEnroll.map((student) => ({
        student_id: student.id,
        subject_id: selectedSubjectForBulk,
        program_id: subject.program_id,
      }));

      await enrollMultipleStudents(enrollmentInputs);
      setEnrollBySubjectData({});
      // Don't reset subject selection to allow for multiple batch operations
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectAllStudents = () => {
    const newState: { [key: string]: boolean } = {};
    studentsInSelectedProgram.forEach((student) => {
      const isAlreadyEnrolled = enrollments.some(
        (e) =>
          e.student_id === student.id && e.subject_id === selectedSubjectForBulk
      );
      if (!isAlreadyEnrolled) {
        newState[student.id] = true;
      }
    });
    setEnrollBySubjectData(newState);
  };

  const handleDeselectAllStudents = () => {
    setEnrollBySubjectData({});
  };

  const handleValidateBeforeEnroll = () => {
    if (selectedSubjectForBulk === "all") {
      toast.error("No Subject Selected", {
        description: "Please select a subject first.",
      });
      return;
    }

    const subject = subjects.find((s) => s.id === selectedSubjectForBulk);
    if (!subject) {
      toast.error("Invalid Subject", {
        description: "The selected subject could not be found.",
      });
      return;
    }

    const studentsToValidate = studentsInSelectedProgram.filter(
      (student) => enrollBySubjectData[student.id]
    );

    if (studentsToValidate.length === 0) {
      toast.error("No Students Selected", {
        description: "Please select at least one student to validate.",
      });
      return;
    }

    // Run validation
    const validationResults = validateBulkEnrollment(
      studentsToValidate,
      subject,
      enrollments,
      subjects,
      { maxUnitsPerStudent: 30 } // Configurable limit
    );

    const summary = getValidationSummary(validationResults);

    // Collect validation errors
    const errors: Array<{
      studentId: string;
      studentName: string;
      errors: string[];
    }> = [];
    validationResults.forEach((result, studentId) => {
      if (!result.isValid) {
        const student = students.find((s) => s.id === studentId);
        if (student) {
          errors.push({
            studentId,
            studentName: `${student.first_name} ${student.last_name}`,
            errors: result.errors.map((e) => e.details || e.message),
          });
        }
      }
    });

    setValidationErrors(errors);
    setValidationSummary({
      totalStudents: summary.totalStudents,
      validCount: summary.validCount,
      invalidCount: summary.invalidCount,
    });
    setIsValidationDialogOpen(true);
  };

  const handleProceedAfterValidation = async () => {
    setIsValidationDialogOpen(false);

    // Only enroll valid students
    const subject = subjects.find((s) => s.id === selectedSubjectForBulk);
    if (!subject) return;

    const validStudentIds = new Set(
      studentsInSelectedProgram
        .filter((student) => enrollBySubjectData[student.id])
        .filter((student) => {
          const validation = validateBulkEnrollment(
            [student],
            subject,
            enrollments,
            subjects,
            { maxUnitsPerStudent: 30 }
          );
          const result = validation.get(student.id);
          return result?.isValid;
        })
        .map((s) => s.id)
    );

    setIsSubmitting(true);
    try {
      const enrollmentInputs = Array.from(validStudentIds).map((studentId) => ({
        student_id: studentId,
        subject_id: selectedSubjectForBulk,
        program_id: subject.program_id,
      }));

      await enrollMultipleStudents(enrollmentInputs, {
        validateBeforeEnroll: false, // Already validated
      });
      setEnrollBySubjectData({});
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (timestamp: unknown) => {
    if (!timestamp) return "N/A";
    try {
      // Handle Firestore Timestamp
      if (timestamp && typeof timestamp === "object" && "toDate" in timestamp) {
        return (timestamp as { toDate: () => Date })
          .toDate()
          .toLocaleDateString();
      }
      // Handle Date object
      if (timestamp instanceof Date) {
        return timestamp.toLocaleDateString();
      }
      return "N/A";
    } catch {
      return "N/A";
    }
  };

  if (error) {
    return (
      <div className="flex-1 space-y-8 p-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enrollments</h1>
          <p className="text-muted-foreground">
            Manage student enrollments across programs and subjects
          </p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Enrollments</h1>
        <p className="text-muted-foreground">
          Manage student enrollments across programs and subjects
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs defaultValue="enrollments" className="w-full">
          <TabsList>
            <TabsTrigger value="enrollments">View Enrollments</TabsTrigger>
            <TabsTrigger value="by-subject">Enroll by Subject</TabsTrigger>
          </TabsList>

          {/* View Enrollments Tab */}
          <TabsContent value="enrollments" className="space-y-6">
            <EnrollmentFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filterStudent={filterStudent}
              onFilterStudentChange={setFilterStudent}
              filterSubject={filterSubject}
              onFilterSubjectChange={setFilterSubject}
              filterProgram={filterProgram}
              onFilterProgramChange={setFilterProgram}
              students={students}
              subjects={subjects}
              programs={programs}
              onEnrollClick={handleEnrollClick}
              canEnroll={students.length > 0 && subjects.length > 0}
            />

            <EnrollmentsTable
              enrollments={enrollments}
              filteredEnrollments={filteredEnrollments}
              onDeleteClick={handleDeleteClick}
              onEnrollClick={handleEnrollClick}
              canEnroll={students.length > 0 && subjects.length > 0}
              formatDate={formatDate}
            />
          </TabsContent>

          {/* Enroll by Subject Tab */}
          <TabsContent value="by-subject" className="space-y-6">
            <BulkEnrollmentTab
              subjects={subjects}
              programs={programs}
              enrollments={enrollments}
              selectedSubjectForBulk={selectedSubjectForBulk}
              onSelectedSubjectChange={setSelectedSubjectForBulk}
              studentsInSelectedProgram={studentsInSelectedProgram}
              enrollBySubjectData={enrollBySubjectData}
              onEnrollDataChange={setEnrollBySubjectData}
              onSelectAll={handleSelectAllStudents}
              onDeselectAll={handleDeselectAllStudents}
              onValidate={handleValidateBeforeEnroll}
              onBulkEnroll={handleBulkEnroll}
              isSubmitting={isSubmitting}
            />
          </TabsContent>
        </Tabs>
      )}

      {/* Enroll Student Modal */}
      <EnrollmentFormDialog
        open={isEnrollModalOpen}
        onOpenChange={setIsEnrollModalOpen}
        enrollFormData={enrollFormData}
        onFormDataChange={setEnrollFormData}
        students={students}
        programs={programs}
        availableSubjects={availableSubjects}
        onSave={handleSaveEnrollment}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <DeleteEnrollmentDialog
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        enrollment={selectedEnrollment}
        onConfirm={handleConfirmDelete}
        isSubmitting={isSubmitting}
      />

      {/* Validation Errors Dialog */}
      <ValidationErrorsDialog
        open={isValidationDialogOpen}
        onOpenChange={setIsValidationDialogOpen}
        validationErrors={validationErrors}
        totalStudents={validationSummary.totalStudents}
        validStudents={validationSummary.validCount}
        onProceed={handleProceedAfterValidation}
        showProceedButton={validationSummary.validCount > 0}
      />
    </div>
  );
}
