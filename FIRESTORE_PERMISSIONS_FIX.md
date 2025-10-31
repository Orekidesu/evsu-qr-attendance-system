# Firestore Permission Error - Root Cause & Solution

## 🔍 Root Cause

The "Missing or insufficient permissions" error occurred due to **authentication timing issues**:

### Primary Issue:

1. **Race Condition**: The `useProgramsData` hook was trying to fetch data from Firestore **before** the user authentication was fully loaded
2. **Missing Auth Check**: The hook didn't verify if the user was authenticated before making Firestore requests
3. **Firestore Rules**: Your rules require `isSignedIn()` to be true for all read operations

### Why It Happened:

```javascript
// BEFORE (❌ Problem):
useEffect(() => {
  fetchPrograms(); // Runs immediately, even if user isn't loaded yet!
}, [fetchPrograms]);
```

When the component mounts, React immediately calls `fetchPrograms()`, but the `AuthContext` might still be loading the user from Firebase Auth. This creates a window where:

- `request.auth` is `null` in Firestore rules
- All queries fail with permission denied

## ✅ Solution Implemented

### 1. Updated `useProgramsData` Hook

**Added authentication checks before any Firestore operation:**

```typescript
// AFTER (✅ Fixed):
const { user, loading: authLoading } = useAuth();

const fetchPrograms = useCallback(async () => {
  // Don't fetch if user is not authenticated
  if (!user) {
    setError("User not authenticated");
    setIsLoading(false);
    return;
  }
  // ... fetch logic
}, [user]); // Depend on user

useEffect(() => {
  // Wait for auth to finish loading before fetching
  if (!authLoading) {
    fetchPrograms();
  }
}, [authLoading, fetchPrograms]);
```

**Key improvements:**

- ✅ Waits for `authLoading` to complete
- ✅ Checks if `user` exists before fetching
- ✅ All write operations (add/edit/delete) check authentication
- ✅ Provides clear error messages

### 2. Improved Firestore Rules

**Updated `firestore.rules` with better error handling:**

```javascript
function getUserRole() {
  // Safely check if user document exists and has a role
  return isSignedIn() && exists(/databases/$(database)/documents/users/$(request.auth.uid))
    ? get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role
    : null;
}
```

**Key improvements:**

- ✅ Uses `exists()` to check if user document is present before reading it
- ✅ Prevents errors when user document hasn't been created yet
- ✅ More specific read permissions for users collection

### 3. Enhanced Error Handling

**Added proper error messages and UI feedback:**

```typescript
// Show specific errors to users
{(error || actionError) && (
  <Alert variant="destructive">
    {error || actionError}
    {error && error.includes("authentication") && (
      <p>Please make sure you are logged in...</p>
    )}
  </Alert>
)}
```

## 🛡️ Prevention for Future

### For Other Pages/Features:

**1. Always use `useAuth` hook in data-fetching hooks:**

```typescript
import { useAuth } from "@/contexts/AuthContext";

export function useYourDataHook() {
  const { user, loading: authLoading } = useAuth();

  // Wait for auth before fetching
  useEffect(() => {
    if (!authLoading && user) {
      fetchData();
    }
  }, [authLoading, user]);
}
```

**2. Check authentication before write operations:**

```typescript
const addItem = async (data) => {
  if (!user) {
    throw new Error("User not authenticated");
  }
  await createItem(data);
};
```

**3. Use consistent error handling:**

```typescript
try {
  await operation();
} catch (err) {
  const errorMessage =
    err instanceof Error ? err.message : "Failed to perform operation";
  setError(errorMessage);
}
```

### Deployment Checklist:

1. ✅ Deploy updated Firestore rules to Firebase Console
2. ✅ Verify all hooks use `useAuth` properly
3. ✅ Test with fresh login (clear browser cache)
4. ✅ Test with slow network connection
5. ✅ Verify error messages are user-friendly

## 📋 To Deploy the New Rules:

1. Go to Firebase Console → Firestore Database → Rules
2. Replace with the content from `firestore.rules`
3. Click "Publish"

Or use Firebase CLI:

```bash
firebase deploy --only firestore:rules
```

## 🧪 Testing

To verify the fix works:

1. **Clear browser cache** to simulate fresh login
2. **Log out and log back in**
3. Navigate to Programs page
4. Should load without permission errors
5. Try add/edit/delete operations

If you still see errors, check:

- Is the user document created in Firestore?
- Does the user have the correct `role` field?
- Are you logged in as admin?

## 🎯 Summary

**Problem**: Firestore queries executed before authentication completed
**Solution**: Wait for auth to load, check user exists before queries
**Prevention**: Always use `useAuth` hook and check authentication state
