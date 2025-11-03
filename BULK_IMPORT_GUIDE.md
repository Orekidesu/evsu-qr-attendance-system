# Bulk Student Import Feature

## Overview

The bulk import feature allows administrators to add multiple students at once by uploading a CSV file. Each student gets a secure QR code generated automatically.

## Features Implemented

### 1. CSV Template Download

- Click "Download Template" button on Students page
- Downloads CSV with correct headers and 3 example rows
- Template format:
  ```csv
  student_id,first_name,last_name,email
  2025-001,Juan,Dela Cruz,juan.delacruz@example.com
  2025-002,Maria,Santos,maria.santos@example.com
  2025-003,Pedro,Reyes,pedro.reyes@example.com
  ```

### 2. CSV Validation

- **Required columns**: `student_id`, `first_name`, `last_name`
- **Optional columns**: `email`
- Validation checks:
  - Missing required headers
  - Unknown column headers
  - Row integrity (correct number of columns)
  - Empty required fields
  - Duplicate student IDs or emails (checks against existing database)

### 3. Bulk Import Modal

- Drag-and-drop file upload zone
- Program selection (all students assigned to selected program)
- CSV preview (first 3 rows)
- Detailed error messages with row numbers
- File size and name display
- Import progress indication

### 4. Import Processing

- Server-side validation for each student
- Duplicate checking (student_id and email)
- Secure QR code generation (EVSU:STU:id:signature format)
- Row-by-row error reporting
- Continues processing even if some students fail
- Returns detailed results: imported count, failed count, error list

### 5. Validation & UX Improvements

- **Duplicate Prevention**: Cannot add student with existing student_id or email
- **Form Validation**:
  - Email: RFC-compliant regex pattern
  - Student ID: Alphanumeric uppercase only (A-Z, 0-9, hyphens)
  - Names: Minimum 2 characters
- **Auto-formatting**:
  - Student ID: Auto-uppercase, filters non-alphanumeric
  - Email: Auto-lowercase
- **UX Enhancements**:
  - Real-time error clearing on field change
  - Enter key to submit forms
  - maxLength limits (ID: 20, names: 50, email: 100)
  - Visual feedback for valid student ID format
  - Form reset on modal close
  - Disabled states during operations

## File Structure

### New Files Created

- `src/components/admin/students/bulk-import-modal.tsx` - Upload and validation modal
- `src/app/api/students/bulk-import/route.ts` - API endpoint for processing

### Modified Files

- `src/lib/firebase/firestore/students.ts` - Added duplicate checking functions
- `src/hooks/useStudentsData.ts` - Added duplicate validation in add/edit
- `src/components/admin/students/add-student-modal.tsx` - Enhanced validation & UX
- `src/components/admin/students/students-toolbar.tsx` - Added template download & bulk import buttons
- `src/app/(dashboard)/admin/students/page.tsx` - Integrated bulk import functionality

## Usage Instructions

### For Administrators

1. **Download Template**:

   - Go to Students page
   - Click "Download Template" button
   - Open CSV file in Excel or text editor

2. **Prepare CSV Data**:

   - Fill in student information following template format
   - Required: student_id, first_name, last_name
   - Optional: email
   - Save as CSV file

3. **Import Students**:

   - Click "Bulk Import" button
   - Select program for all students
   - Drag-and-drop CSV file or click to browse
   - Review preview of first 3 rows
   - Click "Import Students"
   - View results (imported/failed counts)

4. **Handle Errors**:
   - If import fails for some students, check console for detailed errors
   - Common issues:
     - Duplicate student ID or email
     - Missing required fields
     - Invalid CSV format
   - Fix errors in CSV and re-import failed rows

### CSV Format Rules

- **Encoding**: UTF-8
- **Delimiter**: Comma (,)
- **Required Headers**: student_id, first_name, last_name
- **Optional Headers**: email
- **Student ID Format**: Alphanumeric with hyphens (e.g., 2025-001)
- **Email Format**: Valid email address
- **No Header Row Duplication**: Only one header row at the top

### Example CSV

```csv
student_id,first_name,last_name,email
2025-001,Juan,Dela Cruz,juan.delacruz@example.com
2025-002,Maria,Santos,maria.santos@example.com
2025-003,Pedro,Reyes,pedro.reyes@example.com
2025-004,Jose,Garcia,jose.garcia@example.com
```

## Security Features

- All QR codes generated with HMAC signatures
- QR format: `EVSU:STU:<student_id>:<signature>`
- Server-side generation prevents forgery
- Duplicate checking prevents data conflicts
- Validation at multiple layers (client, API, database)

## Error Handling

### Import Response Format

```json
{
  "success": true,
  "imported": 3,
  "failed": 1,
  "errors": [
    {
      "row": 5,
      "student_id": "2025-005",
      "error": "Student ID '2025-005' is already registered"
    }
  ]
}
```

### Common Error Messages

- "Student ID 'X' is already registered" - Duplicate student_id
- "Email 'X' is already registered to another student" - Duplicate email
- "Missing required column: X" - CSV missing required header
- "Row X: Missing Y" - Empty required field in row
- "Row X: Expected N columns, got M" - Incorrect number of columns

## API Endpoint

### POST /api/students/bulk-import

**Request Body**:

```json
{
  "students": [
    {
      "student_id": "2025-001",
      "first_name": "Juan",
      "last_name": "Dela Cruz",
      "email": "juan.delacruz@example.com"
    }
  ],
  "program_id": "program-doc-id"
}
```

**Response**:

```json
{
  "success": true,
  "imported": 10,
  "failed": 2,
  "errors": [
    {
      "row": 5,
      "student_id": "2025-005",
      "error": "Duplicate student_id"
    },
    {
      "row": 8,
      "student_id": "2025-008",
      "error": "Invalid email format"
    }
  ]
}
```

## Testing Checklist

- [ ] Download CSV template
- [ ] Upload valid CSV file
- [ ] Upload CSV with missing required columns
- [ ] Upload CSV with duplicate student IDs
- [ ] Upload CSV with invalid email formats
- [ ] Upload CSV with empty required fields
- [ ] Verify all imported students have secure QR codes
- [ ] Verify duplicate prevention works during import
- [ ] Test with large CSV files (100+ rows)
- [ ] Verify error messages are clear and actionable
- [ ] Test drag-and-drop upload
- [ ] Test file browser upload
- [ ] Verify students refresh after import

## Future Enhancements

- [ ] Add progress bar for large imports
- [ ] Export failed rows as CSV for correction
- [ ] Support for updating existing students via CSV
- [ ] Batch QR code download after import
- [ ] Import history/audit log
- [ ] Email validation during import
- [ ] Automatic program assignment based on student ID pattern
