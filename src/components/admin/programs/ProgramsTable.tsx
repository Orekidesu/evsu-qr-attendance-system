"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit2, Trash2 } from "lucide-react";
import type { Program } from "@/lib/types/program";

interface ProgramWithCounts extends Program {
  subjectsCount: number;
  studentsCount: number;
}

interface ProgramsTableProps {
  programs: ProgramWithCounts[];
  onEdit: (program: ProgramWithCounts) => void;
  onDelete: (program: ProgramWithCounts) => void;
}

export function ProgramsTable({
  programs,
  onEdit,
  onDelete,
}: ProgramsTableProps) {
  if (programs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>All Programs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-2">No programs found</p>
            <p className="text-sm text-muted-foreground">
              Add your first program to get started
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
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
                  Abbreviation
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
              {programs.map((program) => (
                <tr key={program.id} className="border-b hover:bg-muted/50">
                  <td className="h-12 px-4 align-middle">{program.name}</td>
                  <td className="h-12 px-4 align-middle">
                    {program.abbreviation}
                  </td>
                  <td className="h-12 px-4 align-middle">
                    {program.academic_year}
                  </td>
                  <td className="h-12 px-4 align-middle text-center">
                    {program.subjectsCount}
                  </td>
                  <td className="h-12 px-4 align-middle text-center">
                    {program.studentsCount}
                  </td>
                  <td className="h-12 px-4 align-middle text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(program)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(program)}
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
  );
}
