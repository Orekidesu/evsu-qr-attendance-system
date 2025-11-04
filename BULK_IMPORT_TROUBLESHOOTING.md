# Bulk Import Troubleshooting Guide

## Error: "Import completed with errors: imported:0 students. failed 3 students"

### Most Common Causes:

## 1. ❌ Missing QR_SECRET_KEY Environment Variable

**Symptom:** All students fail to import with error about QR_SECRET_KEY

**Solution:**

1. Create a `.env.local` file in the project root (if it doesn't exist)
2. Generate a secure secret key:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
3. Add to `.env.local`:
   ```env
   QR_SECRET_KEY=your_generated_secret_key_here
   ```
4. **RESTART** your development server (Ctrl+C and run `npm run dev` again)

**Why:** The QR code generation requires this secret key to create HMAC signatures. Without it, the generation fails.

---

## 2. ❌ Missing Firebase Service Account (MOST COMMON)

**Symptom:** Error "Missing or insufficient permissions" or "FirebaseError: Missing or insufficient permissions"

**Solution:**

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key" and download the JSON file
3. Open the JSON file and copy its entire contents
4. Add to `.env.local` (as a single line, minified):
   ```env
   FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"your-project",...}
   ```
5. **RESTART** your development server (Ctrl+C and run `npm run dev` again)

**Why:** The bulk import API runs server-side and needs Firebase Admin SDK with elevated permissions to bypass security rules. The service account provides these credentials.

**Alternative:** You can also use individual environment variables, but the JSON method is simpler.

---

## 3. ❌ Invalid Program ID

**Symptom:** Error "Invalid request: program_id is required"

**Solution:**

- Make sure you select a program from the dropdown in the bulk import modal before importing
- The program must exist in your Firestore database

---

## 3. ❌ CSV Format Issues

**Symptom:** Missing required fields errors

**Common Issues:**

- Excel saving with wrong encoding
- Extra commas in data
- Missing required columns
- Quotes not properly escaped

**Solution:**

1. Use the downloaded template as a base
2. Required columns: `student_id`, `first_name`, `last_name`
3. Optional column: `email`
4. Save as CSV (Comma delimited) in UTF-8 encoding

**Example of correct CSV:**

```csv
student_id,first_name,last_name,email
2025-001,Juan,Dela Cruz,juan.delacruz@example.com
2025-002,Maria,Santos,maria.santos@example.com
2025-003,Pedro,Reyes,pedro.reyes@example.com
```

---

## 4. ❌ Duplicate Students

**Symptom:** Error "Student ID 'XXX' already exists" or "Email 'XXX' already exists"

**Solution:**

- Check your existing students database
- Each `student_id` must be unique
- Each `email` must be unique (if provided)
- Remove duplicates from your CSV or database

---

## 5. ❌ Server Not Restarted After Adding .env.local

**Symptom:** Still getting QR_SECRET_KEY errors after adding the variable

**Solution:**

1. Stop the development server (Ctrl+C)
2. Run `npm run dev` again
3. Environment variables are only loaded when the server starts

---

## Debugging Steps

### Step 1: Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for detailed error messages

With the updated code, you should see logs like:

```
CSV Headers: ["student_id", "first_name", "last_name", "email"]
Parsed students: [{student_id: "2025-001", ...}]
Program ID: "abc123"
API Response: {success: true, imported: 3, failed: 0}
```

### Step 2: Check Server Terminal

Look for errors in your terminal where `npm run dev` is running:

```
Bulk import request: { studentCount: 3, program_id: 'abc123', ... }
Processing student 2: {student_id: '2025-001', ...}
Generating QR code for student: 2025-001
QR code generated: EVSU:STU:2025-001:abc12345
Student 2025-001 created successfully
Bulk import completed: {imported: 3, failed: 0, errors: []}
```

### Step 3: Verify Environment Variables

Create a test API route to check if QR_SECRET_KEY is loaded:

**File:** `src/app/api/test-env/route.ts`

```typescript
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasQRKey: !!process.env.QR_SECRET_KEY,
    keyLength: process.env.QR_SECRET_KEY?.length || 0,
  });
}
```

Visit: `http://localhost:3000/api/test-env`

Expected response:

```json
{
  "hasQRKey": true,
  "keyLength": 64
}
```

If `hasQRKey` is `false`, your `.env.local` is not being loaded.

---

## Quick Checklist

- [ ] `.env.local` file exists in project root
- [ ] `QR_SECRET_KEY` is set in `.env.local` (minimum 32 characters)
- [ ] Development server was restarted after adding `.env.local`
- [ ] CSV file uses correct headers: `student_id,first_name,last_name,email`
- [ ] All required fields (student_id, first_name, last_name) have values
- [ ] No duplicate student IDs or emails in CSV
- [ ] No duplicate student IDs or emails in existing database
- [ ] Program is selected in bulk import modal
- [ ] CSV file is UTF-8 encoded
- [ ] No empty lines in CSV except at the very end

---

## Testing Your Setup

### 1. Create Test CSV

**File:** `test-students.csv`

```csv
student_id,first_name,last_name,email
TEST-001,John,Doe,john.doe@test.com
TEST-002,Jane,Smith,jane.smith@test.com
```

### 2. Import Steps

1. Go to Students page
2. Click "Bulk Import"
3. Select a program
4. Upload `test-students.csv`
5. Click "Import Students"

### 3. Expected Results

- Toast message: "Bulk Import Successful! Successfully imported 2 student(s)."
- Students appear in the table
- Each student has a QR code in format: `EVSU:STU:TEST-001:xxxxxxxx`

---

## Still Having Issues?

Check the detailed logs:

### Browser Console Logs:

```javascript
// Should show:
CSV Headers: ["student_id", "first_name", "last_name", "email"]
Parsed students: [...]
Program ID: "..."
API Response: {...}
```

### Server Terminal Logs:

```
Bulk import request: {...}
Processing student 2: {...}
Generating QR code for student: ...
QR code generated: EVSU:STU:...:...
Student ... created successfully
Bulk import completed: {...}
```

If you see an error about `QR_SECRET_KEY`, that's the issue - follow Step 1 above.

If you see "Missing required fields", check your CSV format.

If you see "Duplicate" errors, check your database or CSV for duplicates.

---

## Common Error Messages and Fixes

| Error                                           | Cause                 | Fix                                  |
| ----------------------------------------------- | --------------------- | ------------------------------------ |
| "QR_SECRET_KEY environment variable is not set" | Missing .env.local    | Create .env.local with QR_SECRET_KEY |
| "QR_SECRET_KEY must be at least 32 characters"  | Key too short         | Generate longer key with crypto      |
| "Missing required fields"                       | Empty cells in CSV    | Fill all required fields             |
| "Student ID 'XXX' already exists"               | Duplicate in database | Use unique student IDs               |
| "Invalid request: program_id is required"       | No program selected   | Select program in modal              |
| "Invalid QR code format"                        | QR generation failed  | Check QR_SECRET_KEY is set           |

---

## Need More Help?

1. Share the exact error message from browser console
2. Share the error from server terminal
3. Share your CSV file structure (with sample data)
4. Confirm `.env.local` exists and has `QR_SECRET_KEY`
