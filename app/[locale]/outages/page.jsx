"use client"

import { useState, useEffect } from "react"
import { Nunito } from "next/font/google"
import { Button } from "@/components/ui/button"
import { Calendar, List, Map, X } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { useAuth } from "@/contexts/AuthContext";
import { fetchOutageReportsByCity } from "@/firebase/firestoreHelpers"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday } from "date-fns"
import { Input } from "@/components/ui/input"
import { NotificationModal } from "@/components/notification-modal"
import { AuthModals } from "@/components/auth-modals"
import OutageMap from "@/components/outage-map"

const nunito = Nunito({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-nunito",
  })

export default function OutagesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const location = searchParams.get('location')

  const [outages, setOutages] = useState([])
  const [showUpcomingOutages, setShowUpcomingOutages] = useState(false)
  const [showReportForm, setShowReportForm] = useState(false)
  const [viewMode, setViewMode] = useState("list") // "list" or "map"
  // Add a new state to track which outage details are being shown
  const [expandedOutageId, setExpandedOutageId] = useState(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showInPageLogin, setShowInPageLogin] = useState(false)
  const [showNotificationModal, setShowNotificationModal] = useState(false)

  useEffect(() => {
    const fetchReports = async () => {
      const reports = await fetchOutageReportsByCity(location);
      setOutages(reports);
    }
    fetchReports();
  }, [location]);

  const {
    isAuthenticated, user, openSignUp, openLogIn, signOut
  } = useAuth();

  // Navigation handler for hyperlinks
  const handleBackToOutages = () => {
    setShowUpcomingOutages(false)
  }

  const handleViewUpcomingOutages = () => {
    setShowUpcomingOutages(true)
  }

  // Main Outage Page
  // Helper to get unique localities and latest timestamp for a given type
  const getStatusData = (type) => {
    const filtered = outages.filter((r) => r.type === type);
    const localities = Array.from(new Set(filtered.map((r) => r.locality)));
    // Use 'timestamp' or fallback to 'reportedAt'
    const timestamps = filtered.map((r) => r.timestamp || r.reportedAt).filter(Boolean);
    const latestTimestamp = timestamps.length > 0 ? new Date(Math.max(...timestamps.map((t) => new Date(t).getTime()))) : null;
    return {
      count: localities.length,
      latestTimestamp,
    };
  };

  const electricityStatus = getStatusData("electricity");
  const waterStatus = getStatusData("water");

  // Helper to format time ago
  const getTimeAgo = (date) => {
    if (!date) return "-";
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins === 1) return "1 minute ago";
    if (diffMins < 60) return `${diffMins} minutes ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return "1 hour ago";
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  };

  // Helper to format 'Reported At' as dd/mm/yyyy, hour:minute AM/PM (no seconds)
  const formatReportedAt = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    let hour = d.getHours();
    const minute = String(d.getMinutes()).padStart(2, '0');
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12;
    return `${day}/${month}/${year}, ${hour}:${minute} ${ampm}`;
  };

  // Sort outages: official first (by timestamp desc), then crowdsourced (by timestamp desc)
  const sortedOutages = [...outages].sort((a, b) => {
    if (a.source === 'official' && b.source !== 'official') return -1;
    if (a.source !== 'official' && b.source === 'official') return 1;
    // Both same source, sort by timestamp desc
    const aTime = new Date(a.timestamp || a.reportedAt).getTime();
    const bTime = new Date(b.timestamp || b.reportedAt).getTime();
    return bTime - aTime;
  });

  return (
    <div className={`min-h-screen bg-[#F9FAFB] ${nunito.className}`}>
      {/* Header */}
      <Header currentPage="outages" />

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-8 sm:pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Location Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1F2937] mb-2">
                Outages in {location || 'your area'}
              </h1>
              <p className="text-gray-600">Real-time electricity and water outage information</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => router.push(`/outages/upcoming${location ? `?location=${encodeURIComponent(location)}` : ''}`)}
                className="bg-white border border-gray-300 text-[#1F2937] hover:bg-gray-50 flex items-center"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Upcoming Outages
              </Button>

              <Button
                onClick={() => {
                  if (!isAuthenticated) {
                    openLogIn();
                  } else {
                    router.push("/report")
                  }
                }}
                className="bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-white"
              >
                {!isAuthenticated ? "Login to Report" : "Report New Issue"}
              </Button>
            </div>
          </div>

          {/* View Toggle */}
          <div className="bg-white rounded-lg p-2 inline-flex mb-6">
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-md flex items-center ${
                viewMode === "list" ? "bg-[#4F46E5] text-white" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <List className="w-4 h-4 mr-2" />
              List View
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`px-4 py-2 rounded-md flex items-center ${
                viewMode === "map" ? "bg-[#4F46E5] text-white" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Map className="w-4 h-4 mr-2" />
              Map View
            </button>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Electricity Status */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-[#F59E0B] rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#1F2937]">Electricity</h3>
                    <p className="text-sm text-gray-500">Current Status</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${electricityStatus.count > 0 ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                  <span className={`text-sm font-medium ${electricityStatus.count > 0 ? 'text-yellow-600' : 'text-green-600'}`}>{electricityStatus.count > 0 ? 'Partial Outage' : 'Normal'}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Affected Localities:</span>
                  <span className={`font-medium ${electricityStatus.count > 0 ? 'text-red-600' : 'text-green-600'}`}>{electricityStatus.count} {electricityStatus.count === 1 ? 'Area' : 'Areas'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-medium">{getTimeAgo(electricityStatus.latestTimestamp)}</span>
                </div>
              </div>
            </div>

            {/* Water Status */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-[#4F46E5] rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#1F2937]">Water</h3>
                    <p className="text-sm text-gray-500">Current Status</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${waterStatus.count > 0 ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                  <span className={`text-sm font-medium ${waterStatus.count > 0 ? 'text-yellow-600' : 'text-green-600'}`}>{waterStatus.count > 0 ? 'Partial Outage' : 'Normal'}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Affected Localities:</span>
                  <span className={`font-medium ${waterStatus.count > 0 ? 'text-red-600' : 'text-green-600'}`}>{waterStatus.count} {waterStatus.count === 1 ? 'Area' : 'Areas'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-medium">{getTimeAgo(waterStatus.latestTimestamp)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Map View */}
          {viewMode === "map" && (
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <OutageMap />
            </div>
          )}

          {/* List View */}
          {viewMode === "list" && (
            <>
              {/* Legend */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h3 className="text-lg font-semibold text-[#1F2937]">Report Sources</h3>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center">
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium mr-2">
                        Official
                      </span>
                      <span className="text-sm text-gray-600">Verified by authorities</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium mr-2">
                        Crowdsourced
                      </span>
                      <span className="text-sm text-gray-600">Reported by community</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <h2 className="text-xl font-semibold text-[#1F2937] mb-6">Recent Reports</h2>
                <div className="space-y-4">
                  {sortedOutages.length > 0 ? (
                    sortedOutages.map((report) => (
                      <div
                        key={report.id}
                        className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
                      >
                        {/* Icon bubble based on type */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          report.type === "electricity" ? "bg-red-100" : "bg-blue-100"
                        }`}>
                          {report.type === "electricity" ? (
                            <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            // Water drop icon (color #4F46E5)
                            <svg className="w-5 h-5 text-[#4F46E5]" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 2C10 2 4 9.5 4 13a6 6 0 0012 0c0-3.5-6-11-6-11zm0 16a4 4 0 01-4-4c0-2.22 2.67-6.22 4-8.09C11.33 7.78 14 11.78 14 14a4 4 0 01-4 4z" />
                            </svg>
                          )}
                        </div>

                        {/* Report Content */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-[#1F2937] capitalize">
                              {report.locality}
                            </h3>
                            {/* Remove 'just now' label */}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                          {/* Tag for Official or Crowdsourced */}
                          {report.source === 'official' ? (
                            <span style={{ background: '#d1fae5', color: '#059669', fontWeight: 400, borderRadius: '6px', padding: '1px 8px', fontSize: '0.82rem', lineHeight: 1.2, display: 'inline-block', margin: '12px 0 0 0' }}>Official</span>
                          ) : (
                            <span style={{ background: '#dbeafe', color: '#2563eb', fontWeight: 400, borderRadius: '6px', padding: '1px 8px', fontSize: '0.82rem', lineHeight: 1.2, display: 'inline-block', margin: '12px 0 0 0' }}>Crowdsourced</span>
                          )}

                          {/* Details Toggle */}
                          <div>
                            <Button
                              variant="outline"
                              size="sm"
                              className={`mt-3 text-xs ${
                                report.type === "electricity"
                                  ? "border-red-300 text-red-700 hover:bg-red-100"
                                  : "border-blue-300 text-blue-700 hover:bg-blue-100"
                              }`}
                              onClick={() =>
                                setExpandedOutageId(
                                  expandedOutageId === report.id ? null : report.id
                                )
                              }
                            >
                              {expandedOutageId === report.id ? "Hide Details" : "View Details"}
                            </Button>

                            {expandedOutageId === report.id && (
                              <div
                                className={`mt-4 p-4 border rounded-lg ${
                                  report.type === "electricity"
                                    ? "bg-red-50 border-red-200"
                                    : "bg-blue-50 border-blue-200"
                                }`}
                              >
                                <h4
                                  className={`font-medium mb-2 ${
                                    report.type === "electricity" ? "text-red-800" : "text-blue-800"
                                  }`}
                                >
                                  {report.type === "electricity" ? "Outage Details" : "Issue Details"}
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Location:</span>
                                    <span className="font-medium break-words text-right" style={{maxWidth: '180px', display: 'block'}}>
                                      {report.locality}, {report.city}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">State:</span>
                                    <span className="font-medium">{report.state}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Pincode:</span>
                                    <span className="font-medium">{report.pinCode}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Reported At:</span>
                                    <span className="font-medium">{formatReportedAt(report.timestamp || report.reportedAt)}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No reports found for this city.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />
      <AuthModals />

    </div>
  )
}