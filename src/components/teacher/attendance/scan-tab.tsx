"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Video, Type, Upload, RotateCcw, X } from "lucide-react";

interface ScanRecord {
  id: string;
  studentId: string;
  name: string;
  time: string;
  status: "present" | "late" | "absent";
}

const initialScans: ScanRecord[] = [
  {
    id: "1",
    studentId: "S001",
    name: "John Doe",
    time: "09:05 AM",
    status: "present",
  },
  {
    id: "2",
    studentId: "S002",
    name: "Jane Smith",
    time: "09:08 AM",
    status: "present",
  },
  {
    id: "3",
    studentId: "S003",
    name: "Mike Johnson",
    time: "09:25 AM",
    status: "late",
  },
];

export default function ScanTab({
  subject,
  date,
  session,
}: {
  subject: string;
  date: string;
  session: string;
}) {
  const [scans, setScans] = useState<ScanRecord[]>(initialScans);
  const [manualEntry, setManualEntry] = useState("");
  const [cameraActive, setCameraActive] = useState(false);

  const totalStudents = 30;
  const presentCount = scans.filter((s) => s.status === "present").length;
  const lateCount = scans.filter((s) => s.status === "late").length;
  const absentCount = totalStudents - presentCount - lateCount;

  const handleManualEntry = () => {
    if (manualEntry.trim()) {
      const newScan: ScanRecord = {
        id: String(scans.length + 1),
        studentId: manualEntry,
        name: `Student ${manualEntry}`,
        time: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: "present",
      };
      setScans([newScan, ...scans]);
      setManualEntry("");
    }
  };

  const changeStatus = (
    id: string,
    newStatus: "present" | "late" | "absent"
  ) => {
    setScans(scans.map((s) => (s.id === id ? { ...s, status: newStatus } : s)));
  };

  const undoScan = (id: string) => {
    setScans(scans.filter((s) => s.id !== id));
  };

  const clearAll = () => {
    setScans([]);
  };

  const markRemainingAbsent = () => {
    // In a real app, this would mark all non-scanned students as absent
    alert(`Marked ${absentCount} students as absent`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Left Side - Camera and Controls */}
      <div className="lg:col-span-2 space-y-4">
        {/* Camera Viewfinder */}
        <Card>
          <CardHeader>
            <CardTitle>QR Camera Viewfinder</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted rounded-lg aspect-video flex items-center justify-center border-2 border-dashed">
              {cameraActive ? (
                <div className="text-center">
                  <Video className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Camera Active</p>
                </div>
              ) : (
                <div className="text-center">
                  <Video className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Point camera at QR code
                  </p>
                </div>
              )}
            </div>

            {/* Control Buttons */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              <Button
                variant={cameraActive ? "destructive" : "default"}
                onClick={() => setCameraActive(!cameraActive)}
              >
                {cameraActive ? "Stop" : "Start"} Camera
              </Button>
              <Button variant="outline">
                <Type className="w-4 h-4 mr-2" />
                Manual Entry
              </Button>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Bulk Import
              </Button>
            </div>

            {/* Manual Entry Input */}
            <div className="mt-4 space-y-2">
              <label className="text-sm font-medium">
                Or enter Student ID manually
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter Student ID"
                  value={manualEntry}
                  onChange={(e) => setManualEntry(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleManualEntry()}
                />
                <Button onClick={handleManualEntry}>Add</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Scans */}
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
                        {scan.studentId}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground mr-2">
                      {scan.time}
                    </span>
                    <select
                      value={scan.status}
                      onChange={(e) =>
                        changeStatus(
                          scan.id,
                          e.target.value as "present" | "late" | "absent"
                        )
                      }
                      className="text-xs px-2 py-1 border rounded"
                    >
                      <option value="present">Present</option>
                      <option value="late">Late</option>
                      <option value="absent">Absent</option>
                    </select>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => undoScan(scan.id)}
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
      </div>

      {/* Right Side - Session Info */}
      <div className="space-y-4">
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
                <p className="text-2xl font-bold text-green-600">
                  {presentCount}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Late</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {lateCount}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Absent</p>
                <p className="text-2xl font-bold text-red-600">{absentCount}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-medium">Start Time: 09:00 AM</p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-4 border-t">
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={markRemainingAbsent}
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
                      onClick={clearAll}
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
      </div>
    </div>
  );
}
