/**
 * Enrollment Validation Utilities
 * Provides comprehensive validation logic for student enrollments
 */

import type { Subject, Schedule } from "@/lib/types/subject";
import type { Student } from "@/lib/types/student";
import type { Enrollment } from "@/lib/types/enrollment";

export interface ValidationError {
  type:
    | "ALREADY_ENROLLED"
    | "PROGRAM_MISMATCH"
    | "SCHEDULE_CONFLICT"
    | "MAX_UNITS_EXCEEDED"
    | "DUPLICATE_SUBJECT"
    | "INVALID_DATA";
  message: string;
  details?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Parse time string to minutes since midnight for comparison
 */
function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Check if two time ranges overlap
 */
function timeRangesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const start1Min = timeToMinutes(start1);
  const end1Min = timeToMinutes(end1);
  const start2Min = timeToMinutes(start2);
  const end2Min = timeToMinutes(end2);

  // Two ranges overlap if one starts before the other ends
  return start1Min < end2Min && start2Min < end1Min;
}

/**
 * Check if two schedules have overlapping days
 */
function daysOverlap(days1: string[], days2: string[]): boolean {
  return days1.some((day) => days2.includes(day));
}

/**
 * Check if two schedules conflict with each other
 */
export function schedulesConflict(
  schedule1: Schedule,
  schedule2: Schedule
): boolean {
  // Check if days overlap
  if (!daysOverlap(schedule1.days, schedule2.days)) {
    return false;
  }

  // Check if time ranges overlap
  return timeRangesOverlap(
    schedule1.time_start,
    schedule1.time_end,
    schedule2.time_start,
    schedule2.time_end
  );
}

/**
 * Check if a subject's schedules conflict with any existing subject schedules
 */
export function hasScheduleConflict(
  newSubject: Subject,
  existingSubjects: Subject[]
): { hasConflict: boolean; conflictingSubject?: Subject } {
  for (const existingSubject of existingSubjects) {
    // Check each schedule of the new subject against each schedule of existing subjects
    for (const newSchedule of newSubject.schedules) {
      for (const existingSchedule of existingSubject.schedules) {
        if (schedulesConflict(newSchedule, existingSchedule)) {
          return {
            hasConflict: true,
            conflictingSubject: existingSubject,
          };
        }
      }
    }
  }

  return { hasConflict: false };
}

/**
 * Format schedule for display
 */
export function formatSchedule(schedule: Schedule): string {
  const days = schedule.days.join(", ");
  return `${days} ${schedule.time_start}-${schedule.time_end}`;
}

/**
 * Format all schedules of a subject
 */
export function formatSubjectSchedules(subject: Subject): string {
  return subject.schedules.map(formatSchedule).join("; ");
}

/**
 * Calculate total units/hours for a student's enrolled subjects
 * Assumes 1 hour per subject per week (can be customized)
 */
export function calculateTotalUnits(subjects: Subject[]): number {
  let totalHours = 0;

  for (const subject of subjects) {
    for (const schedule of subject.schedules) {
      const startMin = timeToMinutes(schedule.time_start);
      const endMin = timeToMinutes(schedule.time_end);
      const hours = (endMin - startMin) / 60;
      totalHours += hours;
    }
  }

  return totalHours;
}

/**
 * Validate a single enrollment
 */
