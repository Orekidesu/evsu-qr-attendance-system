"use client";
import { AdminLayout } from "@/components/layouts/AdminLayout";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Eye, Edit2, Trash2 } from "lucide-react";
import { AddTeacherModal } from "@/components/admin/teachers/add-teacher-modal";
import { EditTeacherModal } from "@/components/admin/teachers/edit-teacher-modal";
import { ViewTeacherModal } from "@/components/admin/teachers/view-teacher-modal";
import { DeleteTeacherModal } from "@/components/admin/teachers/delete-teacher-modal";

// Static data
const staticTeachers = [
  {
    id: 1,
    firstName: "John",
    lastName: "Anderson",
    email: "john.anderson@school.com",
    status: "Active",
    assignedSubjects: ["Mathematics", "Physics"],
    totalStudents: 145,
  },
  {
    id: 2,
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@school.com",
    status: "Active",
    assignedSubjects: ["English", "Literature"],
    totalStudents: 128,
  },
  {
    id: 3,
    firstName: "Michael",
    lastName: "Brown",
    email: "michael.brown@school.com",
    status: "Active",
    assignedSubjects: ["Chemistry", "Biology"],
    totalStudents: 156,
  },
  {
    id: 4,
    firstName: "Emma",
    lastName: "Wilson",
    email: "emma.wilson@school.com",
    status: "Inactive",
    assignedSubjects: ["History", "Geography"],
    totalStudents: 0,
  },
  {
    id: 5,
    firstName: "David",
    lastName: "Martinez",
    email: "david.martinez@school.com",
    status: "Active",
    assignedSubjects: ["Computer Science", "Information Technology"],
    totalStudents: 167,
  },
];

export default function UserPage() {
  const [teachers, setTeachers] = useState(staticTeachers);
  const [searchQuery, setSearchQuery] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        teacher.firstName.toLowerCase().includes(searchLower) ||
        teacher.lastName.toLowerCase().includes(searchLower) ||
        teacher.email.toLowerCase().includes(searchLower)
      );
    });
  }, [teachers, searchQuery]);

  const handleAddTeacher = (newTeacher) => {
    const teacher = {
      id: Math.max(...teachers.map((t) => t.id), 0) + 1,
      ...newTeacher,
      totalStudents: 0,
    };
    setTeachers([...teachers, teacher]);
    setAddModalOpen(false);
  };

  const handleEditTeacher = (updatedTeacher) => {
    setTeachers(
      teachers.map((t) => (t.id === updatedTeacher.id ? updatedTeacher : t))
    );
    setEditModalOpen(false);
    setSelectedTeacher(null);
  };

  const handleDeleteTeacher = () => {
    setTeachers(teachers.filter((t) => t.id !== selectedTeacher.id));
    setDeleteModalOpen(false);
    setSelectedTeacher(null);
  };
  return (
    <AdminLayout breadcrumbs={[{ label: "Users" }]}>
      <div className="flex flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Teachers Management
          </h1>
          <p className="text-muted-foreground">
            Manage all teachers and their assigned subjects
          </p>
        </div>

        {/* Search and Actions */}
        <div className="flex gap-4 flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => setAddModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add New Teacher
          </Button>
        </div>

        {/* Teachers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Teachers List</CardTitle>
            <CardDescription>
              {filteredTeachers.length} teachers found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Assigned Subjects</TableHead>
                    <TableHead>Total Students</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell className="font-medium">
                        {teacher.firstName} {teacher.lastName}
                      </TableCell>
                      <TableCell>{teacher.email}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {teacher.assignedSubjects.map((subject) => (
                            <Badge key={subject} variant="secondary">
                              {subject}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{teacher.totalStudents}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            teacher.status === "Active" ? "default" : "outline"
                          }
                        >
                          {teacher.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedTeacher(teacher);
                              setViewModalOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedTeacher(teacher);
                              setEditModalOpen(true);
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setSelectedTeacher(teacher);
                              setDeleteModalOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Modals */}
        <AddTeacherModal
          open={addModalOpen}
          onOpenChange={setAddModalOpen}
          onAdd={handleAddTeacher}
        />
        {selectedTeacher && (
          <>
            <EditTeacherModal
              open={editModalOpen}
              onOpenChange={setEditModalOpen}
              teacher={selectedTeacher}
              onEdit={handleEditTeacher}
            />
            <ViewTeacherModal
              open={viewModalOpen}
              onOpenChange={setViewModalOpen}
              teacher={selectedTeacher}
            />
            <DeleteTeacherModal
              open={deleteModalOpen}
              onOpenChange={setDeleteModalOpen}
              teacher={selectedTeacher}
              onDelete={handleDeleteTeacher}
            />
          </>
        )}
      </div>
    </AdminLayout>
  );
}
