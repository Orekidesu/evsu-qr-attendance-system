/**
 * QR Code Generation Utilities
 * Client-side utilities for rendering QR codes
 */

/**
 * Format QR code data for display
 * This is used by the React component to render the QR code
 */
export function formatQRCodeForDisplay(qrCode: string): string {
  return qrCode;
}

/**
 * Parse QR code data to extract components
 */
export function parseQRCode(qrCode: string): {
  valid: boolean;
  prefix?: string;
  type?: string;
  studentId?: string;
  signature?: string;
} {
  const parts = qrCode.split(":");

  if (parts.length !== 4) {
    return { valid: false };
  }

  const [prefix, type, studentId, signature] = parts;

  if (prefix !== "EVSU" || type !== "STU") {
    return { valid: false };
  }

  return {
    valid: true,
    prefix,
    type,
    studentId,
    signature,
  };
}

/**
 * Check if QR code format is valid (client-side check only)
 * Does NOT verify HMAC signature - that must be done server-side
 */
export function isValidQRCodeFormat(qrCode: string): boolean {
  const parsed = parseQRCode(qrCode);
  return parsed.valid;
}
