// src/lib/firebase/auth.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updatePassword,
  type User as FirebaseUser,
} from "firebase/auth";
import { auth, db } from "./config";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  type FieldValue,
} from "firebase/firestore";
import type { User, CreateUserInput } from "../types/user";

/**
 * Create a new user in Firebase Auth and Firestore
 * Note: This will temporarily sign in as the new user, then sign back in as admin
 */
export async function createUser(
  email: string,
  password: string,
  userData: Omit<CreateUserInput, "email">
): Promise<User> {
  try {
    // Get current user to restore session later
    const currentUser = auth.currentUser;

    // Create auth user (this will automatically sign in as the new user)
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const { uid } = userCredential.user;

    // Create Firestore document while signed in as new user
    const userDoc: Omit<User, "id" | "created_at"> & {
      created_at: FieldValue;
    } = {
      first_name: userData.first_name,
      last_name: userData.last_name,
      email,
      role: userData.role,
      created_at: serverTimestamp(),
    };

    // Add optional fields based on role
    if (userData.role === "student" && userData.program_id) {
      userDoc.program_id = userData.program_id;
      userDoc.qr_code = userData.qr_code;
    }

    if (userData.role === "teacher" && userData.assigned_subjects) {
      userDoc.assigned_subjects = userData.assigned_subjects;
    }

    await setDoc(doc(db, "users", uid), userDoc);

    // Sign out the newly created user
    await firebaseSignOut(auth);

    // Note: The admin will need to sign back in
    // This is a limitation of the client SDK - ideally use Firebase Admin SDK on the backend

    return {
      id: uid,
      ...userDoc,
      created_at: userDoc.created_at as never, // Will be converted to Timestamp by Firestore
    } as User;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create user";
    throw new Error(errorMessage);
  }
}

/**
 * Sign in user
 */
export async function signIn(
  email: string,
  password: string
): Promise<FirebaseUser> {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to sign in";
    throw new Error(errorMessage);
  }
}

/**
 * Sign out user
 */
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to sign out";
    throw new Error(errorMessage);
  }
}

/**
 * Get user data from Firestore
 */
export async function getUserData(uid: string): Promise<User | null> {
  try {
    const userDocument = await getDoc(doc(db, "users", uid));
    if (userDocument.exists()) {
      return {
        id: userDocument.id,
        ...userDocument.data(),
      } as User;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to send reset email";
    throw new Error(errorMessage);
  }
}

/**
 * Update user password
 */
export async function changePassword(
  user: FirebaseUser,
  newPassword: string
): Promise<void> {
  try {
    await updatePassword(user, newPassword);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update password";
    throw new Error(errorMessage);
  }
}

/**
 * Get current authenticated user
 */
export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser;
}
