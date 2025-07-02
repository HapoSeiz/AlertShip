"use client"

import { useState, useEffect } from "react"
import { Nunito } from "next/font/google"
import { Button } from "@/components/ui/button"
import { Calendar, List, Map, X } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { useAuthModals } from "@/hooks/useAuthModals"
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
      isSignUpOpen, isLogInOpen, isLoggedIn, user,
      openSignUp, openLogIn, closeSignUp, closeLogIn,
      switchToLogIn, switchToSignUp, handleLogin, handleLogout,
      setUser, setIsLoggedIn
    } = useAuthModals()

  // Navigation handler for hyperlinks
  const handleNavigate = (page) => {
      if (page === "home") router.push("/")
      else if (page === "about") router.push("/about")
      else if (page === "contact") router.push("/contact")
      else if (page === "faqs") router.push("/faqs")
      else if (page === "dashboard") router.push("/dashboard")
      else if (page === "report") router.push("/report")
      else router.push("/")
  }

  const handleBackToOutages = () => {
    setShowUpcomingOutages(false)
  }

  const handleViewUpcomingOutages = () => {
    setShowUpcomingOutages(true)
  }

  if (showUpcomingOutages) {
    return (
      <div className={`min-h-screen bg-[#F9FAFB] ${nunito.className}`}>
        {/* Header */}
        <Header
          currentPage="outages"
          isLoggedIn={isLoggedIn}
          onLoginOpen={openLogIn}
          onSignUpOpen={openSignUp}
          onLogout={handleLogout}
          onNavigate={(page) => router.push(page === 'home' ? '/' : `/${page}`)}
        />

        {/* Main Content */}
        <main className="px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-8 sm:pb-12">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1F2937] mb-2">
                    Upcoming Scheduled Outages
                  </h1>
                  <p className="text-gray-600">Planned maintenance and scheduled outages in {location}</p>
                </div>
                <Button
                  onClick={handleBackToOutages}
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center ml-4"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </Button>
              </div>
            </div>

            {/* Calendar View */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[#1F2937]">
                  <Calendar className="inline-block w-5 h-5 mr-2 text-[#4F46E5]" />
                  {format(currentMonth, "MMMM yyyy")}
                </h2>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-sm"
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-sm"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  >
                    Next
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2 mb-4 text-center text-sm font-medium text-gray-700">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>
              <div className="grid grid-cols-7 gap-2 text-sm">
                {(() => {
                  // Get days in month
                  const monthStart = startOfMonth(currentMonth)
                  const monthEnd = endOfMonth(currentMonth)
                  const startDate = monthStart
                  const endDate = monthEnd

                  const dateFormat = "d"
                  const days = eachDayOfInterval({ start: startDate, end: endDate })

                  // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
                  const startDay = getDay(monthStart)

                  // Create empty cells for days before the start of the month
                  const emptyCellsBefore = Array.from({ length: startDay }, (_, i) => (
                    <div key={`empty-before-${i}`} className="h-24 p-1 border rounded-lg bg-gray-50 text-gray-400">
                      {/* Empty cell */}
                    </div>
                  ))

                  // Create cells for each day of the month
                  const dayCells = days.map((day) => {
                    // Check if this day has any outages (for demo purposes)
                    const hasElectricityOutage = day.getDate() === 15
                    const hasWaterOutage = day.getDate() === 21

                    return (
                      <div
                        key={day.toString()}
                        className={`h-24 p-1 border rounded-lg ${isToday(day) ? "bg-blue-50 border-blue-200" : ""}`}
                      >
                        <div className={`${isToday(day) ? "font-bold text-blue-600" : ""}`}>
                          {format(day, dateFormat)}
                        </div>
                        {hasElectricityOutage && (
                          <div className="mt-1 p-1 text-xs bg-[#F59E0B]/20 text-[#F59E0B] rounded">Electricity</div>
                        )}
                        {hasWaterOutage && (
                          <div className="mt-1 p-1 text-xs bg-[#4F46E5]/20 text-[#4F46E5] rounded">Water</div>
                        )}
                      </div>
                    )
                  })

                  // Calculate how many empty cells we need after the month
                  const totalCells = 42 // 6 rows of 7 days
                  const emptyCellsAfterCount = totalCells - emptyCellsBefore.length - dayCells.length

                  // Create empty cells for days after the end of the month
                  const emptyCellsAfter = Array.from({ length: emptyCellsAfterCount }, (_, i) => (
                    <div key={`empty-after-${i}`} className="h-24 p-1 border rounded-lg bg-gray-50 text-gray-400">
                      {/* Empty cell */}
                    </div>
                  ))

                  return [...emptyCellsBefore, ...dayCells, ...emptyCellsAfter]
                })()}
              </div>
            </div>

            {/* Upcoming Outages List */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h2 className="text-xl font-semibold text-[#1F2937] mb-6">Scheduled Outages</h2>

              <div className="space-y-6">
                {/* Scheduled Outage Item */}
                <div className="border-l-4 border-[#F59E0B] pl-4 py-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-medium text-[#1F2937]">Electricity Maintenance</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Scheduled maintenance of electrical lines and transformers
                      </p>
                    </div>
                    <div className="mt-2 sm:mt-0 text-sm font-medium">June 15, 2023 • 10:00 AM - 2:00 PM</div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">Sector 15</span>
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">Block A</span>
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">Block B, C</span>
                    <span className="text-xs bg-[#F59E0B]/20 text-[#F59E0B] px-2 py-1 rounded">4 hours</span>
                  </div>
                </div>

                {/* Scheduled Outage Item */}
                <div className="border-l-4 border-[#4F46E5] pl-4 py-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-medium text-[#1F2937]">Water Supply Maintenance</h3>
                      <p className="text-sm text-gray-600 mt-1">Pipeline cleaning and pressure testing</p>
                    </div>
                    <div className="mt-2 sm:mt-0 text-sm font-medium">June 21, 2023 • 8:00 AM - 12:00 PM</div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">Phase 2</span>
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                      Main Road, Park Avenue
                    </span>
                    <span className="text-xs bg-[#4F46E5]/20 text-[#4F46E5] px-2 py-1 rounded">4 hours</span>
                  </div>
                </div>

                {/* Scheduled Outage Item */}
                <div className="border-l-4 border-[#F59E0B] pl-4 py-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-medium text-[#1F2937]">Electricity Grid Upgrade</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Installation of new smart meters and grid modernization
                      </p>
                    </div>
                    <div className="mt-2 sm:mt-0 text-sm font-medium">July 5, 2023 • 9:00 AM - 3:00 PM</div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">Sector 12</span>
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">All Blocks</span>
                    <span className="text-xs bg-[#F59E0B]/20 text-[#F59E0B] px-2 py-1 rounded">6 hours</span>
                  </div>
                </div>
              </div>

              {/* Subscribe for Notifications */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-[#1F2937]">Get Notified About Scheduled Outages</h3>
                    <p className="text-sm text-gray-600 mt-1">Receive alerts before scheduled outages in your area</p>
                  </div>
                  <Button
                    onClick={() => {
                      if (isLoggedIn) {
                          setShowNotificationModal(true)
                      } else {
                          openLogIn()
                      }
                    }}
                    className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white whitespace-nowrap"
                  >
                    Subscribe to Alerts
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
        <NotificationModal
              isOpen={showNotificationModal}
              onClose={() => setShowNotificationModal(false)}
              isLoggedIn={isLoggedIn}
              onOpenLogin={openLogIn}
            />
      </div>
    )
  }

  // Main Outage Page
  return (
    <div className={`min-h-screen bg-[#F9FAFB] ${nunito.className}`}>
      {/* Header */}
      <Header
        currentPage="outages"
        isLoggedIn={isLoggedIn}
        onLoginOpen={openLogIn}
        onSignUpOpen={openSignUp}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
      />

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
                onClick={handleViewUpcomingOutages}
                className="bg-white border border-gray-300 text-[#1F2937] hover:bg-gray-50 flex items-center"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Upcoming Outages
              </Button>

              <Button
                onClick={() => {
                  if (!isLoggedIn) {
                    sessionStorage.setItem("postLoginAction", "report");
                    openLogIn();
                    router.push("/report")
                    return;
                  } else {
                    router.push("/report")
                  }
                }}
                className="bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-white"
              >
                {!isLoggedIn ? "Login to Report" : "Report New Issue"}
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
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium text-yellow-600">Partial Outage</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Affected Localities:</span>
                  <span className="font-medium text-red-600">3 Areas</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-medium">2 minutes ago</span>
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
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-600">Normal</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Affected Localities:</span>
                  <span className="font-medium text-green-600">0 Areas</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-medium">5 minutes ago</span>
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
                  {outages.length > 0 ? (
                    outages.map((report) => (
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
                            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>

                        {/* Report Content */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-[#1F2937] capitalize">
                              {report.type === "electricity" ? "Electricity Issue" : "Water Issue"} - {report.locality}
                            </h3>
                            <span className="text-sm text-gray-500">Just now</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{report.description}</p>

                          <div className="flex items-center space-x-4 mt-2">
                            <span className={`text-xs px-2 py-1 rounded ${
                              report.type === "electricity"
                                ? "bg-red-100 text-red-700"
                                : "bg-blue-100 text-blue-700"
                            }`}>
                              {report.type === "electricity" ? "Power" : "Water"}
                            </span>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">
                              Official
                            </span>
                            <span className="text-xs text-gray-500">Reported in {report.city}</span>
                          </div>

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
                                    <span className="font-medium">
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
                                  {report.reportedAt && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Reported At:</span>
                                      <span className="font-medium">
                                        {new Date(report.reportedAt).toLocaleString()}
                                      </span>
                                    </div>
                                  )}
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
      <AuthModals
        isSignUpOpen={isSignUpOpen}
        isLogInOpen={isLogInOpen}
        onCloseSignUp={closeSignUp}
        onCloseLogIn={closeLogIn}
        onSwitchToLogIn={switchToLogIn}
        onSwitchToSignUp={switchToSignUp}
        onLogin={handleLogin}
      />

    </div>
  )
}