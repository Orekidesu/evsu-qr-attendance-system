# QR Code Strategy for EVSU Attendance System

## Current Implementation Analysis

### What We Have:

- QR codes are generated **client-side** using `qrcode.react` library
- QR code data is stored as a **string** in Firestore (`qr_code` field in students collection)
- QR codes encode the `student_id` or a simple string like "STU001-QR"

## Recommended Solution: **Client-Side Generation with Firestore Storage**

### ✅ Why This is the Best Approach:

1. **No Firebase Storage Needed**: QR codes are lightweight SVG/Canvas elements that can be generated on-demand
2. **Cost-Effective**: No storage costs, no bandwidth costs
3. **Always Fresh**: QR codes are generated when needed, ensuring consistency
4. **Secure**: Can implement encryption/signing of QR data
5. **Fast**: No network latency for fetching images
6. **Flexible**: Easy to change QR code format or add data

### Implementation Details:

#### 1. QR Code Data Format (Stored in Firestore)

```typescript
{
  qr_code: "EVSU:STU:2025001:abc123hash"; // Structured format with validation hash
}
```

**Format Breakdown:**

- `EVSU` - Institution identifier
- `STU` - Entity type (Student)
- `2025001` - Student ID
- `abc123hash` - HMAC signature for validation (prevents tampering)

#### 2. Generation Strategy:

**When to Generate:**

- During student creation (auto-generate unique code)
- Can be regenerated if compromised

**Where to Generate:**

- Backend API route for security (prevents client-side tampering)
- Use crypto library to create HMAC signature

#### 3. Validation Strategy:

**During Attendance Scanning:**

1. Scan QR code → Get string "EVSU:STU:2025001:abc123hash"
2. Parse the components
3. Verify HMAC signature using secret key
4. Look up student by ID
5. Record attendance

#### 4. Security Features:

```typescript
// Example QR Code Generation (Backend)
import crypto from "crypto";

function generateSecureQRCode(studentId: string): string {
  const timestamp = Date.now();
  const data = `EVSU:STU:${studentId}`;
  const signature = crypto
    .createHmac("sha256", process.env.QR_SECRET_KEY!)
    .update(data)
    .digest("hex")
    .substring(0, 8); // First 8 chars for brevity

  return `${data}:${signature}`;
}

function validateQRCode(qrCode: string): {
  valid: boolean;
  studentId?: string;
} {
  const parts = qrCode.split(":");
  if (parts.length !== 4) return { valid: false };

  const [prefix, type, studentId, signature] = parts;

  if (prefix !== "EVSU" || type !== "STU") return { valid: false };

  const data = `EVSU:STU:${studentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.QR_SECRET_KEY!)
    .update(data)
    .digest("hex")
    .substring(0, 8);

  if (signature !== expectedSignature) return { valid: false };

  return { valid: true, studentId };
}
```

## Alternative Approaches (Not Recommended):

### ❌ Firebase Storage Approach

**Why Not:**

- Additional costs for storage and bandwidth
- Slower (network latency to fetch images)
- More complex (upload, download, manage URLs)
- Unnecessary for simple QR codes
- Would need lifecycle management (cleanup old codes)

**When to Use:**

- If QR codes need to be PDFs with student photos
- If QR codes need complex custom designs/branding
- If offline printing is required at scale

### ❌ Simple Student ID Approach

**Why Not:**

- No security/validation
- Easy to forge QR codes
- No tamper detection
- Anyone can generate fake codes

## Recommended File Structure:

```
src/
├── lib/
│   ├── qr/
│   │   ├── generator.ts      # Client-side QR rendering
│   │   └── validator.ts      # QR validation logic
│   └── api/
│       └── qr/
│           └── generate.ts   # API route for secure generation
└── components/
    └── qr/
        ├── QRDisplay.tsx     # Display component
        └── QRScanner.tsx     # Scanner component for attendance
```

## Implementation Steps:

1. ✅ Keep current Firestore field `qr_code: string`
2. ✅ Use client-side rendering with `qrcode.react` for display
3. 🔄 Create API route for secure QR code generation
4. 🔄 Add HMAC signature to QR data
5. 🔄 Implement validation during attendance scanning
6. 🔄 Add QR regeneration feature (if student loses card)

## Best Practices:

1. **Add Environment Variable:**

   ```env
   QR_SECRET_KEY=your-secret-key-minimum-32-chars
   ```

2. **QR Code Expiry (Optional):**

   - Add timestamp to QR data
   - Validate codes are not older than X days
   - Useful for security but may require reprinting

3. **Audit Trail:**

   - Log all QR code generations
   - Track regenerations (in case of compromise)

4. **Printing:**

   - Use high error correction level (`level="H"`)
   - Include margins for better scanning
   - Print student name + ID alongside QR code

5. **Scanning:**
   - Use camera-based scanner in attendance app
   - Validate QR format before database lookup
   - Provide clear error messages

## Current Code Quality: ✅ GOOD

The current implementation with `qrcode.react` is actually the right approach!

**What needs improvement:**

1. QR data format (add security signature)
2. Generation logic (move to secure API route)
3. Validation logic (implement HMAC verification)

**What's already good:**

1. Client-side rendering (perfect for performance)
2. On-demand generation (no storage needed)
3. Download functionality (good UX)
4. Print functionality (good UX)
