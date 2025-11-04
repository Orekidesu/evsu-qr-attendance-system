"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { User } from "@/lib/types/user";

interface AccountTabProps {
  user: User | null;
  accountForm: {
    firstName: string;
    lastName: string;
    email: string;
  };
  onAccountChange: (field: string, value: string) => void;
  onSaveChanges: () => void;
  isSaving: boolean;
}

export function AccountTab({
  user,
  accountForm,
  onAccountChange,
  onSaveChanges,
  isSaving,
}: AccountTabProps) {
  const getRoleDisplayName = (role: string): string => {
    if (role === "admin") return "Administrator";
    if (role === "teacher") return "Teacher";
    return role;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Personal Information</h2>
        <p className="text-gray-600">
          Update your personal details and contact information
        </p>
      </div>

      <div className="space-y-6">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2">
              First Name
            </label>
            <Input
              type="text"
              value={accountForm.firstName}
              onChange={(e) => onAccountChange("firstName", e.target.value)}
              className="w-full"
              disabled={isSaving}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">
              Last Name
            </label>
            <Input
              type="text"
              value={accountForm.lastName}
              onChange={(e) => onAccountChange("lastName", e.target.value)}
              className="w-full"
              disabled={isSaving}
            />
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-sm font-semibold mb-2">Email</label>
          <Input
            type="email"
            value={accountForm.email}
            className="w-full bg-gray-50"
            disabled
            readOnly
          />
          <p className="text-sm text-gray-600 mt-2">
            Email cannot be changed. Contact an administrator if you need to
            update your email address.
          </p>
        </div>

        {/* Role Field */}
        <div>
          <label className="block text-sm font-semibold mb-2">Role</label>
          <div className="flex items-center gap-3 bg-gray-100 p-3 rounded-md">
            <span className="text-gray-900 font-medium">
              {user ? getRoleDisplayName(user.role) : "Loading..."}
            </span>
            <span className="text-xs bg-gray-300 text-gray-700 px-2 py-1 rounded">
              Read only
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Your role determines your permissions in the system. Contact an
            administrator to change your role.
          </p>
        </div>

        {/* Save Button */}
        <div className="pt-4">
          <Button
            onClick={onSaveChanges}
            className="bg-black text-white hover:bg-gray-800 px-6 py-2"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
