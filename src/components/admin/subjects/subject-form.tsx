"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus } from "lucide-react";
import type { Program } from "@/lib/types/program";
import type { User } from "@/lib/types/user";

interface Schedule {
  id: string;
  days: string[];
  startTime: string;
  endTime: string;
}

interface SubjectFormData {
  courseCode: string;
  title: string;
  program: string;
  teacher: string;
  schedules: Schedule[];
}

interface SubjectFormProps {
  initialData?: SubjectFormData;
  onSubmit: (data: SubjectFormData) => void;
  onCancel: () => void;
  isEdit?: boolean;
  programs: Program[];
  teachers: User[];
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function SubjectForm({
  initialData,
  onSubmit,
  onCancel,
  isEdit,
  programs,
  teachers,
}: SubjectFormProps) {
  const [courseCode, setCourseCode] = useState(initialData?.courseCode || "");
  const [title, setTitle] = useState(initialData?.title || "");
  const [program, setProgram] = useState(initialData?.program || "");
  const [teacher, setTeacher] = useState(initialData?.teacher || "");
  const [schedules, setSchedules] = useState<Schedule[]>(
    initialData?.schedules || []
  );
  const [errors, setErrors] = useState<{
    courseCode?: string;
    title?: string;
    program?: string;
    teacher?: string;
    schedules?: string;
  }>({});

  const handleAddSchedule = () => {
    const newSchedule: Schedule = {
      id: Date.now().toString(),
      days: [],
      startTime: "08:00",
      endTime: "10:00",
    };
    setSchedules([...schedules, newSchedule]);
  };

  const handleRemoveSchedule = (id: string) => {
    setSchedules(schedules.filter((s) => s.id !== id));
  };

  const handleScheduleDayToggle = (scheduleId: string, day: string) => {
    setSchedules(
      schedules.map((s) =>
        s.id === scheduleId
          ? {
              ...s,
              days: s.days.includes(day)
                ? s.days.filter((d) => d !== day)
                : [...s.days, day],
            }
          : s
      )
    );
  };

  const handleScheduleTimeChange = (
    scheduleId: string,
    field: "startTime" | "endTime",
    value: string
  ) => {
    setSchedules(
      schedules.map((s) => (s.id === scheduleId ? { ...s, [field]: value } : s))
    );
  };

  const validateForm = (): boolean => {
    const newErrors: {
      courseCode?: string;
      title?: string;
      program?: string;
      teacher?: string;
      schedules?: string;
    } = {};

    // Course code validation
    if (!courseCode.trim()) {
      newErrors.courseCode = "Course code is required";
    } else if (courseCode.trim().length < 2) {
      newErrors.courseCode = "Course code must be at least 2 characters";
    } else if (!/^[A-Z0-9\s-]+$/i.test(courseCode)) {
      newErrors.courseCode =
        "Course code can only contain letters, numbers, spaces, and hyphens";
    }

    // Title validation
    if (!title.trim()) {
      newErrors.title = "Descriptive title is required";
    } else if (title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    }

    // Program validation
    if (!program) {
      newErrors.program = "Please select a program";
    }

    // Teacher validation
    if (!teacher) {
      newErrors.teacher = "Please assign a teacher";
    }

    // Schedule validation
    if (schedules.length === 0) {
      newErrors.schedules = "At least one schedule is required";
    } else {
      // Validate each schedule
      for (let i = 0; i < schedules.length; i++) {
        const schedule = schedules[i];

        if (schedule.days.length === 0) {
          newErrors.schedules = `Schedule ${i + 1}: Please select at least one day`;
          break;
        }

        if (!schedule.startTime || !schedule.endTime) {
          newErrors.schedules = `Schedule ${i + 1}: Start and end times are required`;
          break;
        }

        if (schedule.startTime >= schedule.endTime) {
          newErrors.schedules = `Schedule ${i + 1}: End time must be after start time`;
          break;
        }

        // Check for duplicate schedules (same days and overlapping times)
        for (let j = i + 1; j < schedules.length; j++) {
          const otherSchedule = schedules[j];
          const dayOverlap = schedule.days.some((day) =>
            otherSchedule.days.includes(day)
          );

          if (dayOverlap) {
            const timeOverlap =
              (schedule.startTime >= otherSchedule.startTime &&
                schedule.startTime < otherSchedule.endTime) ||
              (schedule.endTime > otherSchedule.startTime &&
                schedule.endTime <= otherSchedule.endTime) ||
              (schedule.startTime <= otherSchedule.startTime &&
                schedule.endTime >= otherSchedule.endTime);

            if (timeOverlap) {
              const conflictDays = schedule.days.filter((day) =>
                otherSchedule.days.includes(day)
              );
              newErrors.schedules = `Duplicate schedule detected: Schedules ${i + 1} and ${
                j + 1
              } overlap on ${conflictDays.join(", ")}`;
              break;
            }
          }
        }

        if (newErrors.schedules) break;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    onSubmit({
      courseCode: courseCode.trim(),
      title: title.trim(),
      program,
      teacher,
      schedules,
    });
  };

  return (
    <div className="space-y-6">
      {/* Course Code and Title */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label
            htmlFor="courseCode"
            className="mb-2 block text-sm font-semibold"
          >
            Course Code <span className="text-red-500">*</span>
          </Label>
          <Input
            id="courseCode"
            placeholder="e.g., IT101"
            value={courseCode}
            onChange={(e) => {
              setCourseCode(e.target.value);
              if (errors.courseCode) {
                setErrors({ ...errors, courseCode: undefined });
              }
            }}
            className={errors.courseCode ? "border-red-500" : ""}
          />
          {errors.courseCode && (
            <p className="text-sm text-red-500 mt-1">{errors.courseCode}</p>
          )}
        </div>
        <div>
          <Label htmlFor="title" className="mb-2 block text-sm font-semibold">
            Descriptive Title <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            placeholder="e.g., Intro to Programming"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) {
                setErrors({ ...errors, title: undefined });
              }
            }}
            className={errors.title ? "border-red-500" : ""}
          />
          {errors.title && (
            <p className="text-sm text-red-500 mt-1">{errors.title}</p>
          )}
        </div>
      </div>

      {/* Program and Teacher */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="program" className="mb-2 block text-sm font-semibold">
            Select Program <span className="text-red-500">*</span>
          </Label>
          <Select value={program} onValueChange={setProgram}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a program" />
            </SelectTrigger>
            <SelectContent>
              {programs.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.abbreviation}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.program && (
            <p className="text-sm text-red-500 mt-1">{errors.program}</p>
          )}
        </div>
        <div>
          <Label htmlFor="teacher" className="mb-2 block text-sm font-semibold">
            Assign Teacher <span className="text-red-500">*</span>
          </Label>
          <Select
            value={teacher}
            onValueChange={(value) => {
              setTeacher(value);
              if (errors.teacher) {
                setErrors({ ...errors, teacher: undefined });
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a teacher" />
            </SelectTrigger>
            <SelectContent>
              {teachers.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.first_name} {t.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.teacher && (
            <p className="text-sm text-red-500 mt-1">{errors.teacher}</p>
          )}
        </div>
      </div>

      {/* Schedules */}
      <div>
        <Label className="mb-4 block text-sm font-semibold">
          Schedules <span className="text-red-500">*</span>
        </Label>
        {errors.schedules && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errors.schedules}</p>
          </div>
        )}
        <div className="space-y-4">
          {schedules.map((schedule) => (
            <div key={schedule.id} className="border rounded-lg p-4 space-y-3">
              {/* Days */}
              <div>
                <Label className="text-xs font-semibold mb-2 block">Days</Label>
                <div className="flex flex-wrap gap-3">
                  {DAYS.map((day) => (
                    <div key={day} className="flex items-center gap-2">
                      <Checkbox
                        id={`day-${schedule.id}-${day}`}
                        checked={schedule.days.includes(day)}
                        onCheckedChange={() =>
                          handleScheduleDayToggle(schedule.id, day)
                        }
                      />
                      <label
                        htmlFor={`day-${schedule.id}-${day}`}
                        className="text-sm cursor-pointer"
                      >
                        {day}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Times */}
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <Label
                    htmlFor={`start-${schedule.id}`}
                    className="text-xs font-semibold mb-1 block"
                  >
                    Start Time
                  </Label>
                  <input
                    id={`start-${schedule.id}`}
                    type="time"
                    value={schedule.startTime}
                    onChange={(e) =>
                      handleScheduleTimeChange(
                        schedule.id,
                        "startTime",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                </div>
                <div>
                  <Label
                    htmlFor={`end-${schedule.id}`}
                    className="text-xs font-semibold mb-1 block"
                  >
                    End Time
                  </Label>
                  <input
                    id={`end-${schedule.id}`}
                    type="time"
                    value={schedule.endTime}
                    onChange={(e) =>
                      handleScheduleTimeChange(
                        schedule.id,
                        "endTime",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                </div>
              </div>

              {/* Remove Button */}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleRemoveSchedule(schedule.id)}
                className="w-full gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Remove Schedule
              </Button>
            </div>
          ))}

          <Button
            variant="outline"
            onClick={handleAddSchedule}
            className="w-full gap-2 bg-transparent"
          >
            <Plus className="w-4 h-4" />
            Add Another Schedule
          </Button>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 justify-end pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>
          {isEdit ? "Update Subject" : "Create Subject"}
        </Button>
      </div>
    </div>
  );
}
