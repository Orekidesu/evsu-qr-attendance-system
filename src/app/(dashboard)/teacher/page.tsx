"use client";

import { TeacherLayout } from "@/components/layouts/TeacherLayout";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, AlertCircle, TrendingUp, BookOpen } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Static data for subjects
const mySubjects = [
  {
    id: 1,
    code: "CS202",
    title: "Intro to Programming",
    schedule: "Mon/Wed/Fri – 08:00–10:00",
    students: 32,
    room: "A101",
  },
  {
    id: 2,
    code: "CS301",
    title: "Data Structures",
    schedule: "Tue/Thu – 10:00–12:00",
    students: 28,
    room: "B205",
  },
  {
    id: 3,
    code: "CS401",
    title: "Web Development",
    schedule: "Mon/Wed – 14:00–16:00",
    students: 35,
    room: "A205",
  },
];

// Today's classes (filtered by current day)
const todaysClasses = [
  {
    id: 1,
    code: "CS202",
    title: "Intro to Programming",
    time: "08:00–10:00",
    status: "pending",
  },
  {
    id: 2,
    code: "CS401",
    title: "Web Development",
    time: "14:00–16:00",
    status: "pending",
  },
];

// Recent attendance records
const recentAttendance = [
  {
    id: 1,
    student: "John Smith",
    subject: "CS202",
    date: "Nov 10, 10:05 AM",
    status: "present",
  },
  {
    id: 2,
    student: "Sarah Johnson",
    subject: "CS202",
    date: "Nov 10, 10:12 AM",
    status: "present",
  },
  {
    id: 3,
    student: "Mike Wilson",
    subject: "CS202",
    date: "Nov 10, 10:25 AM",
    status: "late",
  },
  {
    id: 4,
    student: "Emma Davis",
    subject: "CS301",
    date: "Nov 09, 11:30 AM",
    status: "present",
  },
  {
    id: 5,
    student: "Alex Brown",
    subject: "CS301",
    date: "Nov 09, 11:35 AM",
    status: "absent",
  },
  {
    id: 6,
    student: "Lisa Anderson",
    subject: "CS401",
    date: "Nov 08, 14:05 PM",
    status: "present",
  },
  {
    id: 7,
    student: "Tom Martinez",
    subject: "CS401",
    date: "Nov 08, 14:15 PM",
    status: "late",
  },
  {
    id: 8,
    student: "Rachel Taylor",
    subject: "CS202",
    date: "Nov 08, 08:10 AM",
    status: "present",
  },
];

// Quick stats
const stats = [
  { label: "Total Students", value: "95", icon: Users },
  { label: "Today's Attendance Rate", value: "87%", icon: TrendingUp },
  { label: "Pending Classes", value: "2", icon: AlertCircle },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "present":
      return "bg-green-100 text-green-800";
    case "late":
      return "bg-yellow-100 text-yellow-800";
    case "absent":
      return "bg-red-100 text-red-800";
    case "pending":
      return "bg-blue-100 text-blue-800";
    case "completed":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function TeacherPage() {
  const [selectedAttendance, setSelectedAttendance] = useState<
    (typeof recentAttendance)[0] | null
  >(null);
  const [attendanceStatus, setAttendanceStatus] = useState<
    Record<number, string>
  >({});

  const handleStatusChange = (id: number, newStatus: string) => {
    setAttendanceStatus((prev) => ({
      ...prev,
      [id]: newStatus,
    }));
    setSelectedAttendance(null);
  };

  const getDisplayStatus = (id: number, originalStatus: string) => {
    return attendanceStatus[id] || originalStatus;
  };
  return (
    <TeacherLayout>
      <div className="space-y-8 p-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
          <p className="text-gray-600">
            Welcome back! Today is{" "}
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <Icon className="w-8 h-8 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* My Subjects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              My Subjects
            </CardTitle>
            <CardDescription>
              Your assigned subjects and schedules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mySubjects.map((subject) => (
                <div
                  key={subject.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow space-y-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-600">
                      {subject.code}
                    </p>
                    <p className="font-bold text-lg">{subject.title}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      {subject.schedule}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      {subject.students} students
                    </div>
                  </div>
                  <Button className="w-full bg-black text-white hover:bg-gray-800">
                    Scan Attendance
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Today's Classes */}
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Classes</CardTitle>
            <CardDescription>Classes scheduled for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todaysClasses.length > 0 ? (
                todaysClasses.map((cls) => (
                  <div
                    key={cls.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <p className="font-semibold">
                        {cls.code} – {cls.title}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                        <Clock className="w-4 h-4" />
                        {cls.time}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(cls.status)}>
                        {cls.status === "pending" ? "Pending" : "Completed"}
                      </Badge>
                      <Button
                        size="sm"
                        className="bg-black text-white hover:bg-gray-800"
                      >
                        Quick Scan
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-600 py-4">
                  No classes scheduled for today
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Attendance Feed */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Attendance Feed</CardTitle>
            <CardDescription>Latest 8 attendance records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentAttendance.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <p className="font-semibold">{record.student}</p>
                    <p className="text-sm text-gray-600">
                      {record.subject} • {record.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      className={getStatusColor(
                        getDisplayStatus(record.id, record.status)
                      )}
                    >
                      {getDisplayStatus(record.id, record.status)
                        .charAt(0)
                        .toUpperCase() +
                        getDisplayStatus(record.id, record.status).slice(1)}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(record.id, "present")
                          }
                        >
                          Mark Present
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(record.id, "late")}
                        >
                          Mark Late
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(record.id, "absent")
                          }
                        >
                          Mark Absent
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </TeacherLayout>
  );
}
