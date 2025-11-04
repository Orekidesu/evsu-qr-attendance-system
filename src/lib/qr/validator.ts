/**
 * QR Code Validation Utilities
 * Server-side validation with HMAC signature verification
 * SECURITY: Only use these functions in server-side code (API routes)
 */

import crypto from "crypto";

/**
 * Generate a secure QR code with HMAC signature
 * @param studentId - The student's ID
 * @returns Signed QR code string in format: EVSU:STU:{studentId}:{signature}
 */
export function generateSecureQRCode(studentId: string): string {
  const secretKey = process.env.QR_SECRET_KEY;

  if (!secretKey) {
    throw new Error(
      "QR_SECRET_KEY environment variable is not set. Please configure it in your .env file."
    );
  }

  if (secretKey.length < 32) {
    throw new Error(
      "QR_SECRET_KEY must be at least 32 characters for security."
    );
  }

  const data = `EVSU:STU:${studentId}`;

  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(data)
    .digest("hex")
    .substring(0, 8); // First 8 chars for brevity while maintaining security

  return `${data}:${signature}`;
}

/**
 * Validate a QR code and verify its HMAC signature
 * @param qrCode - The QR code string to validate
 * @returns Validation result with student ID if valid
 */
export function validateQRCode(qrCode: string): {
  valid: boolean;
  studentId?: string;
  error?: string;
} {
  const secretKey = process.env.QR_SECRET_KEY;

  if (!secretKey) {
    return {
      valid: false,
      error: "QR_SECRET_KEY environment variable is not configured",
    };
  }

  // Parse QR code format
  const parts = qrCode.split(":");

  if (parts.length !== 4) {
    return { valid: false, error: "Invalid QR code format" };
  }

  const [prefix, type, studentId, signature] = parts;

  // Validate structure
  if (prefix !== "EVSU") {
    return { valid: false, error: "Invalid institution identifier" };
  }

  if (type !== "STU") {
    return { valid: false, error: "Invalid entity type" };
  }

  if (!studentId || studentId.trim() === "") {
    return { valid: false, error: "Missing student ID" };
  }

  // Verify HMAC signature
  const data = `EVSU:STU:${studentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", secretKey)
    .update(data)
    .digest("hex")
    .substring(0, 8);

  if (signature !== expectedSignature) {
    return { valid: false, error: "Invalid signature - QR code may be forged" };
  }

  return { valid: true, studentId };
}

/**
 * Regenerate QR code for a student (useful if compromised)
 * @param studentId - The student's ID
 * @returns New signed QR code string
 */
export function regenerateQRCode(studentId: string): string {
  // For now, this is the same as generation
  // In the future, you could add timestamp-based expiry here
  return generateSecureQRCode(studentId);
}

/**
 * Optional: Add expiry validation to QR codes
 * Uncomment and modify if you want QR codes to expire after X days
 */
/*
export function generateSecureQRCodeWithExpiry(
  studentId: string,
  expiryDays: number = 365
): string {
  const secretKey = process.env.QR_SECRET_KEY;
  if (!secretKey) {
    throw new Error("QR_SECRET_KEY environment variable is not set");
  }

  const expiryDate = Date.now() + expiryDays * 24 * 60 * 60 * 1000;
  const data = `EVSU:STU:${studentId}:${expiryDate}`;

  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(data)
    .digest("hex")
    .substring(0, 8);

  return `${data}:${signature}`;
}

export function validateQRCodeWithExpiry(qrCode: string): {
  valid: boolean;
  studentId?: string;
  error?: string;
  expired?: boolean;
} {
  const secretKey = process.env.QR_SECRET_KEY;
  if (!secretKey) {
    return { valid: false, error: "QR_SECRET_KEY not configured" };
  }

  const parts = qrCode.split(":");
  if (parts.length !== 5) {
    return { valid: false, error: "Invalid QR code format" };
  }

  const [prefix, type, studentId, expiryTimestamp, signature] = parts;

  if (prefix !== "EVSU" || type !== "STU") {
    return { valid: false, error: "Invalid QR code format" };
  }

  // Check expiry
  const expiryDate = parseInt(expiryTimestamp, 10);
  if (Date.now() > expiryDate) {
    return { valid: false, studentId, error: "QR code has expired", expired: true };
  }

  // Verify signature
  const data = `EVSU:STU:${studentId}:${expiryTimestamp}`;
  const expectedSignature = crypto
    .createHmac("sha256", secretKey)
    .update(data)
    .digest("hex")
    .substring(0, 8);

  if (signature !== expectedSignature) {
    return { valid: false, error: "Invalid signature" };
  }

  return { valid: true, studentId };
}
*/