export function validateEnrollment(
  student: Student,
  newSubject: Subject,
  existingEnrollments: Enrollment[],
  allSubjects: Subject[],
  options: {
    maxUnitsPerStudent?: number; // e.g., 24 units max
    allowDuplicateSubjects?: boolean;
  } = {}
): ValidationResult {
  const errors: ValidationError[] = [];
  const { maxUnitsPerStudent = 30, allowDuplicateSubjects = false } = options;

  // 1. Check if student is already enrolled in this subject
  const alreadyEnrolled = existingEnrollments.some(
    (e) => e.student_id === student.id && e.subject_id === newSubject.id
  );

  if (alreadyEnrolled) {
    errors.push({
      type: "ALREADY_ENROLLED",
      message: "Student is already enrolled in this subject",
      details: `${student.first_name} ${student.last_name} is already enrolled in ${newSubject.course_code}`,
    });
  }

  // 2. Check program match
  if (student.program_id !== newSubject.program_id) {
    errors.push({
      type: "PROGRAM_MISMATCH",
      message: "Subject does not belong to student's program",
      details: `${newSubject.course_code} is not available for the student's program`,
    });
  }

  // 3. Get all subjects the student is already enrolled in
  const studentEnrollments = existingEnrollments.filter(
    (e) => e.student_id === student.id
  );

  const enrolledSubjects = studentEnrollments
    .map((e) => allSubjects.find((s) => s.id === e.subject_id))
    .filter((s): s is Subject => s !== undefined);

  // 4. Check for duplicate course codes (if not allowed)
  if (!allowDuplicateSubjects) {
    const hasDuplicate = enrolledSubjects.some(
      (s) => s.course_code === newSubject.course_code
    );

    if (hasDuplicate) {
      errors.push({
        type: "DUPLICATE_SUBJECT",
        message:
          "Student is already enrolled in a subject with the same course code",
        details: `Course code ${newSubject.course_code} is already in student's schedule`,
      });
    }
  }

  // 5. Check for schedule conflicts
  const scheduleConflict = hasScheduleConflict(newSubject, enrolledSubjects);

  if (scheduleConflict.hasConflict && scheduleConflict.conflictingSubject) {
    const conflictingSubject = scheduleConflict.conflictingSubject;
    errors.push({
      type: "SCHEDULE_CONFLICT",
      message: "Schedule conflict detected",
      details: `${newSubject.course_code} (${formatSubjectSchedules(newSubject)}) conflicts with ${conflictingSubject.course_code} (${formatSubjectSchedules(conflictingSubject)})`,
    });
  }

  // 6. Check maximum units limit
  const currentUnits = calculateTotalUnits(enrolledSubjects);
  const newSubjectUnits = calculateTotalUnits([newSubject]);
  const totalUnits = currentUnits + newSubjectUnits;

  if (totalUnits > maxUnitsPerStudent) {
    errors.push({
      type: "MAX_UNITS_EXCEEDED",
      message: "Maximum unit limit exceeded",
      details: `Total units would be ${totalUnits.toFixed(1)} hours/week (max: ${maxUnitsPerStudent}). Current: ${currentUnits.toFixed(1)}, Adding: ${newSubjectUnits.toFixed(1)}`,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate multiple enrollments (bulk enrollment)
 */
export function validateBulkEnrollment(
  students: Student[],
  subject: Subject,
  existingEnrollments: Enrollment[],
  allSubjects: Subject[],
  options?: {
    maxUnitsPerStudent?: number;
    allowDuplicateSubjects?: boolean;
  }
): Map<string, ValidationResult> {
  const results = new Map<string, ValidationResult>();

  for (const student of students) {
    const result = validateEnrollment(
      student,
      subject,
      existingEnrollments,
      allSubjects,
      options
    );
    results.set(student.id, result);
  }

  return results;
}

/**
 * Get summary of validation results
 */
export function getValidationSummary(
  validationResults: Map<string, ValidationResult>
): {
  totalStudents: number;
  validCount: number;
  invalidCount: number;
  errorsByType: Record<string, number>;
} {
  let validCount = 0;
  let invalidCount = 0;
  const errorsByType: Record<string, number> = {};

  validationResults.forEach((result) => {
    if (result.isValid) {
      validCount++;
    } else {
      invalidCount++;
      result.errors.forEach((error) => {
        errorsByType[error.type] = (errorsByType[error.type] || 0) + 1;
      });
    }
  });

  return {
    totalStudents: validationResults.size,
    validCount,
    invalidCount,
    errorsByType,
  };
}
