// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";

// Helper to verify the requesting user is an admin
async function verifyAdminUser(request: NextRequest): Promise<string | null> {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7);
    const decodedToken = await getAdminAuth().verifyIdToken(token);

    // Verify the user is an admin
    const userDoc = await getAdminFirestore()
      .collection("users")
      .doc(decodedToken.uid)
      .get();

    if (!userDoc.exists || userDoc.data()?.role !== "admin") {
      return null;
    }

    return decodedToken.uid;
  } catch (error) {
    console.error("Error verifying admin user:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminUid = await verifyAdminUser(request);
    if (!adminUid) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { email, password, first_name, last_name, role = "teacher" } = body;

    // Validate required fields
    if (!email || !password || !first_name || !last_name) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: email, password, first_name, last_name",
        },
        { status: 400 }
      );
    }

    // Create user in Firebase Auth using Admin SDK
    const userRecord = await getAdminAuth().createUser({
      email,
      password,
      displayName: `${first_name} ${last_name}`,
    });

    // Create user document in Firestore
    await getAdminFirestore()
      .collection("users")
      .doc(userRecord.uid)
      .set({
        email,
        first_name,
        last_name,
        role,
        assigned_subjects: role === "teacher" ? [] : undefined,
        created_at: new Date().toISOString(),
      });

    return NextResponse.json(
      {
        success: true,
        userId: userRecord.uid,
        message: "User created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);

    // Handle specific Firebase errors
    if (error instanceof Error) {
      if (error.message.includes("email-already-exists")) {
        return NextResponse.json(
          { error: "A user with this email already exists" },
          { status: 409 }
        );
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
