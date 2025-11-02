import { NextRequest, NextResponse } from "next/server";
import { validateQRCode } from "@/lib/qr/validator";

/**
 * POST /api/qr/validate
 * Validate a QR code and verify its HMAC signature
 *
 * Request body:
 * {
 *   qrCode: string
 * }
 *
 * Response (valid):
 * {
 *   valid: true,
 *   studentId: "2025001"
 * }
 *
 * Response (invalid):
 * {
 *   valid: false,
 *   error: "Invalid signature - QR code may be forged"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { qrCode } = body;

    // Validate input
    if (!qrCode || typeof qrCode !== "string") {
      return NextResponse.json(
        {
          valid: false,
          error: "QR code is required and must be a string",
        },
        { status: 400 }
      );
    }

    // Validate QR code
    const result = validateQRCode(qrCode);

    if (!result.valid) {
      return NextResponse.json(
        {
          valid: false,
          error: result.error || "Invalid QR code",
        },
        { status: 200 } // 200 because request succeeded, but QR is invalid
      );
    }

    return NextResponse.json({
      valid: true,
      studentId: result.studentId,
    });
  } catch (error) {
    console.error("Error validating QR code:", error);

    return NextResponse.json(
      {
        valid: false,
        error:
          error instanceof Error ? error.message : "Failed to validate QR code",
      },
      { status: 500 }
    );
  }
}
