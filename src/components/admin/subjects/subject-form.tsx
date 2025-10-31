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

  const handleSubmit = () => {
    if (
      !courseCode ||
      !title ||
      !program ||
      !teacher ||
      schedules.length === 0
    ) {
      alert("Please fill all fields and add at least one schedule");
      return;
    }

    onSubmit({
      courseCode,
      title,
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
            Course Code
          </Label>
          <Input
            id="courseCode"
            placeholder="e.g., IT101"
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="title" className="mb-2 block text-sm font-semibold">
            Descriptive Title
          </Label>
          <Input
            id="title"
            placeholder="e.g., Intro to Programming"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
      </div>

      {/* Program and Teacher */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="program" className="mb-2 block text-sm font-semibold">
            Select Program
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
        </div>
        <div>
          <Label htmlFor="teacher" className="mb-2 block text-sm font-semibold">
            Assign Teacher
          </Label>
          <Select value={teacher} onValueChange={setTeacher}>
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
        </div>
      </div>

      {/* Schedules */}
      <div>
        <Label className="mb-4 block text-sm font-semibold">Schedules</Label>
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
