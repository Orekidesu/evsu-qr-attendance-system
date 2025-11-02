# EVSU QR Attendance System

This is a [Next.js](https://nextjs.org) project for managing student attendance using QR codes.

## Features

- 🎓 Student Management with Firestore integration
- 🔐 Secure QR code generation with HMAC signatures
- 👨‍🏫 Program and Subject management
- 📊 Admin dashboard with real-time data
- 🔄 QR code regeneration for security

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Firebase project set up
- Firebase Admin SDK credentials

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd evsu-qr-attendance-system
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory with the following variables:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here

# QR Code Security (REQUIRED)
# Generate a secure secret key using:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
QR_SECRET_KEY=your_secure_secret_key_at_least_32_chars_long
```

**Important:** The `QR_SECRET_KEY` must be at least 32 characters long for security. Generate it using:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## QR Code Security

This system uses HMAC-SHA256 signatures to secure QR codes and prevent forgery:

- **Format:** `EVSU:STU:{student_id}:{signature}`
- **Signature:** First 8 characters of HMAC-SHA256 hash
- **Validation:** Server-side verification in attendance scanning

### QR Code Features:

- ✅ Client-side rendering (fast, no storage costs)
- ✅ HMAC signature verification
- ✅ Regeneration capability for compromised codes
- ✅ Download and print functionality
- ✅ High error correction level

See [QR_CODE_STRATEGY.md](./QR_CODE_STRATEGY.md) for detailed documentation.

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── qr/           # QR code generation/validation
│   └── (dashboard)/      # Dashboard pages
├── components/            # React components
│   ├── admin/            # Admin-specific components
│   ├── ui/               # Reusable UI components
│   └── layouts/          # Layout components
├── lib/                   # Utilities and helpers
│   ├── firebase/         # Firebase configuration
│   ├── qr/              # QR code utilities
│   └── types/           # TypeScript types
└── hooks/                # Custom React hooks
```

## API Routes

### QR Code Endpoints

- `POST /api/qr/generate` - Generate secure QR code
- `POST /api/qr/validate` - Validate QR code signature
- `POST /api/qr/regenerate` - Regenerate QR code for student

## Technologies

- **Framework:** Next.js 16 with App Router
- **Language:** TypeScript
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth
- **UI:** Tailwind CSS + Radix UI
- **QR Codes:** qrcode.react
- **Security:** HMAC-SHA256 signatures

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## Deployment

Deploy to Vercel:

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

**Important:** Make sure to set the `QR_SECRET_KEY` environment variable in your production deployment!

## License

[Add your license here]
