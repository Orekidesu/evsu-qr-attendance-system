"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import type { EnrollmentWithDetails } from "@/hooks/useEnrollmentsData";

interface EnrollmentsTableProps {
  enrollments: EnrollmentWithDetails[];
  filteredEnrollments: EnrollmentWithDetails[];
  onDeleteClick: (enrollment: EnrollmentWithDetails) => void;
  onEnrollClick: () => void;
  canEnroll: boolean;
  formatDate: (timestamp: unknown) => string;
}

export function EnrollmentsTable({
  enrollments,
  filteredEnrollments,
  onDeleteClick,
  onEnrollClick,
  canEnroll,
  formatDate,
}: EnrollmentsTableProps) {
  if (enrollments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>All Enrollments (0)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No enrollments yet. Start by enrolling students in subjects.
            </p>
            <Button onClick={onEnrollClick} disabled={!canEnroll}>
              <Plus className="h-4 w-4 mr-2" />
              Enroll First Student
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Enrollments ({filteredEnrollments.length})</CardTitle>
      </CardHeader>
      <CardContent>
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
                        <p className="font-medium">{enrollment.subjectCode}</p>
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
                        onClick={() => onDeleteClick(enrollment)}
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
      </CardContent>
    </Card>
  );
}
