"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import type { AttendanceRecord } from "./types";
import type { Subject } from "@/lib/types/subject";

interface ExportButtonProps {
  filteredRecords: AttendanceRecord[];
  subjects: Subject[];
  subjectId: string;
  dateFrom: string;
  dateTo: string;
}

export default function ExportButton({
  filteredRecords,
  subjects,
  subjectId,
  dateFrom,
  dateTo,
}: ExportButtonProps) {
  const handleExportCSV = () => {
    try {
      // Prepare CSV headers
      const headers = [
        "Student ID",
        "Student Name",
        "Date",
        "Time",
        "Schedule",
        "Status",
      ];

      // Prepare CSV rows from filtered records
      const rows = filteredRecords.map((record) => [
        record.student_id,
        record.name,
        new Date(record.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        record.time,
        record.schedule,
        record.status,
      ]);

      // Combine headers and rows
      const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
        ),
      ].join("\n");

      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      // Generate filename with subject name and formatted date range
      const subject = subjects.find((s) => s.id === subjectId);
      const subjectName = subject
        ? subject.descriptive_title.replace(/[^a-zA-Z0-9]/g, "_")
        : subjectId;
      const dateFromFormatted = new Date(dateFrom).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const dateToFormatted = new Date(dateTo).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const timestamp = new Date()
        .toISOString()
        .slice(0, 16)
        .replace("T", "_")
        .replace(/:/g, "-");
      const filename = `${subjectName}_Attendance_${dateFromFormatted}_to_${dateToFormatted}_${timestamp}.csv`;

      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("CSV Downloaded", {
        description: `Exported ${filteredRecords.length} records successfully`,
      });
    } catch (err) {
      console.error("Error exporting CSV:", err);
      toast.error("Export Failed", {
        description: "Could not generate CSV file",
      });
    }
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handleExportCSV}>
        <Download className="w-4 h-4 mr-2" />
        Export CSV ({filteredRecords.length} records)
      </Button>
    </div>
  );
}
