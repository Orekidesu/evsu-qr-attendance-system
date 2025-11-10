"use client";

import { TeacherLayout } from "@/components/layouts/TeacherLayout";
import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Video, Type, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ScanTab from "@/components/teacher/attendance/scan-tab";
import ListTab from "@/components/teacher/attendance/list-tab";
import StatsTab from "@/components/teacher/attendance/stats-tab";
import { useAttendanceData } from "@/hooks/useAttendanceData";

const DAYS_MAP: Record<string, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday",
};

export default function AttendancePage() {
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedScheduleIndex, setSelectedScheduleIndex] = useState<number>(0);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [activeTab, setActiveTab] = useState("scan");

  const { subjects, isLoading, error } = useAttendanceData();

  // Find selected subject
  const selectedSubject = useMemo(
    () => subjects.find((s) => s.id === selectedSubjectId),
    [subjects, selectedSubjectId]
  );

  // Get selected schedule
  const selectedSchedule = useMemo(
    () => selectedSubject?.schedules[selectedScheduleIndex] || null,
    [selectedSubject, selectedScheduleIndex]
  );

  // Format schedule info
  const scheduleInfo = useMemo(() => {
    if (!selectedSchedule) return null;

    const days = selectedSchedule.days.map((d) => DAYS_MAP[d] || d).join(", ");
    const time = `${selectedSchedule.time_start} - ${selectedSchedule.time_end}`;

    return { days, time };
  }, [selectedSchedule]);

  // Auto-select first subject if none selected
  useState(() => {
    if (subjects.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(subjects[0].id);
    }
  });

  if (isLoading) {
    return (
      <TeacherLayout breadcrumbs={[{ label: "Attendance" }]}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </TeacherLayout>
    );
  }

  if (error) {
    return (
      <TeacherLayout breadcrumbs={[{ label: "Attendance" }]}>
        <Alert variant="destructive" className="m-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </TeacherLayout>
    );
  }

  if (subjects.length === 0) {
    return (
      <TeacherLayout breadcrumbs={[{ label: "Attendance" }]}>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Subjects Assigned</h2>
          <p className="text-muted-foreground">
            You don&apos;t have any subjects assigned yet. Please contact the
            administrator.
          </p>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout breadcrumbs={[{ label: "Attendance" }]}>
      <div className="flex flex-col min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-40 border-b bg-card p-4 shadow-sm">
          <div className="max-w-7xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Teacher Attendance</h1>
            </div>

            {/* Top Controls */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Subject
                </label>
                <Select
                  value={selectedSubjectId}
                  onValueChange={setSelectedSubjectId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.course_code} - {s.descriptive_title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Date</label>
                <div className="flex items-center border rounded-lg px-3 h-10 bg-input">
                  <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Schedule
                </label>
                <Select
                  value={selectedScheduleIndex.toString()}
                  onValueChange={(value) =>
                    setSelectedScheduleIndex(parseInt(value))
                  }
                  disabled={
                    !selectedSubject || selectedSubject.schedules.length === 0
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedSubject?.schedules.map((schedule, index) => {
                      const days = schedule.days
                        .map((d) => DAYS_MAP[d] || d)
                        .join(", ");
                      return (
                        <SelectItem key={index} value={index.toString()}>
                          {days} • {schedule.time_start} - {schedule.time_end}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Schedule Info
                </label>
                <div className="flex items-center h-10 px-3 border rounded-lg bg-muted text-sm">
                  {scheduleInfo ? (
                    <span className="text-muted-foreground">
                      {scheduleInfo.days} • {scheduleInfo.time}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      No schedule selected
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Content */}
        <div className="flex-1 max-w-7xl mx-auto w-full p-4">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="scan" className="gap-2">
                <Video className="w-4 h-4" />
                Scan
              </TabsTrigger>
              <TabsTrigger value="list" className="gap-2">
                <Type className="w-4 h-4" />
                List
              </TabsTrigger>
              <TabsTrigger value="stats" className="gap-2">
                📊 Stats
              </TabsTrigger>
            </TabsList>

            <TabsContent value="scan" className="space-y-4">
              {selectedSubjectId && selectedSchedule ? (
                <ScanTab
                  subjectId={selectedSubjectId}
                  schedule={selectedSchedule}
                  date={date}
                />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  Please select a subject and schedule to begin
                </div>
              )}
            </TabsContent>

            <TabsContent value="list" className="space-y-4">
              {selectedSubjectId ? (
                <ListTab subjectId={selectedSubjectId} date={date} />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  Please select a subject to view attendance list
                </div>
              )}
            </TabsContent>

            <TabsContent value="stats" className="space-y-4">
              {selectedSubjectId ? (
                <StatsTab subjectId={selectedSubjectId} />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  Please select a subject to view statistics
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TeacherLayout>
  );
}
