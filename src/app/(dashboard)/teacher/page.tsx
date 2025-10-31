"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/lib/firebase/auth";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function TeacherPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "teacher") {
        // Redirect to appropriate page based on role
        router.push(`/${user.role}`);
      }
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.role !== "teacher") {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Teacher Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome, {user.first_name} {user.last_name}
        </p>
        <p className="text-sm text-muted-foreground">Email: {user.email}</p>
        {user.assigned_subjects && user.assigned_subjects.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Assigned Subjects: {user.assigned_subjects.length}
          </p>
        )}
      </div>
      <Button onClick={handleSignOut} variant="outline">
        Sign Out
      </Button>
    </div>
  );
}
