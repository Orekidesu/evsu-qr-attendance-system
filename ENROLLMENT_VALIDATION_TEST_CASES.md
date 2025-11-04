# Enrollment Validation Test Cases

## Overview

The enrollment system now includes comprehensive validation logic to prevent conflicts and ensure data integrity. This document outlines all validation rules and test cases.

## Validation Rules Implemented

### 1. **Duplicate Enrollment Prevention**

**Rule**: A student cannot be enrolled in the same subject twice.

**Test Cases**:

- ✅ Enroll student A in Subject 101
- ❌ Attempt to enroll student A in Subject 101 again
- **Expected**: Error message "Student is already enrolled in this subject"

### 2. **Program Mismatch Detection**

**Rule**: Students can only enroll in subjects that belong to their program.

**Test Cases**:

- ✅ BSIT student enrolling in BSIT subjects
- ❌ BSIT student attempting to enroll in BSCS subjects
- **Expected**: Error "Subject does not belong to student's program"

### 3. **Schedule Conflict Detection** ⭐ NEW

**Rule**: Students cannot enroll in subjects with overlapping schedules.

**Test Scenarios**:

#### Scenario A: Same Day, Overlapping Time

- Subject A: Monday/Wednesday 8:00-10:00
- Subject B: Monday 9:00-11:00
- **Result**: ❌ CONFLICT (Monday overlaps)

#### Scenario B: Same Day, Adjacent Time (No Conflict)

