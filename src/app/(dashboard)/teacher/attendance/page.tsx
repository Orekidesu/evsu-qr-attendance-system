"use client";

import { TeacherLayout } from "@/components/layouts/TeacherLayout";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Video, Type } from "lucide-react";
import ScanTab from "@/components/teacher/attendance/scan-tab";
import ListTab from "@/components/teacher/attendance/list-tab";
import StatsTab from "@/components/teacher/attendance/stats-tab";

export default function AttendancePage() {
  const [subject, setSubject] = useState("IT101");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [session, setSession] = useState("morning");
  const [activeTab, setActiveTab] = useState("scan");

  const subjects = [
    { id: "IT101", name: "IT101: Intro to Programming" },
    { id: "IT102", name: "IT102: Web Development" },
    { id: "IT103", name: "IT103: Database Design" },
  ];

  const scheduleInfo = {
    day: "Monday",
    time: "09:00 AM - 10:30 AM",
  };
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
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
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
                  Session
                </label>
                <Select value={session} onValueChange={setSession}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning</SelectItem>
                    <SelectItem value="afternoon">Afternoon</SelectItem>
                    <SelectItem value="evening">Evening</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Schedule
                </label>
                <div className="flex items-center h-10 px-3 border rounded-lg bg-muted text-sm">
                  <span className="text-muted-foreground">
                    {scheduleInfo.day} • {scheduleInfo.time}
                  </span>
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
              <ScanTab subject={subject} date={date} session={session} />
            </TabsContent>

            <TabsContent value="list" className="space-y-4">
              <ListTab subject={subject} date={date} />
            </TabsContent>

            <TabsContent value="stats" className="space-y-4">
              <StatsTab subject={subject} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TeacherLayout>
  );
}
