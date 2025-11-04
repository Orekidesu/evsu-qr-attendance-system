"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const attendanceData = [
  { date: "Nov 1", present: 28, late: 1, absent: 1 },
  { date: "Nov 2", present: 27, late: 2, absent: 1 },
  { date: "Nov 3", present: 29, late: 0, absent: 1 },
  { date: "Nov 4", present: 30, late: 0, absent: 0 },
]

const studentData = [
  { name: "John Doe", present: 4, late: 0, absent: 0 },
  { name: "Jane Smith", present: 3, late: 1, absent: 0 },
  { name: "Mike Johnson", present: 3, late: 1, absent: 0 },
  { name: "Sarah Williams", present: 3, late: 0, absent: 1 },
  { name: "Tom Brown", present: 4, late: 0, absent: 0 },
]

const overallStats = [
  { name: "Present", value: 114, color: "#10b981" },
  { name: "Late", value: 3, color: "#f59e0b" },
  { name: "Absent", value: 3, color: "#ef4444" },
]

export default function StatsTab({ subject }: { subject: string }) {
  const totalClasses = 4
  const totalStudents = 30
  const totalAttendance = 114
  const overallRate = ((totalAttendance / (totalClasses * totalStudents)) * 100).toFixed(1)

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overall Attendance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{overallRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">120 out of 120 sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Present</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{totalAttendance}</p>
            <p className="text-xs text-muted-foreground mt-1">Out of {totalClasses * totalStudents}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Late</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">3</p>
            <p className="text-xs text-muted-foreground mt-1">2.5% of total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Absent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">3</p>
            <p className="text-xs text-muted-foreground mt-1">2.5% of total</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Attendance Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="present" stroke="#10b981" />
                <Line type="monotone" dataKey="late" stroke="#f59e0b" />
                <Line type="monotone" dataKey="absent" stroke="#ef4444" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Overall Attendance Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={overallStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {overallStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Per-Student Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Per-Student Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={studentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="present" fill="#10b981" />
              <Bar dataKey="late" fill="#f59e0b" />
              <Bar dataKey="absent" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Export Options */}
      <div className="flex gap-2">
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export PDF
        </Button>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Excel
        </Button>
      </div>
    </div>
  )
}
