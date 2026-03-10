

```markdown
# 🎓 EVSU QR Attendance System

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

A modern, highly secure QR-based attendance tracking system tailored for Eastern Visayas State University (EVSU). 

## 📖 Introduction

The **EVSU QR Attendance System** is designed to streamline the process of monitoring student attendance by replacing traditional roll calls with a fast, reliable, and secure QR code scanning mechanism. It solves the critical problem of attendance forgery (e.g., students sharing basic QR codes) by implementing robust cryptographic signatures. 

Built with modern web technologies—**Next.js (App Router), Firebase, TypeScript, and Tailwind CSS**—this system provides educators with a seamless admin dashboard for real-time tracking while ensuring student data remains secure.

### 📌 Project Status & Notes
> **Note:** While this codebase is fully functional and production-ready, live web deployments may occasionally be offline due to server hosting and database cost constraints. The system can be easily redeployed locally or to any hosting provider.
> 
> **Disclaimer:** This is a public demonstration project showcasing architectural and full-stack development skills. Some related, advanced enterprise-level implementations are under NDA and cannot be shared publicly, though high-level context and architectural decisions can be gladly discussed during technical interviews.

---

## ✨ Features

- **Cryptographically Secure QR Codes:** Utilizes HMAC-SHA256 signatures to prevent QR code forgery and duplication.
- **Real-Time Data Sync:** Seamless Firestore integration for live attendance updates and student management.
- **Admin Dashboard:** A responsive, intuitive interface for managing programs, subjects, and viewing attendance logs.
- **Dynamic QR Regeneration:** Ability to instantly invalidate compromised QR codes and regenerate new, secure ones.
- **Optimized Performance:** Client-side rendering of QR codes using `qrcode.react` to eliminate cloud storage costs and reduce latency.
- **Responsive UI:** Styled with Tailwind CSS and Radix UI primitives for a highly accessible, mobile-friendly experience.

---

## 🏗 Architecture Overview

The system follows a modern serverless architecture pattern:

1. **Frontend (Client):** Next.js provides the React UI. QR codes are rendered purely on the client side based on data fetched securely. 
2. **Backend (API Routes):** Next.js Serverless Functions (`/api/qr/*`) handle the cryptographic generation and validation of the QR payloads, keeping the `QR_SECRET_KEY` safely on the server.
3. **Database & Auth:** Firebase Firestore acts as the primary data store for students, attendance logs, and subjects. Firebase Authentication manages admin access.

---

## 🚀 Installation & Setup

### Prerequisites
- **Node.js:** version 18.0 or higher
- **Firebase:** A Firebase project configured with Firestore and Authentication
- **Package Manager:** `npm`, `yarn`, or `pnpm`

### Step-by-Step Guide

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Orekidesu/evsu-qr-attendance-system.git
   cd evsu-qr-attendance-system
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory. You will need your Firebase configuration and a securely generated cryptographic key.

   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here

   # QR Code Security (REQUIRED)
   QR_SECRET_KEY=your_secure_secret_key_at_least_32_chars_long
   ```

   **⚠️ Generating a Secure Secret Key:**
   The `QR_SECRET_KEY` must be at least 32 characters long. Generate one instantly in your terminal:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 💻 Usage

- **Admin Access:** Log in via the secure Firebase Auth portal to access the dashboard.
- **Managing Students:** Navigate to the Student Management module to add or edit student details. The system automatically provisions a secure QR payload for new entries.
- **Scanning & Validation:** When a QR code is scanned, the client sends the payload to the `/api/qr/validate` endpoint. The server recalculates the HMAC signature. If it matches, attendance is marked in Firestore; if tampered with, the scan is rejected.
- **Regeneration:** If a student compromises their QR code, an admin can click "Regenerate" in the dashboard, which creates a new cryptographic salt/signature, rendering the old QR code permanently invalid.

---

## 🔐 Security Notes: HMAC Strategy

Unlike standard QR systems that just embed a predictable student ID, this system uses an **HMAC-SHA256 signature** approach to ensure authenticity.

- **Payload Format:** `EVSU:STU:{student_id}:{signature}`
- **Signature Generation:** The server hashes the `student_id` combined with the private `QR_SECRET_KEY`. Only the first 8 characters are attached to the QR code to keep the code simple and easy to scan, while providing billions of possible combinations.
- **Validation:** Because the `QR_SECRET_KEY` never leaves the server, it is computationally impossible for a malicious actor to generate a valid QR code for an arbitrary student ID.

*(For detailed implementation specifications, see [QR_CODE_STRATEGY.md](./QR_CODE_STRATEGY.md))*

---

## 📂 Project Structure

```text
src/
├── app/                    # Next.js App Router structure
│   ├── api/                # Secure serverless API routes
│   │   └── qr/             # Generation, validation, and regeneration endpoints
│   └── (dashboard)/        # Admin dashboard pages and layouts
├── components/             # Modular React components
│   ├── admin/              # Dashboard-specific UI elements
│   ├── ui/                 # Reusable Radix/Tailwind components
│   └── layouts/            # Page wrappers and navigations
├── lib/                    # Core utilities
│   ├── firebase/           # Firebase initialization and admin SDK
│   ├── qr/                 # Cryptographic helper functions
│   └── types/              # Global TypeScript interfaces
└── hooks/                  # Custom React hooks for data fetching/state
```

---

## 🤝 Contributing

Contributions are welcome! If you'd like to improve the codebase, please follow these guidelines:

1. **Fork the repository** and create your feature branch (`git checkout -b feature/AmazingFeature`).
2. **Adhere to the tech stack:** Ensure all new code is written in strict TypeScript and styled using Tailwind CSS utility classes.
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`).
4. **Push to the branch** (`git push origin feature/AmazingFeature`).
5. **Open a Pull Request** describing your changes in detail.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.
```
