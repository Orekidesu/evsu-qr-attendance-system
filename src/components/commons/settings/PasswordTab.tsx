"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

interface PasswordTabProps {
  passwordForm: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
  showCurrentPassword: boolean;
  showNewPassword: boolean;
  showConfirmPassword: boolean;
  onPasswordChange: (field: string, value: string) => void;
  onToggleCurrentPassword: () => void;
  onToggleNewPassword: () => void;
  onToggleConfirmPassword: () => void;
  onChangePassword: () => void;
  isChanging: boolean;
}

export function PasswordTab({
  passwordForm,
  showCurrentPassword,
  showNewPassword,
  showConfirmPassword,
  onPasswordChange,
  onToggleCurrentPassword,
  onToggleNewPassword,
  onToggleConfirmPassword,
  onChangePassword,
  isChanging,
}: PasswordTabProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Change Password</h2>
        <p className="text-gray-600">
          Update your password to keep your account secure
        </p>
      </div>

      <div className="space-y-6">
        {/* Current Password */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Current Password
          </label>
          <div className="relative">
            <Input
              type={showCurrentPassword ? "text" : "password"}
              placeholder="Enter your current password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                onPasswordChange("currentPassword", e.target.value)
              }
              className="w-full pr-10"
              disabled={isChanging}
            />
            <button
              onClick={onToggleCurrentPassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              type="button"
            >
              {showCurrentPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            New Password
          </label>
          <div className="relative">
            <Input
              type={showNewPassword ? "text" : "password"}
              placeholder="Enter your new password"
              value={passwordForm.newPassword}
              onChange={(e) => onPasswordChange("newPassword", e.target.value)}
              className="w-full pr-10"
              disabled={isChanging}
            />
            <button
              onClick={onToggleNewPassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              type="button"
            >
              {showNewPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Password must be at least 8 characters long
          </p>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your new password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                onPasswordChange("confirmPassword", e.target.value)
              }
              className="w-full pr-10"
              disabled={isChanging}
            />
            <button
              onClick={onToggleConfirmPassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              type="button"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Change Button */}
        <div className="pt-4">
          <Button
            onClick={onChangePassword}
            className="bg-black text-white hover:bg-gray-800 px-6 py-2"
            disabled={isChanging}
          >
            {isChanging ? "Changing..." : "Change Password"}
          </Button>
        </div>
      </div>
    </div>
  );
}
