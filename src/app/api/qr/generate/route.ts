import { NextRequest, NextResponse } from "next/server";
import { generateSecureQRCode } from "@/lib/qr/validator";

/**
 * POST /api/qr/generate
 * Generate a secure QR code with HMAC signature
 *
 * Request body:
 * {
 *   studentId: string
 * }
 *
 * Response:
 * {
 *   success: true,
 *   qrCode: "EVSU:STU:2025001:abc123ab"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId } = body;

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

    if (studentId.trim() === "") {
      return NextResponse.json(
        {
          success: false,
          error: "Student ID cannot be empty",
        },
        { status: 400 }
      );
    }

    // Generate secure QR code
    const qrCode = generateSecureQRCode(studentId);

    return NextResponse.json({
      success: true,
      qrCode,
    });
  } catch (error) {
    console.error("Error generating QR code:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to generate QR code",
      },
      { status: 500 }
    );
  }
}