- Subject A: Monday 8:00-10:00
- Subject B: Monday 10:00-12:00
- **Result**: ✅ NO CONFLICT (times don't overlap)

#### Scenario C: Different Days

- Subject A: Monday/Wednesday 8:00-10:00
- Subject B: Tuesday/Thursday 8:00-10:00
- **Result**: ✅ NO CONFLICT (different days)

#### Scenario D: Multiple Schedules

- Subject A: Monday 8:00-10:00, Wednesday 14:00-16:00
- Subject B: Monday 9:00-11:00, Friday 10:00-12:00
- **Result**: ❌ CONFLICT (Monday times overlap)

### 4. **Maximum Units/Hours Limit**

**Rule**: Students cannot exceed maximum weekly contact hours (default: 30 hours/week).

**Test Cases**:

- Student has 25 hours enrolled
- Attempting to add subject with 6 hours
- Total would be 31 hours
- **Expected**: Error "Maximum unit limit exceeded" with breakdown

### 5. **Duplicate Course Code Prevention**

**Rule**: Students cannot enroll in multiple subjects with the same course code (prevents retaking).

**Test Cases**:

- ✅ Student enrolled in "IT101-A"
- ❌ Student attempts to enroll in "IT101-B" (same course code)
- **Expected**: Error "Already enrolled in subject with same course code"

## Bulk Enrollment Validation

### Pre-Validation Process

When using bulk enrollment, the system:

1. Validates ALL selected students before enrollment
2. Shows a detailed validation report
3. Groups errors by type
4. Allows proceeding with only valid students

### Validation Summary Display

```
Validation Issues Detected
12 of 25 student(s) cannot be enrolled.
Issues: SCHEDULE_CONFLICT: 8, ALREADY_ENROLLED: 3, MAX_UNITS_EXCEEDED: 1
```

### Detailed Error Report

Each invalid student shows:

- Student name and ID
- List of all validation errors
- Specific details (e.g., which subject conflicts)

## How to Use the Validation Features

### Individual Enrollment

1. Select a student
2. Select a subject (automatically filtered to student's program)
3. Click "Enroll Student"
4. System validates automatically
5. Shows error if validation fails

### Bulk Enrollment with Validation

1. Go to "Enroll by Subject" tab
2. Select a subject
3. Select multiple students
4. Click **"Validate Selection"** button (new feature)
5. Review validation results in dialog
6. Click "Proceed with X Student(s)" to enroll only valid students
7. Or close and adjust selection

### Bulk Enrollment without Pre-Validation

1. Follow steps 1-3 above
2. Click **"Enroll Selected Students"** button
3. System validates during enrollment
4. Shows summary toast with results

## Configuration Options

### Adjustable Settings

```typescript
// In useEnrollmentsData.ts
await enrollStudent(data, {
  skipValidation: false, // Set true to bypass validation
  maxUnitsPerStudent: 30, // Adjust maximum hours limit
});

await enrollMultipleStudents(inputs, {
  validateBeforeEnroll: true, // Pre-validate before attempting
  maxUnitsPerStudent: 30, // Maximum hours limit
  showDetailedErrors: true, // Show detailed error breakdown
});
```

## Test Data Examples

### Example 1: Schedule Conflict

```typescript
// Subject 1: Database Systems
schedules: [{ days: ["Mon", "Wed"], time_start: "08:00", time_end: "10:00" }];

// Subject 2: Web Development
schedules: [{ days: ["Mon", "Fri"], time_start: "09:00", time_end: "11:00" }];

// Result: CONFLICT on Monday 09:00-10:00
```

### Example 2: No Conflict (Different Times)

```typescript
// Subject 1: Morning Class
schedules: [{ days: ["Mon", "Wed"], time_start: "08:00", time_end: "10:00" }];

// Subject 2: Afternoon Class
schedules: [{ days: ["Mon", "Wed"], time_start: "14:00", time_end: "16:00" }];

// Result: NO CONFLICT (same days but different times)
```

### Example 3: Maximum Units Exceeded

```
Current enrollments:
- Subject A: 3 hours/week
- Subject B: 5 hours/week
- Subject C: 4 hours/week
- Subject D: 6 hours/week
- Subject E: 8 hours/week
- Subject F: 5 hours/week
Total: 31 hours

Attempting to add Subject G: 3 hours/week
Total would be: 34 hours
Result: ❌ CONFLICT (exceeds 30 hour limit)
```

## Error Messages Reference

| Error Type           | User Message                                        | Details Shown                     |
| -------------------- | --------------------------------------------------- | --------------------------------- |
| `ALREADY_ENROLLED`   | "Student is already enrolled in this subject"       | Student name, subject code        |
| `PROGRAM_MISMATCH`   | "Subject does not belong to student's program"      | Subject code, program names       |
| `SCHEDULE_CONFLICT`  | "Schedule conflict detected"                        | Both subject codes and schedules  |
| `MAX_UNITS_EXCEEDED` | "Maximum unit limit exceeded"                       | Current, adding, total, max limit |
| `DUPLICATE_SUBJECT`  | "Already enrolled in subject with same course code" | Course code                       |

## Testing Checklist

### Manual Testing Steps

#### ✅ Basic Validation

- [ ] Try enrolling same student twice in same subject
- [ ] Try enrolling student in wrong program's subject
- [ ] Verify program filter works in subject dropdown

#### ✅ Schedule Conflict Testing

- [ ] Create two subjects with overlapping schedules
- [ ] Enroll student in first subject
- [ ] Attempt to enroll in second subject
- [ ] Verify conflict is detected and detailed message shown
- [ ] Create subjects with adjacent times (no overlap)
- [ ] Verify these can be enrolled without conflict

#### ✅ Bulk Enrollment

- [ ] Select 10 students for a subject
- [ ] Include mix of valid and invalid students
- [ ] Click "Validate Selection"
- [ ] Review validation dialog
- [ ] Verify error details are accurate
- [ ] Proceed with valid students only
- [ ] Confirm only valid students were enrolled

#### ✅ Maximum Units

- [ ] Enroll student in multiple subjects (>25 hours)
- [ ] Attempt to add subject that would exceed 30 hours
- [ ] Verify error shows breakdown of hours

#### ✅ Edge Cases

- [ ] Subject with multiple schedule entries
- [ ] Student with no existing enrollments
- [ ] Bulk enroll with all students already enrolled
- [ ] Bulk enroll with all students having conflicts

## API Reference

### Validation Functions

#### `validateEnrollment()`

```typescript
function validateEnrollment(
  student: Student,
  newSubject: Subject,
  existingEnrollments: Enrollment[],
  allSubjects: Subject[],
  options?: {
    maxUnitsPerStudent?: number;
    allowDuplicateSubjects?: boolean;
  }
): ValidationResult;
```

#### `validateBulkEnrollment()`

```typescript
function validateBulkEnrollment(
  students: Student[],
  subject: Subject,
  existingEnrollments: Enrollment[],
  allSubjects: Subject[],
  options?: {
    maxUnitsPerStudent?: number;
    allowDuplicateSubjects?: boolean;
  }
): Map<string, ValidationResult>;
```

#### `schedulesConflict()`

```typescript
function schedulesConflict(schedule1: Schedule, schedule2: Schedule): boolean;
```

## Future Enhancements

### Potential Additional Validations

1. **Prerequisites Check**: Verify student completed required subjects
2. **Year Level Restriction**: Ensure students enroll in appropriate level subjects
3. **Semester Limits**: Different max units for different semesters
4. **Lab vs Lecture**: Ensure lab and lecture sections are taken together
5. **Teacher Load**: Validate teacher isn't assigned too many subjects
6. **Room Conflicts**: Prevent double-booking of rooms
7. **Minimum Units**: Enforce minimum units for full-time students

## Performance Considerations

- Schedule conflict detection: O(n\*m) where n = enrolled subjects, m = new subject schedules
- Validation runs client-side for instant feedback
- Bulk validation optimized to run once for all students
- Results cached during bulk enrollment process

## Troubleshooting

### Common Issues

**Issue**: Validation not triggering

- **Solution**: Ensure `skipValidation` is not set to `true`

**Issue**: Incorrect schedule conflict detection

- **Solution**: Verify time format is "HH:MM" (e.g., "08:00" not "8:00")

**Issue**: Max units limit incorrect

- **Solution**: Check `maxUnitsPerStudent` option, default is 30 hours

**Issue**: Validation dialog not showing

- **Solution**: Check browser console for errors, verify component imports

## Summary

The enrollment validation system provides:

- ✅ **6 types of validation rules**
- ✅ **Schedule conflict detection** (new feature)
- ✅ **Pre-validation for bulk enrollments**
- ✅ **Detailed error reporting**
- ✅ **Configurable limits and options**
- ✅ **User-friendly error messages**

All validations are applied automatically to both individual and bulk enrollments, ensuring data integrity and preventing scheduling conflicts.
