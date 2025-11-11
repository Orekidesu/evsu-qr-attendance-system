"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { X } from "lucide-react";

interface SessionInfoProps {
  totalStudents: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  scheduleStartTime: string;
  onMarkRemainingAbsent: () => void;
  onClearAll: () => void;
}

export function SessionInfo({
  totalStudents,
  presentCount,
  lateCount,
  absentCount,
  scheduleStartTime,
  onMarkRemainingAbsent,
  onClearAll,
}: SessionInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Session Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground">Total Students</p>
            <p className="text-2xl font-bold">{totalStudents}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Present</p>
            <p className="text-2xl font-bold text-green-600">{presentCount}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Late</p>
            <p className="text-2xl font-bold text-yellow-600">{lateCount}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Absent</p>
            <p className="text-2xl font-bold text-red-600">{absentCount}</p>
          </div>
        </div>

        <div className="border-t pt-4">
          <p className="text-sm font-medium">Start Time: {scheduleStartTime}</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-4 border-t">
          <Button
            variant="outline"
            className="w-full bg-transparent"
            onClick={onMarkRemainingAbsent}
          >
            Mark Remaining Absent
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full bg-transparent">
                <X className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogTitle>Clear All Scans?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove all scanned records. This action cannot be
                undone.
              </AlertDialogDescription>
              <div className="flex gap-2 justify-end">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onClearAll}
                  className="bg-destructive"
                >
                  Clear All
                </AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>
          <Button className="w-full bg-primary">End Session</Button>
        </div>
      </CardContent>
    </Card>
  );
}
