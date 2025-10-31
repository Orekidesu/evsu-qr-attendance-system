"use client";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { useState } from "react";
import { Search, Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

// Static data
const PROGRAMS_DATA = [
  {
    id: 1,
    name: "BS Information Technology",
    academicYear: "2025-2026",
    subjects: 8,
    students: 45,
  },
  {
    id: 2,
    name: "BS Computer Science",
    academicYear: "2025-2026",
    subjects: 10,
    students: 52,
  },
  {
    id: 3,
    name: "BS Engineering",
    academicYear: "2025-2026",
    subjects: 12,
    students: 38,
  },
  {
    id: 4,
    name: "BS Business Administration",
    academicYear: "2024-2025",
    subjects: 7,
    students: 41,
  },
  {
    id: 5,
    name: "BS Cybersecurity",
    academicYear: "2025-2026",
    subjects: 9,
    students: 35,
  },
];

interface Program {
  id: number;
  name: string;
  academicYear: string;
  subjects: number;
  students: number;
}

interface FormData {
  name: string;
  academicYear: string;
}

export default function ProgramPage() {
  const [programs, setPrograms] = useState<Program[]>(PROGRAMS_DATA);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    academicYear: "",
  });

  const filteredPrograms = programs.filter((program) =>
    program.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddProgram = () => {
    setFormData({ name: "", academicYear: "" });
    setSelectedProgram(null);
    setIsAddModalOpen(true);
  };

  const handleEditProgram = (program: Program) => {
    setFormData({ name: program.name, academicYear: program.academicYear });
    setSelectedProgram(program);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (program: Program) => {
    setSelectedProgram(program);
    setIsDeleteModalOpen(true);
  };

  const handleSaveProgram = () => {
    if (!formData.name || !formData.academicYear) return;

    if (selectedProgram) {
      setPrograms(
        programs.map((p) =>
          p.id === selectedProgram.id
            ? { ...p, name: formData.name, academicYear: formData.academicYear }
            : p
        )
      );
      setIsEditModalOpen(false);
    } else {
      const newProgram: Program = {
        id: Math.max(...programs.map((p) => p.id), 0) + 1,
        name: formData.name,
        academicYear: formData.academicYear,
        subjects: 0,
        students: 0,
      };
      setPrograms([...programs, newProgram]);
      setIsAddModalOpen(false);
    }
  };

  const handleConfirmDelete = () => {
    if (selectedProgram) {
      setPrograms(programs.filter((p) => p.id !== selectedProgram.id));
    }
    setIsDeleteModalOpen(false);
  };
  return (
    <AdminLayout breadcrumbs={[{ label: "Programs" }]}>
      <div className="flex-1 space-y-8 p-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Programs</h1>
          <p className="text-muted-foreground">Manage all academic programs</p>
        </div>

        {/* Search and Add Button */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by program name..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={handleAddProgram} className="gap-2">
            <Plus className="h-4 w-4" />
            Add New Program
          </Button>
        </div>

        {/* Programs Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Programs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Program Name
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Academic Year
                    </th>
                    <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">
                      Subjects
                    </th>
                    <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">
                      Students
                    </th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPrograms.map((program) => (
                    <tr key={program.id} className="border-b hover:bg-muted/50">
                      <td className="h-12 px-4 align-middle">{program.name}</td>
                      <td className="h-12 px-4 align-middle">
                        {program.academicYear}
                      </td>
                      <td className="h-12 px-4 align-middle text-center">
                        {program.subjects}
                      </td>
                      <td className="h-12 px-4 align-middle text-center">
                        {program.students}
                      </td>
                      <td className="h-12 px-4 align-middle text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditProgram(program)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(program)}
                            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Add Program Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Program</DialogTitle>
              <DialogDescription>
                Enter the details for the new program
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="program-name">Program Name</Label>
                <Input
                  id="program-name"
                  placeholder="e.g., BS Information Technology"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="academic-year">Academic Year</Label>
                <Input
                  id="academic-year"
                  placeholder="e.g., 2025-2026"
                  value={formData.academicYear}
                  onChange={(e) =>
                    setFormData({ ...formData, academicYear: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveProgram}>Add Program</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Program Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Program</DialogTitle>
              <DialogDescription>Update the program details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-program-name">Program Name</Label>
                <Input
                  id="edit-program-name"
                  placeholder="e.g., BS Information Technology"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-academic-year">Academic Year</Label>
                <Input
                  id="edit-academic-year"
                  placeholder="e.g., 2025-2026"
                  value={formData.academicYear}
                  onChange={(e) =>
                    setFormData({ ...formData, academicYear: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveProgram}>Update Program</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Program</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete{" "}
                <span className="font-semibold">{selectedProgram?.name}</span>?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 rounded-lg bg-destructive/10 p-4">
              <p className="text-sm font-medium text-destructive">Warning:</p>
              <p className="text-sm text-muted-foreground">
                This will affect{" "}
                <span className="font-semibold">
                  {selectedProgram?.subjects} subjects
                </span>{" "}
                and{" "}
                <span className="font-semibold">
                  {selectedProgram?.students} students
                </span>
                .
              </p>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
