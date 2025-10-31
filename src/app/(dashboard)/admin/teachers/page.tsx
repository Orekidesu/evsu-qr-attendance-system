"use client";
import { AdminLayout } from "@/components/layouts/AdminLayout";

import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
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
import { Search, Plus, Eye, Edit2, Trash2, Loader2 } from "lucide-react";
import { AddTeacherModal } from "@/components/admin/teachers/add-teacher-modal";
import { EditTeacherModal } from "@/components/admin/teachers/edit-teacher-modal";
import { ViewTeacherModal } from "@/components/admin/teachers/view-teacher-modal";
import { DeleteTeacherModal } from "@/components/admin/teachers/delete-teacher-modal";
import { useTeachersData } from "@/hooks/useTeachersData";
import type { TeacherWithDetails } from "@/hooks/useTeachersData";

export default function TeachersPage() {
  const { teachers, isLoading, error, addTeacher, editTeacher, removeTeacher } =
    useTeachersData();

  const [searchQuery, setSearchQuery] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] =
    useState<TeacherWithDetails | null>(null);

  // Show error toast when data loading fails
  useEffect(() => {
    if (error) {
      toast.error("Failed to Load Data", {
        description: error.includes("authentication")
          ? "Please make sure you are logged in and try refreshing the page."
          : error,
      });
    }
  }, [error]);

  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        teacher.first_name.toLowerCase().includes(searchLower) ||
        teacher.last_name.toLowerCase().includes(searchLower) ||
        teacher.email.toLowerCase().includes(searchLower)
      );
    });
  }, [teachers, searchQuery]);

  const handleAddTeacher = async (newTeacher: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => {
    try {
      await addTeacher(newTeacher);
      setAddModalOpen(false);
      toast.success("Teacher Added", {
        description: `${newTeacher.firstName} ${newTeacher.lastName} has been successfully created.`,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to add teacher";
      toast.error("Error", {
        description: errorMessage,
      });
    }
  };

  const handleEditTeacher = async (updatedData: {
    id: string;
    first_name: string;
    last_name: string;
  }) => {
    try {
      await editTeacher(updatedData.id, {
        first_name: updatedData.first_name,
        last_name: updatedData.last_name,
      });
      setEditModalOpen(false);
      setSelectedTeacher(null);
      toast.success("Teacher Updated", {
        description: `${updatedData.first_name} ${updatedData.last_name} has been successfully updated.`,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update teacher";
      toast.error("Error", {
        description: errorMessage,
      });
    }
  };

  const handleDeleteTeacher = async () => {
    if (!selectedTeacher) return;
    try {
      const teacherName = `${selectedTeacher.first_name} ${selectedTeacher.last_name}`;
      await removeTeacher(selectedTeacher.id);
      setDeleteModalOpen(false);
      setSelectedTeacher(null);
      toast.success("Teacher Deleted", {
        description: `${teacherName} has been successfully deleted.`,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete teacher";
      toast.error("Error", {
        description: errorMessage,
      });
    }
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

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Search and Actions */}
        {!isLoading && (
          <div className="flex gap-4 flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={() => setAddModalOpen(true)}
              className="gap-2"
              disabled={isLoading}
            >
              <Plus className="h-4 w-4" />
              Add New Teacher
            </Button>
          </div>
        )}

        {/* Teachers Table */}
        {!isLoading && (
          <Card>
            <CardHeader>
              <CardTitle>Teachers List</CardTitle>
              <CardDescription>
                {filteredTeachers.length} teacher
                {filteredTeachers.length !== 1 ? "s" : ""} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredTeachers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-muted-foreground mb-4">
                    {searchQuery
                      ? "No teachers found matching your search."
                      : teachers.length === 0
                        ? "No teachers yet. Add your first teacher to get started."
                        : "No teachers found."}
                  </p>
                  {teachers.length === 0 && (
                    <Button
                      onClick={() => setAddModalOpen(true)}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add First Teacher
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Assigned Subjects</TableHead>
                        <TableHead>Total Students</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTeachers.map((teacher) => (
                        <TableRow key={teacher.id}>
                          <TableCell className="font-medium">
                            {teacher.first_name} {teacher.last_name}
                          </TableCell>
                          <TableCell>{teacher.email}</TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap">
                              {teacher.assignedSubjectsDetails.length > 0 ? (
                                teacher.assignedSubjectsDetails.map(
                                  (subject) => (
                                    <Badge key={subject.id} variant="secondary">
                                      {subject.courseCode}
                                    </Badge>
                                  )
                                )
                              ) : (
                                <span className="text-muted-foreground text-sm">
                                  No subjects assigned
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{teacher.totalStudents}</TableCell>
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
              )}
            </CardContent>
          </Card>
        )}

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
