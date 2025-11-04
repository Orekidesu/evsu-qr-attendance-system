import { NextRequest, NextResponse } from "next/server";
import { generateSecureQRCode } from "@/lib/qr/validator";
import {
  createStudentAdmin,
  checkStudentExistsAdmin,
} from "@/lib/firebase/firestore/students.admin";

interface BulkImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: Array<{
    row: number;
    student_id: string;
    error: string;
  }>;
}

/**
 * POST /api/students/bulk-import
 * Import multiple students from CSV data
 *
 * Request body:
 * {
 *   students: BulkStudentInput[],
 *   program_id: string
 * }
 *
 * Response:
 * {
 *   success: true,
 *   imported: 5,
 *   failed: 2,
 *   errors: [...]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { students, program_id } = body;

    console.log("Bulk import request:", {
      studentCount: students?.length,
      program_id,
      firstStudent: students?.[0],
    });

    if (!Array.isArray(students) || students.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request: students array is required",
        },
        { status: 400 }
      );
    }

    if (!program_id || typeof program_id !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request: program_id is required",
        },
        { status: 400 }
      );
    }

    const result: BulkImportResult = {
      success: true,
      imported: 0,
      failed: 0,
      errors: [],
    };

    // Process each student
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const rowNumber = i + 2; // +2 because Excel/CSV starts at 1 and we have a header row

      try {
        console.log(`Processing student ${rowNumber}:`, student);

        // Validate required fields
        if (!student.student_id || !student.first_name || !student.last_name) {
          result.failed++;
          result.errors.push({
            row: rowNumber,
            student_id: student.student_id || "N/A",
            error:
              "Missing required fields (student_id, first_name, or last_name)",
          });
          console.log(`Row ${rowNumber} failed: Missing required fields`);
          continue;
        }

        // Check for duplicates
        const duplicateCheck = await checkStudentExistsAdmin(
          student.student_id,
          student.email
        );

        if (duplicateCheck.exists) {
          const field =
            duplicateCheck.field === "student_id" ? "Student ID" : "Email";
          const value =
            duplicateCheck.field === "student_id"
              ? student.student_id
              : student.email;
          result.failed++;
          result.errors.push({
            row: rowNumber,
            student_id: student.student_id,
            error: `${field} "${value}" already exists`,
          });
          console.log(`Row ${rowNumber} failed: Duplicate ${field}`);
          continue;
        }

        // Generate QR code
        console.log(`Generating QR code for student: ${student.student_id}`);
        const qrCode = generateSecureQRCode(student.student_id);
        console.log(`QR code generated: ${qrCode}`);

        // Create student
        await createStudentAdmin({
          student_id: student.student_id,
          first_name: student.first_name,
          last_name: student.last_name,
          email: student.email || "",
          program_id: program_id,
          qr_code: qrCode,
        });

        console.log(`Student ${student.student_id} created successfully`);
        result.imported++;
      } catch (error) {
        console.error(`Error importing student at row ${rowNumber}:`, error);
        result.failed++;
        result.errors.push({
          row: rowNumber,
          student_id: student.student_id || "N/A",
          error:
            error instanceof Error ? error.message : "Unknown error occurred",
        });
      }
    }

    console.log("Bulk import completed:", result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Bulk import error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to process bulk import",
      },
      { status: 500 }
    );
  }
}
