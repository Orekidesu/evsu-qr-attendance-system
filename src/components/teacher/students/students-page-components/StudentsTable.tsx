"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { StudentWithAttendance } from "@/hooks/useTeacherStudentsData";

interface StudentsTableProps {
  students: StudentWithAttendance[];
  onViewDetails: (student: StudentWithAttendance) => void;
}

export function StudentsTable({ students, onViewDetails }: StudentsTableProps) {
  if (students.length === 0) {
    return (
      <div className="border rounded-lg p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <p className="text-muted-foreground text-lg">No students found</p>
          <p className="text-sm text-muted-foreground mt-2">
            Try adjusting your search or filter criteria
          </p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (percentage: number) => {
    if (percentage >= 75) {
      return <Badge className="bg-green-500">{percentage}%</Badge>;
    } else if (percentage >= 50) {
      return <Badge className="bg-yellow-500">{percentage}%</Badge>;
    } else {
      return <Badge className="bg-red-500">{percentage}%</Badge>;
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Program</TableHead>
            <TableHead className="text-center">Present</TableHead>
            <TableHead className="text-center">Late</TableHead>
            <TableHead className="text-center">Absent</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student.studentId}>
              <TableCell className="font-medium">
                {student.student_id}
              </TableCell>
              <TableCell>{student.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {student.email}
              </TableCell>
              <TableCell>
                <Badge variant="outline">{student.program_name}</Badge>
              </TableCell>
              <TableCell className="text-center">
                {getStatusBadge(student.presentPercentage)}
              </TableCell>
              <TableCell className="text-center">
                {getStatusBadge(student.latePercentage)}
              </TableCell>
              <TableCell className="text-center">
                {getStatusBadge(student.absentPercentage)}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails(student)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
