import React from "react";
import { Button } from "@/components/ui/button";
import { useDashboardContext } from "@/contexts/DashboardContext";

/**
 * AccountSettingsTab component
 */
const AccountSettingsTab = () => {
  const {
    activeTab,
    profile,
    profileError,
    profileSuccessMessage,
    isSubmitting,
    handleProfileChange,
    handleUpdateProfile,
    handleChangePassword,
    handleDeleteAccount,
  } = useDashboardContext();
  
  if (activeTab !== "account") return null;
  
  return (
    <div>
      <h2 className="text-xl font-semibold text-[#1F2937] mb-6">Account Settings</h2>
      <div className="space-y-6">
        {/* Profile Information */}
        <div className="border rounded-lg p-6">
          <h3 className="font-medium text-lg mb-4">Profile Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleProfileChange}
                className="w-full p-2 border rounded-md border-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleProfileChange}
                className="w-full p-2 border rounded-md border-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={profile.phone}
                onChange={handleProfileChange}
                placeholder="Add phone number"
                className="w-full p-2 border rounded-md border-gray-300"
              />
            </div>
          </div>
          {profileError && <div className="text-red-600 text-sm mt-2">{profileError}</div>}
          <div className="mt-4">
            <Button
              onClick={handleUpdateProfile}
              disabled={isSubmitting}
              className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white"
            >
              {isSubmitting ? "Updating..." : "Update Profile"}
            </Button>
            {profileSuccessMessage && (
              <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 text-green-600 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-sm text-green-800 font-medium">{profileSuccessMessage}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Change Password */}
        <div className="border rounded-lg p-6">
          <h3 className="font-medium text-lg mb-4">Change Password</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input
                type="password"
                placeholder="Enter current password"
                className="w-full p-2 border rounded-md border-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                className="w-full p-2 border rounded-md border-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                placeholder="Confirm new password"
                className="w-full p-2 border rounded-md border-gray-300"
              />
            </div>
          </div>
          <div className="mt-4">
            <Button
              onClick={handleChangePassword}
              disabled={isSubmitting}
              className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white"
            >
              {isSubmitting ? "Changing..." : "Change Password"}
            </Button>
          </div>
        </div>

        {/* Delete Account */}
        <div className="border border-red-200 rounded-lg p-6 bg-red-50">
          <h3 className="font-medium text-lg text-red-700 mb-2">Delete Account</h3>
          <p className="text-sm text-red-600 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <Button
            onClick={handleDeleteAccount}
            variant="destructive"
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsTab;