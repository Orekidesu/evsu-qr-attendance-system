"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, AlertCircle } from "lucide-react";
import type { Student, Subject, Program } from "@/lib/types";
import type { EnrollmentWithDetails } from "@/hooks/useEnrollmentsData";

interface BulkEnrollmentTabProps {
  subjects: Subject[];
  programs: Program[];
  enrollments: EnrollmentWithDetails[];
  selectedSubjectForBulk: string;
  onSelectedSubjectChange: (value: string) => void;
  studentsInSelectedProgram: Student[];
  enrollBySubjectData: { [key: string]: boolean };
  onEnrollDataChange: (data: { [key: string]: boolean }) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onValidate: () => void;
  onBulkEnroll: () => void;
  isSubmitting: boolean;
}

export function BulkEnrollmentTab({
  subjects,
  programs,
  enrollments,
  selectedSubjectForBulk,
  onSelectedSubjectChange,
  studentsInSelectedProgram,
  enrollBySubjectData,
  onEnrollDataChange,
  onSelectAll,
  onDeselectAll,
  onValidate,
  onBulkEnroll,
  isSubmitting,
}: BulkEnrollmentTabProps) {
  const availableStudentsCount = studentsInSelectedProgram.filter(
    (s) =>
      !enrollments.some(
        (e) => e.student_id === s.id && e.subject_id === selectedSubjectForBulk
      )
  ).length;

  const selectedCount = Object.values(enrollBySubjectData).filter(
    (v) => v
  ).length;

  const allAlreadyEnrolled = studentsInSelectedProgram.every((s) =>
    enrollments.some(
      (e) => e.student_id === s.id && e.subject_id === selectedSubjectForBulk
    )
  );

  return (
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
                onValueChange={onSelectedSubjectChange}
              >
                <SelectTrigger id="bulk-subject" className="w-1/2">
                  <SelectValue placeholder="Choose a subject..." />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => {
                    const program = programs.find(
                      (p) => p.id === subject.program_id
                    );
                    return (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.course_code} - {subject.descriptive_title}
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
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium">
                      Students in{" "}
                      {programs.find(
                        (p) =>
                          p.id ===
                          subjects.find((s) => s.id === selectedSubjectForBulk)
                            ?.program_id
                      )?.abbreviation || "Unknown Program"}
                      {studentsInSelectedProgram.length > 0 && (
                        <span className="text-muted-foreground ml-2">
                          ({availableStudentsCount} available)
                        </span>
                      )}
                    </p>
                    {studentsInSelectedProgram.length > 0 && (
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={onSelectAll}
                          disabled={allAlreadyEnrolled}
                        >
                          Select All
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={onDeselectAll}
                          disabled={
                            Object.keys(enrollBySubjectData).length === 0
                          }
                        >
                          Deselect All
                        </Button>
                      </div>
                    )}
                  </div>

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
                              checked={enrollBySubjectData[student.id] || false}
                              onCheckedChange={(checked) => {
                                onEnrollDataChange({
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
                              {student.student_id} - {student.first_name}{" "}
                              {student.last_name}
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
                  <div className="space-y-2">
                    {selectedCount > 0 && (
                      <p className="text-sm text-muted-foreground text-center">
                        {selectedCount} student(s) selected
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button
                        onClick={onValidate}
                        disabled={isSubmitting || selectedCount === 0}
                        variant="outline"
                        className="flex-1"
                      >
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Validate Selection
                      </Button>
                      <Button
                        onClick={onBulkEnroll}
                        disabled={isSubmitting || selectedCount === 0}
                        className="flex-1"
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
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
