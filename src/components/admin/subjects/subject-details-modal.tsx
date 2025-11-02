"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  programName?: string;
  teacherName?: string;
  schedules: Schedule[];
  enrolledStudents: number;
}

interface SubjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Subject;
}

const ENROLLED_STUDENTS = [
  {
    id: "1",
    name: "Ahmed Ali",
    email: "ahmed@example.com",
    enrolledDate: "2025-01-15",
  },
  {
    id: "2",
    name: "Fatima Khan",
    email: "fatima@example.com",
    enrolledDate: "2025-01-15",
  },
  {
    id: "3",
    name: "Hassan Malik",
    email: "hassan@example.com",
    enrolledDate: "2025-01-16",
  },
  {
    id: "4",
    name: "Sara Ahmed",
    email: "sara@example.com",
    enrolledDate: "2025-01-16",
  },
  {
    id: "5",
    name: "Muhammad Ali",
    email: "muhammad@example.com",
    enrolledDate: "2025-01-17",
  },
];

export default function SubjectDetailsModal({
  isOpen,
  onClose,
  subject,
}: SubjectDetailsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="pr-8">
            <span className="break-words">
              {subject.courseCode}: {subject.title}
            </span>
          </DialogTitle>
          <DialogDescription>
            Subject details and enrollment information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Subject Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Subject Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">Course Code</p>
                  <p className="font-semibold break-words">
                    {subject.courseCode}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">Title</p>
                  <p className="font-semibold break-words">{subject.title}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">Program</p>
                  <p className="font-semibold break-words">
                    {subject.programName || subject.program}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">Teacher</p>
                  <p className="font-semibold break-words">
                    {subject.teacherName || subject.teacher}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedules */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Schedules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {subject.schedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="p-3 bg-muted rounded-lg text-sm break-words"
                  >
                    <p className="font-semibold">{schedule.days.join(", ")}</p>
                    <p className="text-muted-foreground">
                      {schedule.startTime} - {schedule.endTime}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Enrollment Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Enrollment Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Total Enrolled</p>
                <p className="text-2xl font-bold">{subject.enrolledStudents}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Attendance Rate</p>
                <p className="text-lg font-semibold">92%</p>
              </div>
            </CardContent>
          </Card>

          {/* Enrolled Students */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Enrolled Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-3 py-2 text-left font-semibold">
                        Name
                      </th>
                      <th className="px-3 py-2 text-left font-semibold">
                        Email
                      </th>
                      <th className="px-3 py-2 text-left font-semibold">
                        Enrolled Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ENROLLED_STUDENTS.slice(0, subject.enrolledStudents).map(
                      (student) => (
                        <tr
                          key={student.id}
                          className="border-b hover:bg-muted/50"
                        >
                          <td className="px-3 py-2">{student.name}</td>
                          <td className="px-3 py-2">{student.email}</td>
                          <td className="px-3 py-2">{student.enrolledDate}</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
