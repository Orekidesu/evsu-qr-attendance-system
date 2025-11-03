import { NextRequest, NextResponse } from "next/server";
import { regenerateQRCode } from "@/lib/qr/validator";
import { updateStudentAdmin } from "@/lib/firebase/firestore/students.admin";

/**
 * POST /api/qr/regenerate
 * Regenerate a QR code for a student (useful if compromised)
 * Also updates the student's record in Firestore
 *
 * Request body:
 * {
 *   studentId: string,
 *   firebaseDocId: string  // The Firebase document ID (not student_id)
 * }
 *
 * Response:
 * {
 *   success: true,
 *   qrCode: "EVSU:STU:2025001:xyz789xy"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, firebaseDocId } = body;

    // Validate input
    if (!studentId || typeof studentId !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Student ID is required and must be a string",
        },
        { status: 400 }
      );
    }

    if (!firebaseDocId || typeof firebaseDocId !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Firebase document ID is required",
        },
        { status: 400 }
      );
    }

    // Regenerate QR code
    const newQRCode = regenerateQRCode(studentId);

    // Update student record in Firestore using Admin SDK
    await updateStudentAdmin(firebaseDocId, { qr_code: newQRCode });

    return NextResponse.json({
      success: true,
      qrCode: newQRCode,
      message: "QR code regenerated successfully",
    });
  } catch (error) {
    console.error("Error regenerating QR code:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to regenerate QR code",
      },
      { status: 500 }
    );
  }
}
