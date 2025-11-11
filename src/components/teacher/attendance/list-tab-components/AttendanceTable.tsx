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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import type { AttendanceStatus } from "@/lib/types/attendance";
import type { AttendanceRecord } from "./types";

interface AttendanceTableProps {
  filteredRecords: AttendanceRecord[];
  totalRecords: number;
  onStatusChange: (attendanceId: string, newStatus: AttendanceStatus) => void;
  onDeleteRecord: (attendanceId: string) => void;
}

// Get status badge color
const getStatusColor = (status: AttendanceStatus) => {
  switch (status) {
    case "Present":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "Late":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "Absent":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function AttendanceTable({
  filteredRecords,
  totalRecords,
  onStatusChange,
  onDeleteRecord,
}: AttendanceTableProps) {
  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead>Student ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record) => (
                <TableRow key={record.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    {record.student_id}
                  </TableCell>
                  <TableCell>{record.name}</TableCell>
                  <TableCell>
                    {new Date(record.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {record.time}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {record.schedule}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={record.status}
                      onValueChange={(value) =>
                        onStatusChange(
                          record.attendanceId,
                          value as AttendanceStatus
                        )
                      }
                    >
                      <SelectTrigger
                        className={`w-28 h-7 text-xs ${getStatusColor(record.status)}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Present">Present</SelectItem>
                        <SelectItem value="Late">Late</SelectItem>
                        <SelectItem value="Absent">Absent</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogTitle>Delete Record?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this attendance record
                          for {record.name}? This action cannot be undone.
                        </AlertDialogDescription>
                        <div className="flex gap-2 justify-end">
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDeleteRecord(record.attendanceId)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  {totalRecords === 0
                    ? "No attendance records yet"
                    : "No records match your filters"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {filteredRecords.length} of {totalRecords} records
      </p>
    </>
  );
}
