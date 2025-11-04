"use client";

import { useState, useEffect } from "react";
import { Settings, Loader2, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { updateUser } from "@/lib/firebase/firestore/users";
import { changePassword } from "@/lib/firebase/auth";
import { AccountTab } from "./AccountTab";
import { PasswordTab } from "./PasswordTab";
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";

export function SettingsPageContent() {
  const { user, firebaseUser, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("account");
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Account form state
  const [accountForm, setAccountForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setAccountForm({
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleAccountChange = (field: string, value: string) => {
    setAccountForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = async () => {
    if (!user) {
      toast.error("User not found. Please log in again.");
      return;
    }

    // Validate form
    if (!accountForm.firstName.trim() || !accountForm.lastName.trim()) {
      toast.error("First name and last name are required.");
      return;
    }

    setIsSaving(true);

    try {
      // Update user in Firestore
      await updateUser(user.id, {
        first_name: accountForm.firstName.trim(),
        last_name: accountForm.lastName.trim(),
      });

      toast.success("Account information updated successfully!");
    } catch (error) {
      console.error("Error updating account:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update account information. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!firebaseUser) {
      toast.error("User not authenticated. Please log in again.");
      return;
    }

    // Validate passwords
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      toast.error("All password fields are required.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      toast.error("New password must be different from current password");
      return;
    }

    setIsChangingPassword(true);

    try {
      // Re-authenticate user before changing password
      const credential = EmailAuthProvider.credential(
        firebaseUser.email!,
        passwordForm.currentPassword
      );

      await reauthenticateWithCredential(firebaseUser, credential);

      // Change password
      await changePassword(firebaseUser, passwordForm.newPassword);

      toast.success("Password changed successfully!");

      // Clear password form
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error changing password:", error);

      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes("auth/wrong-password")) {
          toast.error("Current password is incorrect.");
        } else if (error.message.includes("auth/weak-password")) {
          toast.error("Password is too weak. Please use a stronger password.");
        } else if (error.message.includes("auth/requires-recent-login")) {
          toast.error(
            "Please log out and log in again before changing password."
          );
        } else {
          toast.error(
            error.message || "Failed to change password. Please try again."
          );
        }
      } else {
        toast.error("Failed to change password. Please try again.");
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          </div>
        </div>
      </div>
    );
  }

  // User not found state
  if (!user) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              User data not found. Please log in again.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 grid grid-cols-2 w-full max-w-xs">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account" className="mt-6">
            <AccountTab
              user={user}
              accountForm={accountForm}
              onAccountChange={handleAccountChange}
              onSaveChanges={handleSaveChanges}
              isSaving={isSaving}
            />
          </TabsContent>

          {/* Password Tab */}
          <TabsContent value="password" className="mt-6">
            <PasswordTab
              passwordForm={passwordForm}
              showCurrentPassword={showCurrentPassword}
              showNewPassword={showNewPassword}
              showConfirmPassword={showConfirmPassword}
              onPasswordChange={handlePasswordChange}
              onToggleCurrentPassword={() =>
                setShowCurrentPassword(!showCurrentPassword)
              }
              onToggleNewPassword={() => setShowNewPassword(!showNewPassword)}
              onToggleConfirmPassword={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              onChangePassword={handleChangePassword}
              isChanging={isChangingPassword}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
