"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bell, Settings, MapPin, Calendar, AlertTriangle, MessageSquare, X } from "lucide-react"
import dynamic from "next/dynamic";
import { Textarea } from "@/components/ui/textarea"
import { useHydration } from "@/hooks/useHydration"


const SearchBox = dynamic(() => import("@mapbox/search-js-react").then(mod => mod.SearchBox), {
  ssr: false,
});

export default function UserDashboard({ user }) {
  const isHydrated = useHydration();
  const [activeTab, setActiveTab] = useState("overview")
  const [showAddLocationModal, setShowAddLocationModal] = useState(false)
  const [newLocation, setNewLocation] = useState({ name: "", address: "" })
  const [notificationSettings, setNotificationSettings] = useState({
    browser: false,
    whatsapp: false,
    email: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingLocationId, setEditingLocationId] = useState(null)
  const [locationSuccessMessage, setLocationSuccessMessage] = useState("")

  const [showChangeNumberModal, setShowChangeNumberModal] = useState(false)
  const [newWhatsAppNumber, setNewWhatsAppNumber] = useState("")
  const [showWhatsAppOtp, setShowWhatsAppOtp] = useState(false)
  const [whatsappOtp, setWhatsappOtp] = useState("")
  const [generatedWhatsappOtp, setGeneratedWhatsappOtp] = useState("")
  const [isVerifyingWhatsApp, setIsVerifyingWhatsApp] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [changeNumberErrors, setChangeNumberErrors] = useState({})
  // Add a new state variable for OTP success message
  const [otpSuccessMessage, setOtpSuccessMessage] = useState("")
  const [showCalendarPage, setShowCalendarPage] = useState(false)
  
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [locationToDelete, setLocationToDelete] = useState(null)

  // Add a new state variable for profile update success message
  const [profileSuccessMessage, setProfileSuccessMessage] = useState("")

  // Add calendar state variables - Use a fixed date to prevent hydration issues
  const [currentDate, setCurrentDate] = useState(() => new Date(2023, 5, 1)) // June 2023

  // Load user notification preferences on component mount
  useEffect(() => {
    if (user?.id && typeof window !== "undefined") {
      const savedSettings = localStorage.getItem(`notification_settings_${user.id}`)
      if (savedSettings) {
        try {
          const parsedSettings = JSON.parse(savedSettings)
          setNotificationSettings(parsedSettings)
        } catch (error) {
          console.error("Error parsing notification settings:", error)
          // Set default settings if parsing fails
          setNotificationSettings({
            browser: true,
            whatsapp: false,
            email: false,
          })
        }
      } else {
        // Default settings for new users
        setNotificationSettings({
          browser: true,
          whatsapp: false,
          email: false,
        })
      }
    }
  }, [user?.id])

  // Mock data for the dashboard
  const recentReports = [
    {
      id: 1,
      type: "electricity",
      location: "Sector 15, Block A",
      date: "2023-06-01",
      status: "resolved",
      description: "Power outage due to transformer failure",
      source: "official",
    },
    {
      id: 2,
      type: "water",
      location: "Phase 2, Main Road",
      date: "2023-05-28",
      status: "pending",
      description: "Low water pressure in the morning",
      source: "crowdsourced",
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

  const [savedLocations, setSavedLocations] = useState([
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
  ])

  // Add a new state variable for showing the report page:
  const [showReportPage, setShowReportPage] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [formErrors, setFormErrors] = useState({})

  // Add a new state variable
  const [showOutagesPage, setShowOutagesPage] = useState(false)

  // Add a new state variable to track which report details are expanded:
  const [expandedReportId, setExpandedReportId] = useState(null)

  // Add a new state variable to track which outage details are expanded
  const [expandedOutageId, setExpandedOutageId] = useState(null)

  // Add new state variables for outage details modal
  const [showOutageDetailsModal, setShowOutageDetailsModal] = useState(false)
  const [selectedOutageDetails, setSelectedOutageDetails] = useState(null)

  const [reportFilters, setReportFilters] = useState({
    type: "all", // 'all', 'electricity', 'water'
    severity: "all", // 'all', 'low', 'medium', 'high'
  })

  const [reportForm, setReportForm] = useState({
    type: "electricity",
    description: "",
    locality: "",
    city: "",
    state: "",
    pinCode: "",
    photo: null,
  })

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setReportForm((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: null,
      }))
    }
  }

  // Add these state variables at the top of your component
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [pinCode, setPinCode] = useState('')

  // Add these state variables at the top of your component
  const [locality, setLocality] = useState('')

  // Add this handler function
  const handleAddressRetrieve = (res) => {
    if (res.features && res.features.length > 0) {
      const feature = res.features[0]
      const context = feature.context || []
      
      // Set the full address
      setAddress(feature.place_name || '')
      
      // Extract city from context
      const city = context.find(c => c.id.startsWith('place'))?.text || ''
      setCity(city)
      
      // Extract state from context
      const state = context.find(c => c.id.startsWith('region'))?.text || ''
      setState(state)
    }
  }

  // Calendar Page
  if (showCalendarPage) {
    return (
      <div className="bg-[#F9FAFB] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2937]">Upcoming Outages Calendar</h1>
                <p className="text-gray-600 mt-1">View scheduled outages and maintenance in your area</p>
              </div>
              <Button
                onClick={() => setShowCalendarPage(false)}
                variant="outline"
                className="border-[#1F2937] text-[#1F2937] hover:bg-[#1F2937] hover:text-white flex items-center"
              >
                ← Back to Dashboard
              </Button>
            </div>
          </div>

          {/* Calendar Content */}
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="p-6">
              <div className="space-y-6">
                {/* Calendar Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[#1F2937]">
                    {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newDate = new Date(currentDate)
                        newDate.setMonth(currentDate.getMonth() - 1)
                        setCurrentDate(newDate)
                      }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newDate = new Date(currentDate)
                        newDate.setMonth(currentDate.getMonth() + 1)
                        setCurrentDate(newDate)
                      }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {/* Day headers */}
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                      {day}
                    </div>
                  ))}

                  {/* Calendar days */}
                  {(() => {
                    const year = currentDate.getFullYear()
                    const month = currentDate.getMonth()
                    const firstDay = new Date(year, month, 1)
                    const lastDay = new Date(year, month + 1, 0)
                    const startDate = new Date(firstDay)
                    startDate.setDate(startDate.getDate() - firstDay.getDay())

                    const days = []
                    const currentDateObj = new Date(startDate)

                    for (let i = 0; i < 42; i++) {
                      const day = currentDateObj.getDate()
                      const isCurrentMonth = currentDateObj.getMonth() === month
                      // Avoid hydration mismatch by not comparing with current date during SSR
                      const isToday = isHydrated && currentDateObj.toDateString() === new Date().toDateString()

                      // Check if this date has outages (sample data for June 2023)
                      const hasOutage =
                        isCurrentMonth &&
                        ((month === 5 && year === 2023 && [15, 21].includes(day)) ||
                          (month === 4 && year === 2023 && [10, 25].includes(day)) ||
                          (month === 6 && year === 2023 && [5, 18].includes(day)))

                      days.push(
                        <div
                          key={i}
                          className={`p-2 h-16 border rounded-lg ${
                            isCurrentMonth ? "bg-white" : "bg-gray-50"
                          } ${hasOutage ? "border-red-300 bg-red-50" : "border-gray-200"} ${
                            isToday ? "ring-2 ring-blue-500" : ""
                          }`}
                        >
                          <div
                            className={`text-sm ${
                              isCurrentMonth ? "text-gray-900" : "text-gray-400"
                            } ${isToday ? "font-bold text-blue-600" : ""}`}
                          >
                            {day}
                          </div>
                          {hasOutage && (
                            <div className="mt-1">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            </div>
                          )}
                        </div>,
                      )

                      currentDateObj.setDate(currentDateObj.getDate() + 1)
                    }

                    return days
                  })()}
                </div>

                {/* Outage Details */}
                <div className="border-t pt-6">
                  <h4 className="font-semibold text-[#1F2937] mb-4">
                    Scheduled Outages for {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </h4>
                  <div className="space-y-3">
                    {(() => {
                      const month = currentDate.getMonth()
                      const year = currentDate.getFullYear()

                      // Sample outage data for different months
                      let monthlyOutages = []

                      if (month === 5 && year === 2023) {
                        // June 2023
                        monthlyOutages = upcomingOutages.map((outage) => ({
                          ...outage,
                          source: outage.id === 1 ? "official" : "crowdsourced",
                        }))
                      } else if (month === 4 && year === 2023) {
                        // May 2023
                        monthlyOutages = [
                          {
                            id: 1,
                            type: "water",
                            location: "Sector 12",
                            date: "2023-05-10",
                            time: "9:00 AM - 1:00 PM",
                            description: "Water tank cleaning and maintenance",
                            source: "official",
                          },
                          {
                            id: 2,
                            type: "electricity",
                            location: "Phase 1",
                            date: "2023-05-25",
                            time: "6:00 AM - 10:00 AM",
                            description: "Power grid upgrade work",
                            source: "official",
                          },
                        ]
                      } else if (month === 6 && year === 2023) {
                        // July 2023
                        monthlyOutages = [
                          {
                            id: 1,
                            type: "electricity",
                            location: "Sector 20",
                            date: "2023-07-05",
                            time: "11:00 AM - 3:00 PM",
                            description: "Transformer replacement work",
                            source: "official",
                          },
                          {
                            id: 2,
                            type: "water",
                            location: "Phase 3",
                            date: "2023-07-18",
                            time: "7:00 AM - 11:00 AM",
                            description: "Pipeline repair and testing",
                            source: "crowdsourced",
                          },
                        ]
                      }

                      if (monthlyOutages.length === 0) {
                        return (
                          <div className="text-center py-8">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                              <svg
                                className="w-6 h-6 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <p className="text-gray-600">No scheduled outages for this month</p>
                          </div>
                        )
                      }

                      return monthlyOutages.map((outage) => (
                        <div key={outage.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
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
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <h5 className="font-medium">{outage.location}</h5>
                                <span
                                  className={`text-xs px-2 py-1 rounded font-medium ${
                                    outage.source === "official"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-blue-100 text-blue-700"
                                  }`}
                                >
                                  {outage.source === "official" ? "Official" : "Crowdsourced"}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">{outage.date}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{outage.description}</p>
                            <p className="text-xs text-gray-500 mt-1">Time: {outage.time}</p>
                          </div>
                        </div>
                      ))
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Outages Page
  if (showOutagesPage) {
    const handleViewOutageDetails = (outageId) => {
      // Sample detailed outage data - in real app this would come from API
      const outageDetails = {
        id: outageId,
        title: "Power Outage - Sector 15",
        type: "electricity",
        status: "active",
        priority: "high",
        location: "Sector 15, Block A",
        affectedHouseholds: 150,
        cause: "Transformer failure in main distribution grid",
        crewStatus: "On-site working",
        estimatedRestoration: "2-4 hours",
        reportedAt: "Today at 1:25 PM",
        lastUpdate: "35 minutes ago",
        description:
          "Complete power failure reported in residential area. Maintenance team dispatched to replace faulty transformer unit.",
        timeline: [
          { time: "1:25 PM", event: "Outage Reported", status: "completed" },
          { time: "1:45 PM", event: "Crew Dispatched", status: "completed" },
          { time: "2:00 PM", event: "Work in Progress", status: "current" },
          { time: "4:00 PM", event: "Estimated Restoration", status: "pending" },
        ],
        technicalDetails:
          "Transformer T-15A in the main distribution grid requires replacement due to overheating. The maintenance crew is currently installing a new transformer unit. Power will be restored once the installation is complete and safety checks are performed.",
        safetyNotice:
          "Please avoid using high-power appliances immediately after power restoration to prevent voltage fluctuations.",
      }

      setSelectedOutageDetails(outageDetails)
      setShowOutageDetailsModal(true)
    }
    return (
      <div className="bg-[#F9FAFB] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2937]">Current Outages</h1>
                <p className="text-gray-600 mt-1">View active outages in your saved locations</p>
              </div>
              <Button
                onClick={() => setShowOutagesPage(false)}
                variant="outline"
                className="border-[#1F2937] text-[#1F2937] hover:bg-[#1F2937] hover:text-white flex items-center"
              >
                ← Back to Dashboard
              </Button>
            </div>
          </div>

          {/* Outages Content */}
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="p-6">
              <div className="space-y-6">
                {/* Locations with Outages */}
                {savedLocations.map((location) => (
                  <div key={location.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-[#4F46E5]/10 rounded-full flex items-center justify-center mr-3">
                        <MapPin className="w-5 h-5 text-[#4F46E5]" />
                      </div>
                      <h3 className="text-lg font-semibold text-[#1F2937]">{location.name}</h3>
                    </div>

                    {/* Sample outage data - in a real app, this would come from an API */}
                    {location.id === 1 ? (
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-100">
                          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-[#1F2937]">Power Outage</h4>
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">
                                  Official
                                </span>
                              </div>
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Active</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Electrical grid maintenance affecting multiple blocks in this area.
                            </p>
                            <div className="flex justify-between items-center mt-2">
                              <p className="text-xs text-gray-500">Reported 35 minutes ago</p>
                              <p className="text-xs font-medium text-gray-700">Est. resolution: 2 hours</p>
                            </div>
                            <div className="mt-3">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs border-red-300 text-red-700 hover:bg-red-100"
                                onClick={() => handleViewOutageDetails(location.id)}
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                            <svg
                              className="w-4 h-4 text-green-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-green-800">No active outages reported</p>
                            <p className="text-sm text-green-600">
                              All utilities are functioning normally in this area
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Outage Details Modal */}
        {showOutageDetailsModal && selectedOutageDetails && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-[#1F2937]">{selectedOutageDetails.title}</h2>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          selectedOutageDetails.status === "active"
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {selectedOutageDetails.status === "active" ? "Active" : "Resolved"}
                      </span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">
                        Official
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowOutageDetailsModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - Details */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-[#1F2937] mb-3">Outage Information</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Outage ID:</span>
                          <span className="font-medium">#{selectedOutageDetails.id.toString().padStart(6, "0")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Type:</span>
                          <span className="font-medium capitalize">{selectedOutageDetails.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Priority:</span>
                          <span className="font-medium capitalize">{selectedOutageDetails.priority}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Affected Households:</span>
                          <span className="font-medium">~{selectedOutageDetails.affectedHouseholds} homes</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Crew Status:</span>
                          <span className="font-medium">{selectedOutageDetails.crewStatus}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Est. Restoration:</span>
                          <span className="font-medium">{selectedOutageDetails.estimatedRestoration}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-[#1F2937] mb-3">Description</h3>
                      <p className="text-gray-600 leading-relaxed">{selectedOutageDetails.description}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-[#1F2937] mb-3">Technical Details</h3>
                      <p className="text-gray-600 leading-relaxed">{selectedOutageDetails.technicalDetails}</p>
                    </div>

                    {selectedOutageDetails.safetyNotice && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start">
                          <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium text-yellow-800 mb-1">Safety Notice</h4>
                            <p className="text-sm text-yellow-700">{selectedOutageDetails.safetyNotice}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column - Timeline */}
                  <div>
                    <h3 className="font-semibold text-[#1F2937] mb-4">Timeline</h3>
                    <div className="space-y-4">
                      {selectedOutageDetails.timeline.map((item, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div
                            className={`w-3 h-3 rounded-full mt-2 ${
                              item.status === "completed"
                                ? "bg-green-500"
                                : item.status === "current"
                                  ? "bg-blue-500"
                                  : "bg-gray-300"
                            }`}
                          ></div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4
                                className={`font-medium ${
                                  item.status === "current" ? "text-blue-700" : "text-[#1F2937]"
                                }`}
                              >
                                {item.event}
                              </h4>
                              <span className="text-sm text-gray-500">{item.time}</span>
                            </div>
                            {item.status === "current" && <p className="text-sm text-blue-600 mt-1">In progress...</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const handleAddLocation = (e) => {
    e.preventDefault()

    if (editingLocationId) {
      // Edit existing location
      const locationIndex = savedLocations.findIndex((loc) => loc.id === editingLocationId)
      if (locationIndex !== -1) {
        const updatedLocations = [...savedLocations]
        updatedLocations[locationIndex] = {
          ...updatedLocations[locationIndex],
          name: newLocation.name,
          address: newLocation.address,
        }
        setSavedLocations(updatedLocations)
        console.log("Location updated:", updatedLocations[locationIndex])
        setLocationSuccessMessage(`Location "${newLocation.name}" updated successfully!`)
      }
      setEditingLocationId(null)
    } else {
      // Add new location
      const newLocationItem = {
        id: savedLocations.length > 0 ? Math.max(...savedLocations.map((loc) => loc.id)) + 1 : 1,
        name: newLocation.name,
        address: newLocation.address,
      }
      setSavedLocations([...savedLocations, newLocationItem])
      console.log("Location added:", newLocationItem)
      setLocationSuccessMessage(`Location "${newLocation.name}" added successfully!`)
    }

    // Reset form and close modal
    setNewLocation({ name: "", address: "" })
    setShowAddLocationModal(false)

    // Clear success message after 3 seconds
    setTimeout(() => {
      setLocationSuccessMessage("")
    }, 3000)
  }

  const handleToggleNotification = (type) => {
    const newSettings = {
      ...notificationSettings,
      [type]: !notificationSettings[type],
    }
    
    setNotificationSettings(newSettings)
    
    // Save to localStorage for persistence
    if (user?.id && typeof window !== "undefined") {
      localStorage.setItem(`notification_settings_${user.id}`, JSON.stringify(newSettings))
    }
  }

  const handleSaveNotificationSettings = async () => {
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      // Save to localStorage
      if (user?.id && typeof window !== "undefined") {
        localStorage.setItem(`notification_settings_${user.id}`, JSON.stringify(notificationSettings))
      }
      
      console.log("Notification settings saved:", notificationSettings)
      alert("Notification settings saved successfully!")
    } catch (error) {
      console.error("Error saving settings:", error)
      alert("Failed to save settings. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReportNewOutage = () => {
    // Show the report page
    setShowReportPage(true)
  }

  const handleViewDetails = (reportId) => {
    setExpandedReportId(expandedReportId === reportId ? null : reportId)
  }

  const handleViewOutages = (locationId) => {
    console.log("Viewing outages for location:", locationId)
    alert(`Viewing outages for location ${locationId}`)
  }

  const handleSetAsDefault = (locationId) => {
    console.log("Setting location as default:", locationId)
    alert(`Location ${locationId} set as default`)
  }

  const handleEditLocation = (locationId) => {
    const locationToEdit = savedLocations.find((loc) => loc.id === locationId)
    if (locationToEdit) {
      setNewLocation({ name: locationToEdit.name, address: locationToEdit.address })
      setEditingLocationId(locationId)
      setShowAddLocationModal(true)
    }
  }

  const handleDeleteLocation = (locationId) => {
    const locationToDelete = savedLocations.find((loc) => loc.id === locationId)
    setLocationToDelete(locationToDelete)
    setShowDeleteModal(true)
  }

  const confirmDeleteLocation = () => {
    if (locationToDelete) {
      const updatedLocations = savedLocations.filter((loc) => loc.id !== locationToDelete.id)
      setSavedLocations(updatedLocations)
      console.log("Deleting location:", locationToDelete.id)
      setLocationSuccessMessage(`Location "${locationToDelete.name}" deleted successfully!`)

      // Clear success message after 3 seconds
      setTimeout(() => {
        setLocationSuccessMessage("")
      }, 3000)
    }
    setShowDeleteModal(false)
    setLocationToDelete(null)
  }

  // Modify the handleUpdateProfile function to set the success message instead of showing an alert
  const handleUpdateProfile = async () => {
    setIsSubmitting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setProfileSuccessMessage("Profile updated successfully!")

      // Clear success message after 5 seconds
      setTimeout(() => {
        setProfileSuccessMessage("")
      }, 5000)
    } catch (error) {
      alert("Failed to update profile. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChangePassword = async () => {
    setIsSubmitting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      alert("Password changed successfully!")
    } catch (error) {
      alert("Failed to change password. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      console.log("Deleting account")
      alert("Account deletion initiated. You will be contacted for confirmation.")
    }
  }

  // Generate random 6-digit OTP
  const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  // Start resend timer
  const startResendTimer = () => {
    setResendTimer(60)
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // Send WhatsApp OTP
  const sendWhatsAppOtp = async (phoneNumber) => {
    const newOtp = generateOtp()
    setGeneratedWhatsappOtp(newOtp)
    setIsVerifyingWhatsApp(true)
    setOtpSuccessMessage("") // Clear any previous message

    try {
      // Simulate sending WhatsApp OTP
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // In real implementation, you would send WhatsApp OTP here
      console.log(`WhatsApp OTP sent to ${phoneNumber}: ${newOtp}`)

      // Set success message instead of alert
      setOtpSuccessMessage("OTP Sent Successfully")

      setShowWhatsAppOtp(true)
      startResendTimer()

      // Clear success message after 5 seconds
      setTimeout(() => {
        setOtpSuccessMessage("")
      }, 5000)
    } catch (error) {
      console.error("Error sending WhatsApp OTP:", error)
      setChangeNumberErrors({ whatsapp: "Failed to send OTP. Please try again." })
    } finally {
      setIsVerifyingWhatsApp(false)
    }
  }

  // Verify WhatsApp OTP
  const verifyWhatsAppOtp = async () => {
    if (!whatsappOtp.trim()) {
      setChangeNumberErrors({ whatsappOtp: "OTP is required" })
      return
    }
    if (whatsappOtp.length !== 6) {
      setChangeNumberErrors({ whatsappOtp: "OTP must be 6 digits" })
      return
    }
    if (whatsappOtp !== generatedWhatsappOtp) {
      setChangeNumberErrors({ whatsappOtp: "Invalid OTP. Please try again." })
      return
    }

    setIsVerifyingWhatsApp(true)
    try {
      // Simulate verification
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setWhatsappVerified(true)
      setShowWhatsAppOtp(false)
      setShowChangeNumberModal(false)
      setChangeNumberErrors({})

      // Reset states
      setNewWhatsAppNumber("")
      setWhatsappOtp("")
      setGeneratedWhatsappOtp("")
      setResendTimer(0)

      alert("WhatsApp number changed and verified successfully!")
    } catch (error) {
      setChangeNumberErrors({ whatsappOtp: "Verification failed. Please try again." })
    } finally {
      setIsVerifyingWhatsApp(false)
    }
  }

  // Resend WhatsApp OTP
  const resendWhatsAppOtp = async () => {
    if (resendTimer > 0) return
    await sendWhatsAppOtp(newWhatsAppNumber)
  }

  // Handle change WhatsApp number
  const handleChangeWhatsAppNumber = () => {
    setShowChangeNumberModal(true)
    setNewWhatsAppNumber("")
    setChangeNumberErrors({})
  }

  // Handle submit new number
  const handleSubmitNewNumber = async (e) => {
    e.preventDefault()

    if (!newWhatsAppNumber.trim()) {
      setChangeNumberErrors({ phone: "Phone number is required" })
      return
    }

    if (!/^\+?[0-9]{10,15}$/.test(newWhatsAppNumber.replace(/\s/g, ""))) {
      setChangeNumberErrors({ phone: "Please enter a valid phone number" })
      return
    }

    if (!/^\+?[0-9]{10,15}$/.test(newWhatsAppNumber.replace(/\s/g, ""))) {
      setChangeNumberErrors({ phone: "Please enter a valid phone number" })
      return
    }

    setChangeNumberErrors({})
    await sendWhatsAppOtp(newWhatsAppNumber)
  }

  const handleToggleOutageDetails = (locationId) => {
    setExpandedOutageId(expandedOutageId === locationId ? null : locationId)
  }

  const validateForm = () => {
    const errors = {}
    if (!reportForm.description?.trim()) {
      errors.description = "Description is required"
    }
    if (!reportForm.locality?.trim()) {
      errors.locality = "Locality is required"
    }
    if (!reportForm.city?.trim()) {
      errors.city = "City is required"
    }
    if (!reportForm.state?.trim()) {
      errors.state = "State is required"
    }
    if (!reportForm.pinCode?.trim()) {
      errors.pinCode = "Pin code is required"
    } else if (!/^\d{6}$/.test(reportForm.pinCode)) {
      errors.pinCode = "Please enter a valid 6-digit pin code"
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmitReport = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Send report to Firebase API
      const res = await fetch('/api/outageReports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportForm),
      })
      const result = await res.json()
      if (result.success) {
        setSubmitSuccess(true)
        // Reset form after successful submission
        setReportForm({
          type: "electricity",
          description: "",
          locality: "",
          city: "",
          state: "",
          pinCode: "",
          photo: null,
        })
        setFormErrors({})
      } else {
        alert(result.error || 'Failed to submit report. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting report:', error)
      alert('Failed to submit report. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Report Page
  if (showReportPage) {
    return (
      <div className="bg-[#F9FAFB] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2937]">Report New Outage</h1>
                <p className="text-gray-600 mt-1">Report electricity or water outages in your area</p>
              </div>
              <Button
                onClick={() => setShowReportPage(false)}
                variant="outline"
                className="border-[#1F2937] text-[#1F2937] hover:bg-[#1F2937] hover:text-white flex items-center"
              >
                ← Back to Dashboard
              </Button>
            </div>
          </div>

          {/* Report Form */}
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="p-6">
              {submitSuccess ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-[#1F2937] mb-4">Report Submitted Successfully!</h2>
                  <p className="text-gray-600 mb-6">
                    
                  Thank you for reporting the issue. You will receive updates on the status of your report.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReport} className="space-y-6">
                  {/* Outage Type */}
                  <div>
                    <label className="block text-sm font-medium text-[#1F2937] mb-3">Outage Type</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div
                        className={`border-2 ${
                          reportForm.type === "electricity"
                            ? "border-[#F59E0B] bg-[#F59E0B]/10"
                            : "border-gray-200 hover:border-gray-300"
                        } rounded-lg p-4 cursor-pointer transition-colors`}
                        onClick={() => setReportForm((prev) => ({ ...prev, type: "electricity" }))}
                      >
                        <div className="flex items-center">
                          <div
                            className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                              reportForm.type === "electricity" ? "border-[#F59E0B]" : "border-gray-400"
                            }`}
                          >
                            {reportForm.type === "electricity" && <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />}
                          </div>
                          <div className="flex items-center">
                            <AlertTriangle className="w-5 h-5 mr-2 text-gray-700" />
                            <div>
                              <p className="font-medium">Electricity</p>
                              <p className="text-xs text-gray-500">Power outage or issues</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                          reportForm.type === "water"
                            ? "border-[#4F46E5] bg-[#4F46E5]/10"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setReportForm((prev) => ({ ...prev, type: "water" }))}
                      >
                        <div className="flex items-center">
                          <div
                            className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                              reportForm.type === "water" ? "border-[#4F46E5]" : "border-gray-400"
                            }`}
                          >
                            {reportForm.type === "water" && <div className="w-3 h-3 rounded-full bg-[#4F46E5]" />}
                          </div>
                          <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <div>
                              <p className="font-medium">Water</p>
                              <p className="text-xs text-gray-500">Water supply issues</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  

                  {/* Location Details */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-[#1F2937] mb-4">Location Details</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Locality */}
                      <div>
                        <label htmlFor="locality" className="block text-sm font-medium text-[#1F2937] mb-2">
                          Locality <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            id="locality"
                            name="locality"
                            value={reportForm.locality}
                            onChange={handleFormChange}
                            placeholder="Enter your locality"
                            required
                            className={`pl-10 h-12 w-full border-2 ${
                              formErrors.locality ? "border-red-500" : "border-gray-300"
                            } focus:border-[#4F46E5] focus:ring-0 outline-none rounded-md`}
                          />
                          {formErrors.locality && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.locality}</p>
                          )}
                        </div>
                      </div>

                      {/* City */}
                      <div>
                        <label htmlFor="city" className="block text-sm font-medium text-[#1F2937] mb-2">
                          City <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            id="city"
                            name="city"
                            value={reportForm.city}
                            onChange={handleFormChange}
                            placeholder="Enter your city"
                            required
                            className={`pl-10 h-12 w-full border-2 ${
                              formErrors.city ? "border-red-500" : "border-gray-300"
                            } focus:border-[#4F46E5] focus:ring-0 outline-none rounded-md`}
                          />
                          {formErrors.city && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>
                          )}
                        </div>
                      </div>

                      {/* State */}
                      <div>
                        <label htmlFor="state" className="block text-sm font-medium text-[#1F2937] mb-2">
                          State <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            id="state"
                            name="state"
                            value={reportForm.state}
                            onChange={handleFormChange}
                            placeholder="Enter state name"
                            required
                            className={`pl-10 h-12 w-full border-2 ${
                              formErrors.state ? "border-red-500" : "border-gray-300"
                            } focus:border-[#4F46E5] focus:ring-0 outline-none rounded-md`}
                          />
                          {formErrors.state && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.state}</p>
                          )}
                        </div>
                      </div>

                      {/* Pin Code */}
                      <div>
                        <label htmlFor="pinCode" className="block text-sm font-medium text-[#1F2937] mb-2">
                          Pin Code <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            id="pinCode"
                            name="pinCode"
                            value={reportForm.pinCode}
                            onChange={handleFormChange}
                            placeholder="Enter 6-digit pin code"
                            maxLength={6}
                            pattern="[0-9]*"
                            required
                            className={`pl-10 h-12 w-full border-2 ${
                              formErrors.pinCode ? "border-red-500" : "border-gray-300"
                            } focus:border-[#4F46E5] focus:ring-0 outline-none rounded-md`}
                          />
                          {formErrors.pinCode && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.pinCode}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-[#1F2937] mb-4">Description</h3>
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-[#1F2937] mb-2">
                        Describe the issue <span className="text-red-500">*</span>
                      </label>
                      <Textarea
                        id="description"
                        name="description"
                        value={reportForm.description}
                        onChange={handleFormChange}
                        placeholder="Please provide details about the outage..."
                        required
                        className={`min-h-[100px] w-full border-2 ${
                          formErrors.description ? "border-red-500" : "border-gray-300"
                        } focus:border-[#4F46E5] focus:ring-0 outline-none rounded-md`}
                      />
                      {formErrors.description && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Photo Upload */}
                  <div>
                    <label className="block text-sm font-medium text-[#1F2937] mb-2">Upload Photo (Optional)</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input type="file" id="photo" accept="image/*" className="hidden" />
                      <label htmlFor="photo" className="cursor-pointer">
                        <div className="flex flex-col items-center">
                          <svg
                            className="w-10 h-10 text-gray-400 mb-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          <p className="text-sm text-gray-600">Click to upload a photo of the issue</p>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end pt-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-white px-8 py-3 text-lg font-semibold h-auto"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Submitting...
                        </div>
                      ) : (
                        "Submit Report"
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
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
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-sm">{report.location}</p>
                                  <span
                                    className={`text-xs px-1.5 py-0.5 rounded font-medium bg-blue-100 text-blue-700`}
                                  >
                                    User Report
                                  </span>
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
                        onClick={() => setShowCalendarPage(true)}
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
                      onClick={() => setShowOutagesPage(true)}
                    >
                      <MapPin className="w-5 h-5 mb-2" />
                      <span className="text-xs">Check Outages</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex flex-col items-center justify-center border-gray-300 hover:border-[#4F46E5] hover:text-[#4F46E5]"
                      onClick={handleReportNewOutage}
                    >
                      <AlertTriangle className="w-5 h-5 mb-2" />
                      <span className="text-xs">Report Outage</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex flex-col items-center justify-center border-gray-300 hover:border-[#4F46E5] hover:text-[#4F46E5]"
                      onClick={() => setShowAddLocationModal(true)}
                    >
                      <MapPin className="w-5 h-5 mb-2" />
                      <span className="text-xs">Add Location</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex flex-col items-center justify-center border-gray-300 hover:border-[#4F46E5] hover:text-[#4F46E5]"
                      onClick={() => setActiveTab("notifications")}
                    >
                      <Bell className="w-5 h-5 mb-2" />
                      <span className="text-xs">Manage Alerts</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex flex-col items-center justify-center border-gray-300 hover:border-[#4F46E5] hover:text-[#4F46E5]"
                      onClick={() => setActiveTab("account")}
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
                  <Button onClick={handleReportNewOutage} className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white">
                    Report New Outage
                  </Button>
                </div>

                {/* Filter Controls */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Type Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Type</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setReportFilters((prev) => ({ ...prev, type: "all" }))}
                          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                            reportFilters.type === "all"
                              ? "bg-[#4F46E5] text-white"
                              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          All
                        </button>
                        <button
                          onClick={() => setReportFilters((prev) => ({ ...prev, type: "electricity" }))}
                          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                            reportFilters.type === "electricity"
                              ? "bg-[#F59E0B] text-white"
                              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          Electricity
                        </button>
                        <button
                          onClick={() => setReportFilters((prev) => ({ ...prev, type: "water" }))}
                          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                            reportFilters.type === "water"
                              ? "bg-[#4F46E5] text-white"
                              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          Water
                        </button>
                      </div>
                    </div>

                    {/* Severity Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Severity</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setReportFilters((prev) => ({ ...prev, severity: "all" }))}
                          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                            reportFilters.severity === "all"
                              ? "bg-[#4F46E5] text-white"
                              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          All
                        </button>
                        <button
                          onClick={() => setReportFilters((prev) => ({ ...prev, severity: "low" }))}
                          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                            reportFilters.severity === "low"
                              ? "bg-green-600 text-white"
                              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          Low
                        </button>
                        <button
                          onClick={() => setReportFilters((prev) => ({ ...prev, severity: "medium" }))}
                          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                            reportFilters.severity === "medium"
                              ? "bg-yellow-600 text-white"
                              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          Medium
                        </button>
                        <button
                          onClick={() => setReportFilters((prev) => ({ ...prev, severity: "high" }))}
                          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                            reportFilters.severity === "high"
                              ? "bg-red-600 text-white"
                              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          High
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reports List */}
                <div className="space-y-4">
                  {(() => {
                    // Enhanced mock data with severity levels
                    const enhancedReports = recentReports.map((report) => ({
                      ...report,
                      severity: report.id === 1 ? "high" : "medium", // Add severity to existing reports
                    }))

                    // Add more sample reports for better filtering demonstration
                    const allReports = [
                      ...enhancedReports,
                      {
                        id: 3,
                        type: "water",
                        location: "Sector 12, Block C",
                        date: "2023-05-25",
                        status: "resolved",
                        description: "Complete water supply disruption",
                        source: "crowdsourced",
                        severity: "high",
                      },
                      {
                        id: 4,
                        type: "electricity",
                        location: "Phase 1, Main Gate",
                        date: "2023-05-20",
                        status: "pending",
                        description: "Flickering lights in common areas",
                        source: "official",
                        severity: "low",
                      },
                    ]

                    // Filter reports based on selected filters
                    const filteredReports = allReports.filter((report) => {
                      const typeMatch = reportFilters.type === "all" || report.type === reportFilters.type
                      const severityMatch =
                        reportFilters.severity === "all" || report.severity === reportFilters.severity
                      return typeMatch && severityMatch
                    })

                    if (filteredReports.length === 0) {
                      return (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-1">No Reports Found</h3>
                          <p className="text-gray-500 mb-6">No reports match the selected filters.</p>
                          <Button
                            onClick={() => setReportFilters({ type: "all", severity: "all" })}
                            variant="outline"
                            className="border-[#4F46E5] text-[#4F46E5] hover:bg-[#4F46E5] hover:text-white"
                          >
                            Clear Filters
                          </Button>
                        </div>
                      )
                    }

                    return filteredReports.map((report) => (
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
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium">{report.location}</h3>
                                <span className="text-xs px-2 py-1 rounded font-medium bg-blue-100 text-blue-700">
                                  User Report
                                </span>
                                <span
                                  className={`text-xs px-2 py-1 rounded font-medium ${
                                    report.severity === "high"
                                      ? "bg-red-100 text-red-700"
                                      : report.severity === "medium"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-green-100 text-green-700"
                                  }`}
                                >
                                  {report.severity.charAt(0).toUpperCase() + report.severity.slice(1)} Priority
                                </span>
                              </div>
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

                        {/* Expanded Details */}
                        {expandedReportId === report.id && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium text-sm text-gray-700 mb-2">Report Details</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Report ID:</span>
                                    <span className="font-medium">#{report.id.toString().padStart(6, "0")}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Type:</span>
                                    <span className="font-medium capitalize">{report.type}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Priority:</span>
                                    <span className="font-medium capitalize">{report.severity}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Affected Users:</span>
                                    <span className="font-medium">
                                      ~{report.severity === "high" ? "150" : report.severity === "medium" ? "75" : "25"}{" "}
                                      households
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium text-sm text-gray-700 mb-2">Timeline</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex items-start space-x-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                                    <div>
                                      <p className="font-medium">Report Submitted</p>
                                      <p className="text-gray-500 text-xs">{report.date} at 2:30 PM</p>
                                    </div>
                                  </div>
                                  <div className="flex items-start space-x-2">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5"></div>
                                    <div>
                                      <p className="font-medium">Under Maintenance</p>
                                      <p className="text-gray-500 text-xs">{report.date} at 3:15 PM</p>
                                    </div>
                                  </div>
                                  {report.status === "resolved" && (
                                    <div className="flex items-start space-x-2">
                                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                                      <div>
                                        <p className="font-medium">Issue Resolved</p>
                                        <p className="text-gray-500 text-xs">{report.date} at 5:45 PM</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="mt-4">
                              <h4 className="font-medium text-sm text-gray-700 mb-2">Additional Information</h4>
                              <p className="text-sm text-gray-600">
                                {report.type === "electricity"
                                  ? "The power outage was caused by a transformer failure in the main distribution line. Our technical team has replaced the faulty equipment and restored power to all affected areas."
                                  : "The water pressure issue was due to maintenance work on the main pipeline. The work has been completed and normal water pressure has been restored."}
                              </p>
                            </div>

                            {report.status === "pending" && (
                              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-center">
                                  <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                                  <p className="text-sm text-yellow-800">
                                    <span className="font-medium">Estimated Resolution:</span>{" "}
                                    {report.severity === "high"
                                      ? "1-2 hours"
                                      : report.severity === "medium"
                                        ? "2-4 hours"
                                        : "4-6 hours"}{" "}
                                    from now
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="mt-4 flex justify-end">
                          <Button
                            onClick={() => handleViewDetails(report.id)}
                            variant="outline"
                            size="sm"
                            className="text-sm border-[#4F46E5] text-[#4F46E5] hover:bg-[#4F46E5] hover:text-white"
                          >
                            {expandedReportId === report.id ? "Hide Details" : "View Details"}
                          </Button>
                        </div>
                      </div>
                    ))
                  })()}
                </div>
              </div>
            )}

            {/* Saved Locations Tab */}
            {activeTab === "locations" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-[#1F2937]">Saved Locations</h2>
                  {/* Success Message */}
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
                  <Button
                    onClick={() => setShowAddLocationModal(true)}
                    className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white"
                  >
                    Add New Location
                  </Button>
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
                                <button
                                  onClick={() => handleEditLocation(location.id)}
                                  className="p-1 hover:bg-gray-100 rounded"
                                >
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
                                <button
                                  onClick={() => handleDeleteLocation(location.id)}
                                  className="p-1 hover:bg-gray-100 rounded"
                                >
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
                              <Button
                                onClick={() => handleViewOutages(location.id)}
                                variant="outline"
                                size="sm"
                                className="text-xs"
                              >
                                View Outages
                              </Button>
                              <Button
                                onClick={() => handleSetAsDefault(location.id)}
                                variant="outline"
                                size="sm"
                                className="text-xs"
                              >
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
                    <Button
                      onClick={() => setShowAddLocationModal(true)}
                      className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white"
                    >
                      Add Location
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Notification Settings Tab */}
            {activeTab === "notifications" && (
              <div>
                <h2 className="text-xl font-semibold text-[#1F2937] mb-6">Notification Settings</h2>

                {/* Current settings overview */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-blue-900 mb-2">Current Settings</h3>
                  <div className="text-sm text-blue-800">
                    {Object.entries(notificationSettings).map(([key, value]) => (
                      <span key={key} className="inline-flex items-center mr-4 mb-1">
                        <span className={`w-2 h-2 rounded-full mr-2 ${value ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                        {key.charAt(0).toUpperCase() + key.slice(1)}: {value ? 'Enabled' : 'Disabled'}
                      </span>
                    ))}
                  </div>
                </div>

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
                      <div 
                        className="relative inline-block w-12 h-6 rounded-full bg-gray-200 cursor-pointer"
                        onClick={() => handleToggleNotification("browser")}
                      >
                        <input
                          type="checkbox"
                          className="opacity-0 w-0 h-0"
                          checked={notificationSettings.browser}
                          onChange={() => handleToggleNotification("browser")}
                        />
                        <span
                          className={`absolute top-0 left-0 right-0 bottom-0 rounded-full transition-colors duration-200 ${
                            notificationSettings.browser ? "bg-[#4F46E5]" : "bg-gray-300"
                          }`}
                        ></span>
                        <span
                          className={`absolute w-4 h-4 top-1 bg-white rounded-full transition-transform duration-200 ${
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
                      <div 
                        className="relative inline-block w-12 h-6 rounded-full bg-gray-200 cursor-pointer"
                        onClick={() => handleToggleNotification("whatsapp")}
                      >
                        <input
                          type="checkbox"
                          className="opacity-0 w-0 h-0"
                          checked={notificationSettings.whatsapp}
                          onChange={() => handleToggleNotification("whatsapp")}
                        />
                        <span
                          className={`absolute top-0 left-0 right-0 bottom-0 rounded-full transition-colors duration-200 ${
                            notificationSettings.whatsapp ? "bg-[#4F46E5]" : "bg-gray-300"
                          }`}
                        ></span>
                        <span
                          className={`absolute w-4 h-4 top-1 bg-white rounded-full transition-transform duration-200 ${
                            notificationSettings.whatsapp ? "transform translate-x-7" : "transform translate-x-1"
                          }`}
                        ></span>
                      </div>
                    </div>
                    {notificationSettings.whatsapp && (
                      <div className="mt-3 pl-12">
                        <p className="text-sm text-gray-600">Connected number: +91 98765 43210</p>
                        <Button
                          variant="link"
                          size="sm"
                          className="text-[#4F46E5] p-0 h-auto text-sm"
                          onClick={handleChangeWhatsAppNumber}
                        >
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
                      <div 
                        className="relative inline-block w-12 h-6 rounded-full bg-gray-200 cursor-pointer"
                        onClick={() => handleToggleNotification("email")}
                      >
                        <input
                          type="checkbox"
                          className="opacity-0 w-0 h-0"
                          checked={notificationSettings.email}
                          onChange={() => handleToggleNotification("email")}
                        />
                        <span
                          className={`absolute top-0 left-0 right-0 bottom-0 rounded-full transition-colors duration-200 ${
                            notificationSettings.email ? "bg-[#4F46E5]" : "bg-gray-300"
                          }`}
                        ></span>
                        <span
                          className={`absolute w-4 h-4 top-1 bg-white rounded-full transition-transform duration-200 ${
                            notificationSettings.email ? "transform translate-x-7" : "transform translate-x-1"
                          }`}
                        ></span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Button
                    onClick={handleSaveNotificationSettings}
                    disabled={isSubmitting}
                    className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white"
                  >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
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
                    {/* Update the Profile Information section to display the success message */}
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
            )}
          </div>
        </div>
      </div>
      {/* Add Location Modal */}
      {showAddLocationModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#1F2937]">
                  {editingLocationId ? "Edit Location" : "Add New Location"}
                </h2>
                <button
                  onClick={() => {
                    setShowAddLocationModal(false)
                    setEditingLocationId(null)
                    setNewLocation({ name: "", address: "" })
                    setLocationSuccessMessage("")
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleAddLocation} className="space-y-4">
                <div>
                  <label htmlFor="location-name" className="block text-sm font-medium text-[#1F2937] mb-2">
                    Location Name
                  </label>
                  <Input
                    id="location-name"
                    value={newLocation.name}
                    onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                    placeholder="e.g. Home, Office, etc."
                    className="h-10 border-gray-300 focus:border-[#4F46E5] focus:ring-0"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="location-address" className="block text-sm font-medium text-[#1F2937] mb-2">
                    Address
                  </label>
                  <SearchBox
                    accessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
                    options={{ language: "en", limit: 5 }}
                    value={newLocation.address}
                    onRetrieve={(res) => {
                      setNewLocation((prev) => ({
                        ...prev,
                        address: res.features?.[0]?.place_name || "",
                      }));
                    }}
                    onChange={(e) =>
                      setNewLocation((prev) => ({ ...prev, address: e.target.value }))
                    }
                    inputProps={{
                      className: "pl-3 h-12 border-2 border-gray-300 w-full",
                      placeholder: "Enter address (autocomplete enabled)", 
                      required: true
                    }}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddLocationModal(false)
                      setEditingLocationId(null)
                      setNewLocation({ name: "", address: "" })
                      setLocationSuccessMessage("")
                    }}
                    className="border-gray-300"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white">
                    {editingLocationId ? "Update Location" : "Add Location"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Change WhatsApp Number Modal */}
      {showChangeNumberModal && !showWhatsAppOtp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#1F2937]">Change WhatsApp Number</h2>
                <button
                  onClick={() => setShowChangeNumberModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  disabled={isVerifyingWhatsApp}
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-800">
                      Enter your new WhatsApp number. We'll send a verification code to confirm it's yours.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmitNewNumber} className="space-y-4">
                <div>
                  <label htmlFor="new-whatsapp-number" className="block text-sm font-medium text-[#1F2937] mb-2">
                    New WhatsApp Number
                  </label>
                  <Input
                    id="new-whatsapp-number"
                    type="tel"
                    placeholder="e.g. +91 9876543210"
                    value={newWhatsAppNumber}
                    onChange={(e) => {
                      setNewWhatsAppNumber(e.target.value)
                      if (changeNumberErrors.phone) {
                        setChangeNumberErrors((prev) => ({ ...prev, phone: null }))
                      }
                    }}
                    disabled={isVerifyingWhatsApp}
                    className={`h-12 border-2 ${
                      changeNumberErrors.phone ? "border-red-500" : "border-gray-300"
                    } focus:border-[#4F46E5] focus:ring-0 outline-none`}
                  />
                  {changeNumberErrors.phone && <p className="text-red-500 text-sm mt-1">{changeNumberErrors.phone}</p>}
                  {changeNumberErrors.whatsapp && (
                    <p className="text-red-500 text-sm mt-1">{changeNumberErrors.whatsapp}</p>
                  )}

                  {/* Add success message display */}
                  {otpSuccessMessage && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 text-green-600 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <p className="text-sm text-green-800 font-medium">{otpSuccessMessage}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowChangeNumberModal(false)}
                    className="border-gray-300"
                    disabled={isVerifyingWhatsApp}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isVerifyingWhatsApp}
                    className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white"
                  >
                    {isVerifyingWhatsApp ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Sending OTP...
                      </div>
                    ) : (
                      "Send Verification Code"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp OTP Verification Modal */}
      {showWhatsAppOtp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#1F2937]">Verify WhatsApp Number</h2>
                <button
                  onClick={() => {
                    setShowWhatsAppOtp(false)
                    setShowChangeNumberModal(true)
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  disabled={isVerifyingWhatsApp}
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-green-800">
                      We've sent a 6-digit verification code to{" "}
                      <span className="font-semibold">{newWhatsAppNumber}</span> via WhatsApp.
                    </p>
                    <p className="text-xs text-green-600 mt-1">Please check your WhatsApp and enter the code below.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="whatsapp-otp" className="block text-sm font-medium text-[#1F2937] mb-2">
                    Verification Code
                  </label>
                  <Input
                    id="whatsapp-otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={whatsappOtp}
                    onChange={(e) => {
                      setWhatsappOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                      if (changeNumberErrors.whatsappOtp) {
                        setChangeNumberErrors((prev) => ({ ...prev, whatsappOtp: null }))
                      }
                    }}
                    disabled={isVerifyingWhatsApp}
                    className={`h-12 text-center text-lg tracking-widest border-2 ${
                      changeNumberErrors.whatsappOtp ? "border-red-500" : "border-gray-300"
                    } focus:border-[#4F46E5] focus:ring-0 outline-none`}
                    maxLength={6}
                  />
                  {changeNumberErrors.whatsappOtp && (
                    <p className="text-red-500 text-sm mt-1">{changeNumberErrors.whatsappOtp}</p>
                  )}
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
                  <button
                    type="button"
                    onClick={resendWhatsAppOtp}
                    disabled={isVerifyingWhatsApp || resendTimer > 0}
                    className="text-sm text-[#4F46E5] font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
                  </button>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowWhatsAppOtp(false)
                      setShowChangeNumberModal(true)
                    }}
                    className="border-gray-300"
                    disabled={isVerifyingWhatsApp}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={verifyWhatsAppOtp}
                    disabled={isVerifyingWhatsApp || whatsappOtp.length !== 6}
                    className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white"
                  >
                    {isVerifyingWhatsApp ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Verifying...
                      </div>
                    ) : (
                      "Verify & Update"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Report Modal */}
      {/* Delete Confirmation Modal */}
      {showDeleteModal && locationToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#1F2937]">Delete Location</h2>
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setLocationToDelete(null)
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    />
                  </svg>
                  <div>
                    <h3 className="font-medium text-red-800 mb-1">Are you sure?</h3>
                    <p className="text-sm text-red-700">
                      You are about to delete the location "{locationToDelete.name}". This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{locationToDelete.name}</h4>
                    <p className="text-sm text-gray-600">{locationToDelete.address}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false)
                    setLocationToDelete(null)
                  }}
                  className="border-gray-300"
                >
                  Cancel
                </Button>
                <Button onClick={confirmDeleteLocation} className="bg-red-600 hover:bg-red-700 text-white">
                  Delete Location
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
