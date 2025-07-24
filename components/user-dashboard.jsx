"use client"

import React from "react";
import { useDashboard } from "@/hooks/useDashboard";
import { useDashboardHandlers } from "@/hooks/useDashboardHandlers";
import { DashboardProvider, useDashboardContext } from "@/contexts/DashboardContext";

import OutagesPage from "@/components/dashboard/OutagesPage";
import OverviewTab from "@/components/dashboard/OverviewTab";
import MyReportsTab from "@/components/dashboard/MyReportsTab";
import SavedLocationsTab from "@/components/dashboard/SavedLocationsTab";
import NotificationSettingsTab from "@/components/dashboard/NotificationSettingsTab";
import AccountSettingsTab from "@/components/dashboard/AccountSettingsTab";
import AddLocationModal from "@/components/dashboard/AddLocationModal";

// Component that renders dashboard content using context
function DashboardContent({ locationSuccessMessage }) {
  const { activeTab, setActiveTab } = useDashboardContext();

  return (
    <>
      {/* Dashboard Tabs Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden mb-6">
        <div className="border-b">
          <div className="flex overflow-x-auto">
            {[
              { id: "overview", label: "Overview" },
              { id: "reports", label: "My Reports" },
              { id: "locations", label: "Saved Locations" },
              { id: "notifications", label: "Notification Settings" },
              { id: "account", label: "Account Settings" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-b-2 border-[#4F46E5] text-[#4F46E5]"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Location Success Message (moved below tabs) */}
      {locationSuccessMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-green-600 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-green-800 font-medium">{locationSuccessMessage}</p>
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="p-6">
          {activeTab === "overview" && <OverviewTab />}
          {activeTab === "reports" && <MyReportsTab />}
          {activeTab === "locations" && <SavedLocationsTab />}
          {activeTab === "notifications" && <NotificationSettingsTab />}
          {activeTab === "account" && <AccountSettingsTab />}
        </div>
      </div>
    </>
  );
}

export default function UserDashboard({ user, onLogout }) {
  const dashboardState = useDashboard(user);
  const handlers = useDashboardHandlers(user, dashboardState);

  const { showOutagesPage } = dashboardState;

  // Handle outages page view
  if (showOutagesPage) {
    return (
      <DashboardProvider dashboardState={dashboardState} handlers={handlers} user={user}>
        <OutagesPage />
      </DashboardProvider>
    );
  }

  return (
    <DashboardProvider dashboardState={dashboardState} handlers={handlers} user={user}>
      <div className="bg-[#F9FAFB] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Header */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2937]">
                  {user ? `Welcome, ${user.name}` : "Welcome"}
                </h1>
                <p className="text-gray-600 mt-1">Stay updated with outages in your area</p>
              </div>
            </div>
          </div>

          <DashboardContent locationSuccessMessage={dashboardState.locationSuccessMessage} />
        </div>
        {/* Global Add Location Modal */}
        <AddLocationModal />
      </div>
    </DashboardProvider>
  );
}