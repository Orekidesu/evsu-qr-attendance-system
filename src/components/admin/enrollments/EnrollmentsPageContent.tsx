"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Plus, Trash2, Loader2, AlertCircle } from "lucide-react";
import {
  useEnrollmentsData,
  type EnrollmentWithDetails,
} from "@/hooks/useEnrollmentsData";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
    if (!enrollFormData.studentId || !enrollFormData.subjectId) return;

    const student = students.find((s) => s.id === enrollFormData.studentId);
    if (!student) return;

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
    if (selectedSubjectForBulk === "all") return;

    const subject = subjects.find((s) => s.id === selectedSubjectForBulk);
    if (!subject) return;

    const studentsToEnroll = studentsInSelectedProgram.filter(
      (student) => enrollBySubjectData[student.id]
    );

    if (studentsToEnroll.length === 0) {
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
      setSelectedSubjectForBulk("all");
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
            {/* Search and Filters */}
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by student or subject..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleEnrollClick}
                  className="gap-2"
                  disabled={students.length === 0 || subjects.length === 0}
                >
                  <Plus className="h-4 w-4" />
                  Enroll Student
                </Button>
              </div>

              {/* Filter Controls */}
              <div className="flex flex-wrap gap-4">
                <Select value={filterStudent} onValueChange={setFilterStudent}>
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

                <Select value={filterSubject} onValueChange={setFilterSubject}>
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

                <Select value={filterProgram} onValueChange={setFilterProgram}>
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

                {(filterStudent !== "all" ||
                  filterSubject !== "all" ||
                  filterProgram !== "all" ||
                  searchQuery) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFilterStudent("all");
                      setFilterSubject("all");
                      setFilterProgram("all");
                      setSearchQuery("");
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>

            {/* Enrollments Table */}
            <Card>
              <CardHeader>
                <CardTitle>
                  All Enrollments ({filteredEnrollments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {enrollments.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">
                      No enrollments yet. Start by enrolling students in
                      subjects.
                    </p>
                    <Button
                      onClick={handleEnrollClick}
                      disabled={students.length === 0 || subjects.length === 0}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Enroll First Student
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            Student Number
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            Student Name
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            Subject
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            Program
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            Enrollment Date
                          </th>
                          <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEnrollments.length > 0 ? (
                          filteredEnrollments.map((enrollment) => (
                            <tr
                              key={enrollment.id}
                              className="border-b hover:bg-muted/50"
                            >
                              <td className="h-12 px-4 align-middle font-mono">
                                {enrollment.studentNumber}
                              </td>
                              <td className="h-12 px-4 align-middle">
                                {enrollment.studentName}
                              </td>
                              <td className="h-12 px-4 align-middle">
                                <div>
                                  <p className="font-medium">
                                    {enrollment.subjectCode}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {enrollment.subjectTitle}
                                  </p>
                                </div>
                              </td>
                              <td className="h-12 px-4 align-middle">
                                {enrollment.programName}
                              </td>
                              <td className="h-12 px-4 align-middle">
                                {formatDate(enrollment.enrolled_at)}
                              </td>
                              <td className="h-12 px-4 align-middle text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteClick(enrollment)}
                                  className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={6}
                              className="h-12 px-4 align-middle text-center text-muted-foreground"
                            >
                              No enrollments match your filters
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enroll by Subject Tab */}
          <TabsContent value="by-subject" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bulk Enroll Students by Subject</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {subjects.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No subjects available. Please create subjects first.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Subject Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="bulk-subject">Select Subject</Label>
                      <Select
                        value={selectedSubjectForBulk}
                        onValueChange={setSelectedSubjectForBulk}
                      >
                        <SelectTrigger id="bulk-subject">
                          <SelectValue placeholder="Choose a subject..." />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((subject) => {
                            const program = programs.find(
                              (p) => p.id === subject.program_id
                            );
                            return (
                              <SelectItem key={subject.id} value={subject.id}>
                                {subject.course_code} -{" "}
                                {subject.descriptive_title}
                                {program && ` (${program.abbreviation})`}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Students List */}
                    {selectedSubjectForBulk !== "all" && (
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium mb-3">
                            Students in{" "}
                            {programs.find(
                              (p) =>
                                p.id ===
                                subjects.find(
                                  (s) => s.id === selectedSubjectForBulk
                                )?.program_id
                            )?.abbreviation || "Unknown Program"}
                          </p>
                          {studentsInSelectedProgram.length === 0 ? (
                            <div className="text-center py-8 border rounded-lg">
                              <p className="text-muted-foreground">
                                No students found in this program.
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-4">
                              {studentsInSelectedProgram.map((student) => {
                                const isAlreadyEnrolled = enrollments.some(
                                  (e) =>
                                    e.student_id === student.id &&
                                    e.subject_id === selectedSubjectForBulk
                                );
                                return (
                                  <div
                                    key={student.id}
                                    className="flex items-center gap-3"
                                  >
                                    <Checkbox
                                      id={`student-${student.id}`}
                                      checked={
                                        enrollBySubjectData[student.id] || false
                                      }
                                      onCheckedChange={(checked) => {
                                        setEnrollBySubjectData({
                                          ...enrollBySubjectData,
                                          [student.id]: !!checked,
                                        });
                                      }}
                                      disabled={isAlreadyEnrolled}
                                    />
                                    <label
                                      htmlFor={`student-${student.id}`}
                                      className={`text-sm cursor-pointer flex-1 ${
                                        isAlreadyEnrolled
                                          ? "text-muted-foreground line-through"
                                          : ""
                                      }`}
                                    >
                                      {student.student_id} -{" "}
                                      {student.first_name} {student.last_name}
                                      {isAlreadyEnrolled && (
                                        <span className="text-xs ml-2">
                                          (Already enrolled)
                                        </span>
                                      )}
                                    </label>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {studentsInSelectedProgram.length > 0 && (
                          <Button
                            onClick={handleBulkEnroll}
                            disabled={
                              isSubmitting ||
                              !Object.values(enrollBySubjectData).some((v) => v)
                            }
                            className="w-full"
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Enrolling...
                              </>
                            ) : (
                              <>Enroll Selected Students</>
                            )}
                          </Button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Enroll Student Modal */}
      <Dialog open={isEnrollModalOpen} onOpenChange={setIsEnrollModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enroll Student</DialogTitle>
            <DialogDescription>
              Select a student and subject to create a new enrollment.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="student">Student</Label>
              <Select
                value={enrollFormData.studentId}
                onValueChange={(value) =>
                  setEnrollFormData({
                    ...enrollFormData,
                    studentId: value,
                    subjectId: "",
                  })
                }
              >
                <SelectTrigger id="student">
                  <SelectValue placeholder="Select a student..." />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => {
                    const program = programs.find(
                      (p) => p.id === student.program_id
                    );
                    return (
                      <SelectItem key={student.id} value={student.id}>
                        {student.student_id} - {student.first_name}{" "}
                        {student.last_name}
                        {program && ` (${program.abbreviation})`}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select
                value={enrollFormData.subjectId}
                onValueChange={(value) =>
                  setEnrollFormData({ ...enrollFormData, subjectId: value })
                }
                disabled={!enrollFormData.studentId}
              >
                <SelectTrigger id="subject">
                  <SelectValue
                    placeholder={
                      !enrollFormData.studentId
                        ? "Select a student first..."
                        : "Select a subject..."
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableSubjects.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      No subjects available for this program
                    </div>
                  ) : (
                    availableSubjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.course_code} - {subject.descriptive_title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEnrollModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEnrollment}
              disabled={
                !enrollFormData.studentId ||
                !enrollFormData.subjectId ||
                isSubmitting
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enrolling...
                </>
              ) : (
                "Enroll"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Enrollment</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this enrollment? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {selectedEnrollment && (
            <div className="py-4 space-y-2">
              <p className="text-sm">
                <span className="font-medium">Student:</span>{" "}
                {selectedEnrollment.studentName}
              </p>
              <p className="text-sm">
                <span className="font-medium">Subject:</span>{" "}
                {selectedEnrollment.subjectCode} -{" "}
                {selectedEnrollment.subjectTitle}
              </p>
              <p className="text-sm">
                <span className="font-medium">Program:</span>{" "}
                {selectedEnrollment.programName}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
