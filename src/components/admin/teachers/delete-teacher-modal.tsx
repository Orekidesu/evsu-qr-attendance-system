"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function DeleteTeacherModal({ open, onOpenChange, teacher, onDelete }) {
  if (!teacher) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Teacher</DialogTitle>
          <DialogDescription>This action cannot be undone</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Confirm Deletion</AlertTitle>
            <AlertDescription>
              Are you sure you want to delete {teacher.firstName} {teacher.lastName}? This teacher will be removed from
              all assigned subjects.
            </AlertDescription>
          </Alert>

          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Teacher to be deleted:</p>
            <p className="font-medium">
              {teacher.firstName} {teacher.lastName}
            </p>
            <p className="text-sm text-muted-foreground">{teacher.email}</p>
          </div>

          {teacher.assignedSubjects.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-muted-foreground mb-2">Assigned Subjects (will be unassigned):</p>
              <div className="flex gap-1 flex-wrap">
                {teacher.assignedSubjects.map((subject) => (
                  <Badge key={subject} variant="outline">
                    {subject}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onDelete}>
            Delete Teacher
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
