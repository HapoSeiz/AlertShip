import React from "react";
import { Button } from "@/components/ui/button";
import { MapPin, AlertTriangle, Bell, Settings, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDashboardContext } from "@/contexts/DashboardContext";

// Props: recentReports, upcomingOutages, setActiveTab, setShowCalendarPage, setShowOutagesPage, setShowAddLocationModal
export default function OverviewTab() {
  const router = useRouter();
  const {
    recentReports = [],
    upcomingOutages = [],
    setActiveTab,
    setShowCalendarPage,
    setShowOutagesPage,
    setShowAddLocationModal,
  } = useDashboardContext();
  
  return (
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
              onClick={() => setActiveTab && setActiveTab("reports")}
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
                      // Bolt icon (yellow)
                      <svg className="w-4 h-4 text-[#F59E0B]" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      // Water drop icon (blue)
                      <svg className="w-4 h-4 text-[#4F46E5]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2C10 2 4 9.5 4 13a6 6 0 0012 0c0-3.5-6-11-6-11zm0 16a4 4 0 01-4-4c0-2.22 2.67-6.22 4-8.09C11.33 7.78 14 11.78 14 14a4 4 0 01-4 4z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{report.locality}</p>
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
            <Button
              variant="ghost"
              size="sm"
              className="text-[#4F46E5] hover:bg-[#4F46E5]/10"
              onClick={() => setShowCalendarPage && setShowCalendarPage(true)}
            >
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
                    <div className="flex items-center gap-1">
                      <p className="font-medium text-sm">{outage.location}</p>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded-full ${
                          outage.type === "electricity"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-indigo-100 text-indigo-700"
                        }`}
                      >
                        {outage.type === "electricity" ? "Electricity" : "Water"}
                      </span>
                    </div>
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
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center justify-center border-gray-300 hover:border-[#4F46E5] hover:text-[#4F46E5]"
            onClick={() => setShowOutagesPage && setShowOutagesPage(true)}
          >
            <MapPin className="w-5 h-5 mb-2" />
            <span className="text-xs">Check Outages</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center justify-center border-gray-300 hover:border-[#4F46E5] hover:text-[#4F46E5]"
            onClick={() => router.push("/report")}
          >
            <AlertTriangle className="w-5 h-5 mb-2" />
            <span className="text-xs">Report Outage</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center justify-center border-gray-300 hover:border-[#4F46E5] hover:text-[#4F46E5]"
            onClick={() => setShowAddLocationModal && setShowAddLocationModal(true)}
          >
            <MapPin className="w-5 h-5 mb-2" />
            <span className="text-xs">Add Location</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center justify-center border-gray-300 hover:border-[#4F46E5] hover:text-[#4F46E5]"
            onClick={() => setActiveTab && setActiveTab("notifications")}
          >
            <Bell className="w-5 h-5 mb-2" />
            <span className="text-xs">Manage Alerts</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center justify-center border-gray-300 hover:border-[#4F46E5] hover:text-[#4F46E5]"
            onClick={() => setActiveTab && setActiveTab("account")}
          >
            <Settings className="w-5 h-5 mb-2" />
            <span className="text-xs">Settings</span>
          </Button>
        </div>
      </div>
    </div>
  );
}