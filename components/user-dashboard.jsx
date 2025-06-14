"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Bell, Settings, LogOut, MapPin, Calendar, AlertTriangle, MessageSquare } from "lucide-react"

export default function UserDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("overview")

  // Mock data for the dashboard
  const recentReports = [
    {
      id: 1,
      type: "electricity",
      location: "Sector 15, Block A",
      date: "2023-06-01",
      status: "resolved",
      description: "Power outage due to transformer failure",
    },
    {
      id: 2,
      type: "water",
      location: "Phase 2, Main Road",
      date: "2023-05-28",
      status: "pending",
      description: "Low water pressure in the morning",
    },
  ]

  const upcomingOutages = [
    {
      id: 1,
      type: "electricity",
      location: "Sector 15",
      date: "2023-06-15",
      time: "10:00 AM - 2:00 PM",
      description: "Scheduled maintenance of electrical lines",
    },
    {
      id: 2,
      type: "water",
      location: "Phase 2",
      date: "2023-06-21",
      time: "8:00 AM - 12:00 PM",
      description: "Pipeline cleaning and pressure testing",
    },
  ]

  const notificationSettings = {
    browser: true,
    whatsapp: true,
    email: false,
  }

  const savedLocations = [
    {
      id: 1,
      name: "Home",
      address: "123 Main Street, Sector 15",
    },
    {
      id: 2,
      name: "Office",
      address: "456 Business Park, Phase 2",
    },
  ]

  return (
    <div className="bg-[#F9FAFB] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2937]">Welcome, {user.name}</h1>
              <p className="text-gray-600 mt-1">Stay updated with outages in your area</p>
            </div>
            <Button
              onClick={onLogout}
              variant="outline"
              className="border-[#1F2937] text-[#1F2937] hover:bg-[#1F2937] hover:text-white flex items-center"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </Button>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden mb-6">
          <div className="border-b">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${
                  activeTab === "overview"
                    ? "border-b-2 border-[#4F46E5] text-[#4F46E5]"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("reports")}
                className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${
                  activeTab === "reports"
                    ? "border-b-2 border-[#4F46E5] text-[#4F46E5]"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                My Reports
              </button>
              <button
                onClick={() => setActiveTab("locations")}
                className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${
                  activeTab === "locations"
                    ? "border-b-2 border-[#4F46E5] text-[#4F46E5]"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Saved Locations
              </button>
              <button
                onClick={() => setActiveTab("notifications")}
                className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${
                  activeTab === "notifications"
                    ? "border-b-2 border-[#4F46E5] text-[#4F46E5]"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Notification Settings
              </button>
              <button
                onClick={() => setActiveTab("account")}
                className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${
                  activeTab === "account"
                    ? "border-b-2 border-[#4F46E5] text-[#4F46E5]"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Account Settings
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Recent Reports Summary */}
                  <div className="border rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-[#1F2937]">Your Recent Reports</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#4F46E5] hover:bg-[#4F46E5]/10"
                        onClick={() => setActiveTab("reports")}
                      >
                        View All
                      </Button>
                    </div>
                    {recentReports.length > 0 ? (
                      <div className="space-y-3">
                        {recentReports.slice(0, 2).map((report) => (
                          <div key={report.id} className="flex items-start space-x-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                report.type === "electricity" ? "bg-[#F59E0B]/20" : "bg-[#4F46E5]/20"
                              }`}
                            >
                              {report.type === "electricity" ? (
                                <Bell className={`w-4 h-4 text-[#F59E0B]`} />
                              ) : (
                                <Bell className={`w-4 h-4 text-[#4F46E5]`} />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-sm">{report.location}</p>
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    report.status === "resolved"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {report.status === "resolved" ? "Resolved" : "Pending"}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">{report.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">You haven't reported any outages yet.</p>
                    )}
                  </div>

                  {/* Upcoming Outages Summary */}
                  <div className="border rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-[#1F2937]">Upcoming Outages</h3>
                      <Button variant="ghost" size="sm" className="text-[#4F46E5] hover:bg-[#4F46E5]/10">
                        View Calendar
                      </Button>
                    </div>
                    {upcomingOutages.length > 0 ? (
                      <div className="space-y-3">
                        {upcomingOutages.map((outage) => (
                          <div key={outage.id} className="flex items-start space-x-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                outage.type === "electricity" ? "bg-[#F59E0B]/20" : "bg-[#4F46E5]/20"
                              }`}
                            >
                              <Calendar
                                className={`w-4 h-4 ${
                                  outage.type === "electricity" ? "text-[#F59E0B]" : "text-[#4F46E5]"
                                }`}
                              />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{outage.location}</p>
                              <p className="text-xs text-gray-500">
                                {outage.date} • {outage.time}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No upcoming scheduled outages in your area.</p>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="border rounded-xl p-4">
                  <h3 className="font-semibold text-[#1F2937] mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex flex-col items-center justify-center border-gray-300 hover:border-[#4F46E5] hover:text-[#4F46E5]"
                    >
                      <AlertTriangle className="w-5 h-5 mb-2" />
                      <span className="text-xs">Report Outage</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex flex-col items-center justify-center border-gray-300 hover:border-[#4F46E5] hover:text-[#4F46E5]"
                    >
                      <MapPin className="w-5 h-5 mb-2" />
                      <span className="text-xs">Add Location</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex flex-col items-center justify-center border-gray-300 hover:border-[#4F46E5] hover:text-[#4F46E5]"
                    >
                      <Bell className="w-5 h-5 mb-2" />
                      <span className="text-xs">Manage Alerts</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex flex-col items-center justify-center border-gray-300 hover:border-[#4F46E5] hover:text-[#4F46E5]"
                    >
                      <Settings className="w-5 h-5 mb-2" />
                      <span className="text-xs">Settings</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* My Reports Tab */}
            {activeTab === "reports" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-[#1F2937]">My Reported Outages</h2>
                  <Button className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white">Report New Outage</Button>
                </div>

                {recentReports.length > 0 ? (
                  <div className="space-y-4">
                    {recentReports.map((report) => (
                      <div key={report.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                report.type === "electricity" ? "bg-[#F59E0B]/20" : "bg-[#4F46E5]/20"
                              }`}
                            >
                              {report.type === "electricity" ? (
                                <Bell className={`w-5 h-5 text-[#F59E0B]`} />
                              ) : (
                                <Bell className={`w-5 h-5 text-[#4F46E5]`} />
                              )}
                            </div>
                            <div>
                              <h3 className="font-medium">{report.location}</h3>
                              <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                              <p className="text-xs text-gray-500 mt-2">Reported on {report.date}</p>
                            </div>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              report.status === "resolved"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {report.status === "resolved" ? "Resolved" : "Pending"}
                          </span>
                        </div>
                        <div className="mt-4 flex justify-end">
                          <Button variant="ghost" size="sm" className="text-sm text-gray-600">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertTriangle className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No Reports Yet</h3>
                    <p className="text-gray-500 mb-6">You haven't reported any outages yet.</p>
                    <Button className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white">Report an Outage</Button>
                  </div>
                )}
              </div>
            )}

            {/* Saved Locations Tab */}
            {activeTab === "locations" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-[#1F2937]">Saved Locations</h2>
                  <Button className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white">Add New Location</Button>
                </div>

                {savedLocations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedLocations.map((location) => (
                      <div key={location.id} className="border rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-[#4F46E5]/10 rounded-full flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-[#4F46E5]" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium">{location.name}</h3>
                              <div className="flex space-x-1">
                                <button className="p-1 hover:bg-gray-100 rounded">
                                  <svg
                                    className="w-4 h-4 text-gray-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                    />
                                  </svg>
                                </button>
                                <button className="p-1 hover:bg-gray-100 rounded">
                                  <svg
                                    className="w-4 h-4 text-gray-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{location.address}</p>
                            <div className="mt-3 flex space-x-2">
                              <Button variant="outline" size="sm" className="text-xs">
                                View Outages
                              </Button>
                              <Button variant="outline" size="sm" className="text-xs">
                                Set as Default
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MapPin className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No Saved Locations</h3>
                    <p className="text-gray-500 mb-6">Add locations to quickly check for outages.</p>
                    <Button className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white">Add Location</Button>
                  </div>
                )}
              </div>
            )}

            {/* Notification Settings Tab */}
            {activeTab === "notifications" && (
              <div>
                <h2 className="text-xl font-semibold text-[#1F2937] mb-6">Notification Settings</h2>

                <div className="space-y-6">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[#4F46E5]/10 rounded-full flex items-center justify-center">
                          <Bell className="w-5 h-5 text-[#4F46E5]" />
                        </div>
                        <div>
                          <h3 className="font-medium">Browser Notifications</h3>
                          <p className="text-sm text-gray-600">Receive alerts directly in your browser</p>
                        </div>
                      </div>
                      <div className="relative inline-block w-12 h-6 rounded-full bg-gray-200">
                        <input
                          type="checkbox"
                          className="opacity-0 w-0 h-0"
                          checked={notificationSettings.browser}
                          readOnly
                        />
                        <span
                          className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors duration-200 ${
                            notificationSettings.browser ? "bg-[#4F46E5]" : "bg-gray-300"
                          }`}
                        ></span>
                        <span
                          className={`absolute cursor-pointer w-4 h-4 top-1 bg-white rounded-full transition-transform duration-200 ${
                            notificationSettings.browser ? "transform translate-x-7" : "transform translate-x-1"
                          }`}
                        ></span>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[#4F46E5]/10 rounded-full flex items-center justify-center">
                          <MessageSquare className="w-5 h-5 text-[#4F46E5]" />
                        </div>
                        <div>
                          <h3 className="font-medium">WhatsApp Notifications</h3>
                          <p className="text-sm text-gray-600">Receive alerts via WhatsApp messages</p>
                        </div>
                      </div>
                      <div className="relative inline-block w-12 h-6 rounded-full bg-gray-200">
                        <input
                          type="checkbox"
                          className="opacity-0 w-0 h-0"
                          checked={notificationSettings.whatsapp}
                          readOnly
                        />
                        <span
                          className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors duration-200 ${
                            notificationSettings.whatsapp ? "bg-[#4F46E5]" : "bg-gray-300"
                          }`}
                        ></span>
                        <span
                          className={`absolute cursor-pointer w-4 h-4 top-1 bg-white rounded-full transition-transform duration-200 ${
                            notificationSettings.whatsapp ? "transform translate-x-7" : "transform translate-x-1"
                          }`}
                        ></span>
                      </div>
                    </div>
                    {notificationSettings.whatsapp && (
                      <div className="mt-3 pl-12">
                        <p className="text-sm text-gray-600">Connected number: +91 98765 43210</p>
                        <Button variant="link" size="sm" className="text-[#4F46E5] p-0 h-auto text-sm">
                          Change Number
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[#4F46E5]/10 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-[#4F46E5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-medium">Email Notifications</h3>
                          <p className="text-sm text-gray-600">Receive alerts via email</p>
                        </div>
                      </div>
                      <div className="relative inline-block w-12 h-6 rounded-full bg-gray-200">
                        <input
                          type="checkbox"
                          className="opacity-0 w-0 h-0"
                          checked={notificationSettings.email}
                          readOnly
                        />
                        <span
                          className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors duration-200 ${
                            notificationSettings.email ? "bg-[#4F46E5]" : "bg-gray-300"
                          }`}
                        ></span>
                        <span
                          className={`absolute cursor-pointer w-4 h-4 top-1 bg-white rounded-full transition-transform duration-200 ${
                            notificationSettings.email ? "transform translate-x-7" : "transform translate-x-1"
                          }`}
                        ></span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Button className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white">Save Changes</Button>
                </div>
              </div>
            )}

            {/* Account Settings Tab */}
            {activeTab === "account" && (
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
                          value={user.name}
                          className="w-full p-2 border rounded-md border-gray-300"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                          type="email"
                          value={user.email}
                          className="w-full p-2 border rounded-md border-gray-300"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input
                          type="tel"
                          placeholder="Add phone number"
                          className="w-full p-2 border rounded-md border-gray-300"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white">Update Profile</Button>
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
                      <Button className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white">Change Password</Button>
                    </div>
                  </div>

                  {/* Delete Account */}
                  <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                    <h3 className="font-medium text-lg text-red-700 mb-2">Delete Account</h3>
                    <p className="text-sm text-red-600 mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <Button variant="destructive" className="bg-red-600 hover:bg-red-700 text-white">
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
