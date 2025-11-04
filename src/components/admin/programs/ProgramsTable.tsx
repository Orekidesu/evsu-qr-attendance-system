"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Edit2, Trash2, Plus } from "lucide-react";
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
        <CardDescription>
          {programs.length} program{programs.length !== 1 ? "s" : ""} found
        </CardDescription>
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
                <tr
                  key={program.id}
                  className="border-b hover:bg-muted/50 transition-colors"
                >
                  <td className="h-12 px-4 align-middle font-medium">
                    {program.name}
                  </td>
                  <td className="h-12 px-4 align-middle">
                    <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      {program.abbreviation}
                    </span>
                  </td>
                  <td className="h-12 px-4 align-middle text-muted-foreground">
                    {program.academic_year}
                  </td>
                  <td className="h-12 px-4 align-middle text-center">
                    <span
                      className={
                        program.subjectsCount > 0
                          ? "font-medium"
                          : "text-muted-foreground"
                      }
                    >
                      {program.subjectsCount}
                    </span>
                  </td>
                  <td className="h-12 px-4 align-middle text-center">
                    <span
                      className={
                        program.studentsCount > 0
                          ? "font-medium"
                          : "text-muted-foreground"
                      }
                    >
                      {program.studentsCount}
                    </span>
                  </td>
                  <td className="h-12 px-4 align-middle text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(program)}
                        className="h-8 w-8 p-0"
                        aria-label={`Edit ${program.name}`}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(program)}
                        className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        aria-label={`Delete ${program.name}`}
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
