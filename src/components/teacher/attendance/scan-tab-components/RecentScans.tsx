"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RotateCcw } from "lucide-react";
import type { AttendanceStatus } from "@/lib/types/attendance";

export interface ScanRecord {
  id: string;
  studentId: string;
  student_id: string;
  name: string;
  time: string;
  status: AttendanceStatus;
  attendanceId: string;
}

interface RecentScansProps {
  scans: ScanRecord[];
  onStatusChange: (attendanceId: string, newStatus: AttendanceStatus) => void;
  onRemoveScan: (attendanceId: string) => void;
}

export function RecentScans({
  scans,
  onStatusChange,
  onRemoveScan,
}: RecentScansProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Scans</CardTitle>
        <CardDescription>{scans.length} students scanned</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {scans.length > 0 ? (
            scans.map((scan) => (
              <div
                key={scan.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm">{scan.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {scan.student_id}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground mr-2">
                  {scan.time}
                </span>
                <select
                  value={scan.status}
                  onChange={(e) =>
                    onStatusChange(
                      scan.attendanceId,
                      e.target.value as AttendanceStatus
                    )
                  }
                  className="text-xs px-2 py-1 border rounded"
                >
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Absent">Absent</option>
                </select>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRemoveScan(scan.attendanceId)}
                  className="ml-2"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No scans yet. Start by clicking &quot;Start Camera&quot; or
              entering a Student ID.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
