# Quick Fix: Firebase Service Account Setup

## The Problem

You're seeing this error:

```
Error [FirebaseError]: Missing or insufficient permissions.
code: 'permission-denied'
```

## The Solution

The bulk import API needs Firebase Admin SDK credentials. Here's how to set it up in **2 minutes**:

### Step 1: Download Service Account JSON

1. Go to: https://console.firebase.google.com/
2. Select your project
3. Click ⚙️ (Settings) → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **"Generate New Private Key"**
6. Download the JSON file

### Step 2: Add to .env.local

1. Open the downloaded JSON file
2. Copy the **entire contents** (all of it, one line)
3. Create/edit `.env.local` in your project root
4. Add this line:

```env
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...paste entire JSON here..."}
```

**Example:**

```env
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"my-project-123","private_key_id":"abc123","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvQIB...","client_email":"firebase-adminsdk@my-project.iam.gserviceaccount.com"}
```

### Step 3: Restart Server

**IMPORTANT:** Stop your dev server (Ctrl+C) and restart:

```bash
npm run dev
```

### Step 4: Test Import

Try the bulk import again. It should work now!

## Complete .env.local Example

Your `.env.local` should have both:

```env
# QR Code Security
QR_SECRET_KEY=your_64_char_hex_key_from_crypto

# Firebase Admin (for API routes)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
```

## Still Not Working?

**Double-check:**

- [ ] `.env.local` is in the project root (same folder as `package.json`)
- [ ] You restarted the dev server after adding the variable
- [ ] The JSON is on a single line with no line breaks
- [ ] No spaces before or after the `=`

**Test your setup:**

```bash
# Check if file exists
ls .env.local

# Check if variable is set (in server terminal logs, look for startup messages)
```

## Security Note

⚠️ **Never commit `.env.local` to Git!**

Make sure it's in your `.gitignore` file.

## Need More Help?

Check the full guide: `FIRESTORE_PERMISSIONS_FIX.md` (if it exists) or:

1. Verify the JSON is valid (no syntax errors)
2. Check Firebase Console → IAM that the service account exists
3. Make sure Firestore is initialized in your Firebase project
