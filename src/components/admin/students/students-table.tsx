"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Edit, Trash2, QrCode, ArrowUpDown } from "lucide-react";
import type { StudentWithDetails } from "@/hooks/useStudentsData";

interface StudentsTableProps {
  students: StudentWithDetails[];
  sortBy: "student_id" | "name" | "program";
  setSortBy: (sortBy: "student_id" | "name" | "program") => void;
  sortOrder: "asc" | "desc";
  setSortOrder: (sortOrder: "asc" | "desc") => void;
  onViewQr: (student: StudentWithDetails) => void;
  onEdit: (student: StudentWithDetails) => void;
  onView: (student: StudentWithDetails) => void;
  onDelete: (student: StudentWithDetails) => void;
}

interface SortHeaderProps {
  column: "student_id" | "name" | "program";
  label: string;
  onClick: (column: "student_id" | "name" | "program") => void;
}

function SortHeader({ column, label, onClick }: SortHeaderProps) {
  return (
    <TableHead
      onClick={() => onClick(column)}
      className="cursor-pointer hover:bg-muted/50"
    >
      <div className="flex items-center gap-2">
        {label}
        <ArrowUpDown className="w-4 h-4" />
      </div>
    </TableHead>
  );
}

export function StudentsTable({
  students,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  onViewQr,
  onEdit,
  onView,
  onDelete,
}: StudentsTableProps) {
  const handleSort = (column: "student_id" | "name" | "program") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <SortHeader
              column="student_id"
              label="Student ID"
              onClick={handleSort}
            />
            <SortHeader column="name" label="Name" onClick={handleSort} />
            <SortHeader column="program" label="Program" onClick={handleSort} />
            <TableHead>Email</TableHead>
            <TableHead>QR Code</TableHead>
            <TableHead className="w-[200px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                No students found
              </TableCell>
            </TableRow>
          ) : (
            students.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">
                  {student.student_id}
                </TableCell>
                <TableCell>{`${student.first_name} ${student.last_name}`}</TableCell>
                <TableCell>{student.programName}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {student.email || "—"}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewQr(student)}
                    className="gap-2"
                  >
                    <QrCode className="w-4 h-4" />
                    View
                  </Button>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(student)}
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(student)}
                      title="Edit student"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(student)}
                      title="Delete student"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
