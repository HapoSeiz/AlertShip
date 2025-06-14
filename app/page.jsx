"use client"

import { useState, useEffect } from "react"
import { MapPin, List, Map, Calendar, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Nunito, Namdhinggo } from "next/font/google"
import LatestUpdates from "@/components/latest-updates"
import HowItWorks from "@/components/how-it-works"
import Benefits from "@/components/benefits"
import Footer from "@/components/footer"
import { AuthModals } from "@/components/auth-modals"
import { NotificationModal } from "@/components/notification-modal"
import UserDashboard from "@/components/user-dashboard"

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
})

const namdhinggo = Namdhinggo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
})

export default function LandingPage() {
  const [isSignUpOpen, setIsSignUpOpen] = useState(false)
  const [isLogInOpen, setIsLogInOpen] = useState(false)
  const [location, setLocation] = useState("")
  const [showOutagePage, setShowOutagePage] = useState(false)
  const [showReportForm, setShowReportForm] = useState(false)
  const [viewMode, setViewMode] = useState("list") // "list" or "map"
  const [showUpcomingOutages, setShowUpcomingOutages] = useState(false)
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [showDashboard, setShowDashboard] = useState(false)

  // Form state
  const [reportForm, setReportForm] = useState({
    type: "electricity",
    description: "",
    address: "",
    severity: "medium",
    photo: null,
  })
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Check if user is logged in on component mount
  useEffect(() => {
    // This would normally be a check to your auth system
    const savedUser = localStorage.getItem("alertship_user")
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        setUser(parsedUser)
        setIsLoggedIn(true)
      } catch (error) {
        console.error("Error parsing user data:", error)
      }
    }
  }, [])

  const openSignUp = () => {
    setIsSignUpOpen(true)
    setIsLogInOpen(false)
  }

  const openLogIn = () => {
    setIsLogInOpen(true)
    setIsSignUpOpen(false)
  }

  const closeSignUp = () => setIsSignUpOpen(false)
  const closeLogIn = () => setIsLogInOpen(false)

  const switchToLogIn = () => {
    setIsSignUpOpen(false)
    setIsLogInOpen(true)
  }

  const switchToSignUp = () => {
    setIsLogInOpen(false)
    setIsSignUpOpen(true)
  }

  const handleLocationSubmit = () => {
    if (location.trim()) {
      setShowOutagePage(true)
      setShowDashboard(false)
    }
  }

  const handleBackToHome = () => {
    setShowOutagePage(false)
    setShowReportForm(false)
    setShowUpcomingOutages(false)
    setShowDashboard(false)
    setLocation("")
    setSubmitSuccess(false)
  }

  const handleBackToOutages = () => {
    setShowReportForm(false)
    setShowUpcomingOutages(false)
    setSubmitSuccess(false)
  }

  const handleReportIssue = () => {
    if (!isLoggedIn) {
      openLogIn()
      return
    }
    setShowReportForm(true)
    setShowUpcomingOutages(false)
  }

  const handleViewUpcomingOutages = () => {
    setShowUpcomingOutages(true)
    setShowReportForm(false)
  }

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

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setReportForm((prev) => ({
        ...prev,
        photo: e.target.files[0],
      }))
    }
  }

  const validateForm = () => {
    const errors = {}

    if (!reportForm.description.trim()) {
      errors.description = "Description is required"
    }

    if (!reportForm.address.trim()) {
      errors.address = "Address is required"
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

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      console.log("Report submitted:", reportForm)
      setSubmitSuccess(true)

      // Reset form
      setReportForm({
        type: "electricity",
        description: "",
        address: "",
        severity: "medium",
        photo: null,
      })
    } catch (error) {
      console.error("Error submitting report:", error)
      alert("Failed to submit report. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubscribeToAlerts = () => {
    setIsNotificationModalOpen(true)
  }

  const handleLogin = (userData) => {
    setUser(userData)
    setIsLoggedIn(true)
    localStorage.setItem("alertship_user", JSON.stringify(userData))
    closeLogIn()
    closeSignUp()
    setShowDashboard(true)
  }

  const handleLogout = () => {
    setUser(null)
    setIsLoggedIn(false)
    localStorage.removeItem("alertship_user")
    setShowDashboard(false)
  }

  // User Dashboard
  if (showDashboard) {
    return (
      <div className={`min-h-screen bg-[#F9FAFB] ${nunito.className}`}>
        {/* Header */}
        <header className="px-4 sm:px-6 lg:px-8 py-4 bg-white shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <img src="/images/alertship-logo.png" alt="AlertShip" className="h-8" />
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
              <a href="#" className="text-sm lg:text-base text-[#1F2937] hover:text-[#4F46E5] transition-colors">
                About
              </a>
              <a href="#" className="text-sm lg:text-base text-[#1F2937] hover:text-[#4F46E5] transition-colors">
                Report Outage
              </a>
              <a href="#" className="text-sm lg:text-base text-[#1F2937] hover:text-[#4F46E5] transition-colors">
                View Map
              </a>
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-2">
              <Button onClick={handleBackToHome} variant="ghost" className="text-[#1F2937] hover:bg-gray-100">
                Home
              </Button>
            </div>
          </div>
        </header>

        <UserDashboard user={user} onLogout={handleLogout} />
      </div>
    )
  }

  // Outage Page Content
  if (showOutagePage) {
    // Report Form Page
    if (showReportForm) {
      return (
        <div className={`min-h-screen bg-[#F9FAFB] ${nunito.className}`}>
          {/* Header */}
          <header className="px-4 sm:px-6 lg:px-8 py-4 bg-white shadow-sm">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center space-x-2">
                <img src="/images/alertship-logo.png" alt="AlertShip" className="h-8" />
              </div>

              {/* Navigation */}
              <div className="flex items-center space-x-4">
                <Button onClick={handleBackToOutages} variant="ghost" className="text-[#1F2937] hover:bg-gray-100">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Outages
                </Button>
                <Button
                  onClick={handleBackToHome}
                  variant="outline"
                  className="border-[#1F2937] text-[#1F2937] hover:bg-[#1F2937] hover:text-white"
                >
                  Back to Home
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-3xl mx-auto">
              {submitSuccess ? (
                <div className="bg-white rounded-2xl p-8 shadow-sm border text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-[#1F2937] mb-4">Report Submitted Successfully!</h2>
                  <p className="text-gray-600 mb-6">
                    Thank you for reporting the issue. Our team will review it and take appropriate action. You will
                    receive updates on the status of your report.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button onClick={handleBackToOutages} className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white">
                      View Outages
                    </Button>
                    <Button
                      onClick={() => setSubmitSuccess(false)}
                      variant="outline"
                      className="border-[#1F2937] text-[#1F2937] hover:bg-[#1F2937] hover:text-white"
                    >
                      Report Another Issue
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border">
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2937] mb-6">Report an Outage</h1>

                  <form onSubmit={handleSubmitReport} className="space-y-6">
                    {/* Outage Type */}
                    <div>
                      <label className="block text-sm font-medium text-[#1F2937] mb-2">Outage Type</label>
                      <div className="grid grid-cols-2 gap-4">
                        <div
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                            reportForm.type === "electricity"
                              ? "border-[#F59E0B] bg-[#F59E0B]/10"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setReportForm((prev) => ({ ...prev, type: "electricity" }))}
                        >
                          <div className="flex items-center">
                            <div
                              className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                                reportForm.type === "electricity" ? "border-[#F59E0B]" : "border-gray-400"
                              }`}
                            >
                              {reportForm.type === "electricity" && (
                                <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">Electricity</p>
                              <p className="text-xs text-gray-500">Power outage or issues</p>
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
                            <div>
                              <p className="font-medium">Water</p>
                              <p className="text-xs text-gray-500">Water supply issues</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-[#1F2937] mb-2">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Please describe the issue in detail"
                        value={reportForm.description}
                        onChange={handleFormChange}
                        className={`min-h-[120px] border-2 ${
                          formErrors.description ? "border-red-500" : "border-gray-300"
                        } focus:border-[#4F46E5] focus:ring-0 outline-none`}
                      />
                      {formErrors.description && <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>}
                    </div>

                    {/* Address */}
                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-[#1F2937] mb-2">
                        Specific Address/Location <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="address"
                          name="address"
                          placeholder="Enter specific location of the issue"
                          value={reportForm.address}
                          onChange={handleFormChange}
                          className={`pl-10 h-12 border-2 ${
                            formErrors.address ? "border-red-500" : "border-gray-300"
                          } focus:border-[#4F46E5] focus:ring-0 outline-none`}
                        />
                      </div>
                      {formErrors.address && <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>}
                    </div>

                    {/* Severity */}
                    <div>
                      <label className="block text-sm font-medium text-[#1F2937] mb-2">Severity Level</label>
                      <div className="grid grid-cols-3 gap-3">
                        <div
                          className={`border-2 rounded-lg p-3 cursor-pointer text-center transition-colors ${
                            reportForm.severity === "low"
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setReportForm((prev) => ({ ...prev, severity: "low" }))}
                        >
                          <p className="font-medium">Low</p>
                          <p className="text-xs text-gray-500">Minor issue</p>
                        </div>

                        <div
                          className={`border-2 rounded-lg p-3 cursor-pointer text-center transition-colors ${
                            reportForm.severity === "medium"
                              ? "border-yellow-500 bg-yellow-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setReportForm((prev) => ({ ...prev, severity: "medium" }))}
                        >
                          <p className="font-medium">Medium</p>
                          <p className="text-xs text-gray-500">Moderate issue</p>
                        </div>

                        <div
                          className={`border-2 rounded-lg p-3 cursor-pointer text-center transition-colors ${
                            reportForm.severity === "high"
                              ? "border-red-500 bg-red-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setReportForm((prev) => ({ ...prev, severity: "high" }))}
                        >
                          <p className="font-medium">High</p>
                          <p className="text-xs text-gray-500">Critical issue</p>
                        </div>
                      </div>
                    </div>

                    {/* Photo Upload */}
                    <div>
                      <label className="block text-sm font-medium text-[#1F2937] mb-2">Upload Photo (Optional)</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <input
                          type="file"
                          id="photo"
                          name="photo"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                        <label htmlFor="photo" className="cursor-pointer">
                          <div className="flex flex-col items-center">
                            {reportForm.photo ? (
                              <div className="mb-3">
                                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
                                  <svg
                                    className="w-6 h-6 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                </div>
                                <p className="mt-2 text-sm text-gray-600">{reportForm.photo.name}</p>
                                <button
                                  type="button"
                                  onClick={() => setReportForm((prev) => ({ ...prev, photo: null }))}
                                  className="text-xs text-red-600 hover:text-red-800 mt-1"
                                >
                                  Remove
                                </button>
                              </div>
                            ) : (
                              <>
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
                              </>
                            )}
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Auto-filled User Information */}
                    <div className="border-t border-gray-200 pt-6 mt-6">
                      <h3 className="text-lg font-medium text-[#1F2937] mb-4">Reporter Information</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <p className="text-sm text-gray-900">{user?.name || "John Doe"}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <p className="text-sm text-gray-900">{user?.email || "john.doe@example.com"}</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          This information will be used to contact you about your report.
                        </p>
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
                </div>
              )}
            </div>
          </main>
        </div>
      )
    }

    // Upcoming Outages Page
    if (showUpcomingOutages) {
      return (
        <div className={`min-h-screen bg-[#F9FAFB] ${nunito.className}`}>
          {/* Header */}
          <header className="px-4 sm:px-6 lg:px-8 py-4 bg-white shadow-sm">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center space-x-2">
                <img src="/images/alertship-logo.png" alt="AlertShip" className="h-8" />
              </div>

              {/* Navigation */}
              <div className="flex items-center space-x-4">
                <Button onClick={handleBackToOutages} variant="ghost" className="text-[#1F2937] hover:bg-gray-100">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Outages
                </Button>
                <Button
                  onClick={handleBackToHome}
                  variant="outline"
                  className="border-[#1F2937] text-[#1F2937] hover:bg-[#1F2937] hover:text-white"
                >
                  Back to Home
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1F2937] mb-2">
                  Upcoming Scheduled Outages
                </h1>
                <p className="text-gray-600">Planned maintenance and scheduled outages in {location}</p>
              </div>

              {/* Calendar View */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-[#1F2937]">
                    <Calendar className="inline-block w-5 h-5 mr-2 text-[#4F46E5]" />
                    This Month's Schedule
                  </h2>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="text-sm">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous
                    </Button>
                    <Button variant="outline" size="sm" className="text-sm">
                      Next
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Button>
                  </div>
                </div>

                {/* Calendar Grid - Simplified Version */}
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
                  {/* Empty cells for previous month */}
                  <div className="h-24 p-1 border rounded-lg bg-gray-50 text-gray-400">30</div>
                  <div className="h-24 p-1 border rounded-lg bg-gray-50 text-gray-400">31</div>

                  {/* Current month */}
                  <div className="h-24 p-1 border rounded-lg">1</div>
                  <div className="h-24 p-1 border rounded-lg">2</div>
                  <div className="h-24 p-1 border rounded-lg">3</div>
                  <div className="h-24 p-1 border rounded-lg">4</div>
                  <div className="h-24 p-1 border rounded-lg">5</div>
                  <div className="h-24 p-1 border rounded-lg">6</div>
                  <div className="h-24 p-1 border rounded-lg">7</div>
                  <div className="h-24 p-1 border rounded-lg">8</div>
                  <div className="h-24 p-1 border rounded-lg">9</div>
                  <div className="h-24 p-1 border rounded-lg">10</div>
                  <div className="h-24 p-1 border rounded-lg">11</div>
                  <div className="h-24 p-1 border rounded-lg">12</div>
                  <div className="h-24 p-1 border rounded-lg">13</div>
                  <div className="h-24 p-1 border rounded-lg">14</div>
                  <div className="h-24 p-1 border rounded-lg">
                    15
                    <div className="mt-1 p-1 text-xs bg-[#F59E0B]/20 text-[#F59E0B] rounded">Electricity</div>
                  </div>
                  <div className="h-24 p-1 border rounded-lg">16</div>
                  <div className="h-24 p-1 border rounded-lg">17</div>
                  <div className="h-24 p-1 border rounded-lg">18</div>
                  <div className="h-24 p-1 border rounded-lg">19</div>
                  <div className="h-24 p-1 border rounded-lg">20</div>
                  <div className="h-24 p-1 border rounded-lg">
                    21
                    <div className="mt-1 p-1 text-xs bg-[#4F46E5]/20 text-[#4F46E5] rounded">Water</div>
                  </div>
                  <div className="h-24 p-1 border rounded-lg">22</div>
                  <div className="h-24 p-1 border rounded-lg">23</div>
                  <div className="h-24 p-1 border rounded-lg">24</div>
                  <div className="h-24 p-1 border rounded-lg">25</div>
                  <div className="h-24 p-1 border rounded-lg">26</div>
                  <div className="h-24 p-1 border rounded-lg">27</div>
                  <div className="h-24 p-1 border rounded-lg">28</div>
                  <div className="h-24 p-1 border rounded-lg">29</div>
                  <div className="h-24 p-1 border rounded-lg">30</div>
                  <div className="h-24 p-1 border rounded-lg">31</div>

                  {/* Next month */}
                  <div className="h-24 p-1 border rounded-lg bg-gray-50 text-gray-400">1</div>
                  <div className="h-24 p-1 border rounded-lg bg-gray-50 text-gray-400">2</div>
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
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">Block A, B, C</span>
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
                      onClick={handleSubscribeToAlerts}
                      className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white whitespace-nowrap"
                    >
                      Subscribe to Alerts
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      )
    }

    // Main Outage Page
    return (
      <div className={`min-h-screen bg-[#F9FAFB] ${nunito.className}`}>
        {/* Header */}
        <header className="px-4 sm:px-6 lg:px-8 py-4 bg-white shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <img src="/images/alertship-logo.png" alt="AlertShip" className="h-8" />
            </div>

            {/* Back Button */}
            <Button
              onClick={handleBackToHome}
              variant="outline"
              className="border-[#1F2937] text-[#1F2937] hover:bg-[#1F2937] hover:text-white"
            >
              ← Back to Home
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Location Header */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1F2937] mb-2">
                  Outages in {location}
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

                <Button onClick={handleReportIssue} className="bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-white">
                  {!isLoggedIn && "Login to "}Report New Issue
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
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-medium text-red-600">Outage Reported</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Affected Areas:</span>
                    <span className="font-medium">3 localities</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Estimated Fix:</span>
                    <span className="font-medium">2-4 hours</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="font-medium">5 minutes ago</span>
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
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#1F2937]">Water Supply</h3>
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
                    <span className="text-gray-600">Pressure Level:</span>
                    <span className="font-medium">Normal</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Quality Status:</span>
                    <span className="font-medium">Good</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="font-medium">2 minutes ago</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Map or List View */}
            {viewMode === "map" ? (
              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <h2 className="text-xl font-semibold text-[#1F2937] mb-6">Outage Map</h2>
                <div className="bg-gray-100 rounded-lg h-[400px] flex items-center justify-center">
                  <div className="text-center">
                    <Map className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">Interactive map showing outage locations in {location}</p>
                    <p className="text-sm text-gray-500 mt-2">Zoom in to see detailed information</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    <span className="text-sm">Electricity Outage</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                    <span className="text-sm">Partial Outage</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-sm">Water Issue</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm">Resolved</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <h2 className="text-xl font-semibold text-[#1F2937] mb-6">Recent Reports</h2>
                <div className="space-y-4">
                  {/* Report Item */}
                  <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-[#1F2937]">Power Outage - Sector 15</h3>
                        <span className="text-sm text-gray-500">15 min ago</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Complete power failure reported in residential area. Maintenance team dispatched.
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">High Priority</span>
                        <span className="text-xs text-gray-500">Reported by 12 users</span>
                      </div>
                    </div>
                  </div>

                  {/* Report Item */}
                  <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-[#1F2937]">Voltage Fluctuation - Block A</h3>
                        <span className="text-sm text-gray-500">1 hour ago</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Intermittent voltage issues causing appliance problems. Under investigation.
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Medium Priority</span>
                        <span className="text-xs text-gray-500">Reported by 5 users</span>
                      </div>
                    </div>
                  </div>

                  {/* Report Item */}
                  <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-[#1F2937]">Low Water Pressure - Phase 2</h3>
                        <span className="text-sm text-gray-500">3 hours ago</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Reduced water pressure in morning hours. Pump maintenance scheduled.
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Low Priority</span>
                        <span className="text-xs text-gray-500">Reported by 3 users</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    )
  }

  // Landing Page
  return (
    <div className={`min-h-screen bg-[#F9FAFB] ${nunito.className}`}>
      {/* Header */}
      <header className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <img src="/images/alertship-logo.png" alt="AlertShip" className="h-8" />
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <a href="#" className="text-sm lg:text-base text-[#1F2937] hover:text-[#4F46E5] transition-colors">
              About
            </a>
            <a href="#" className="text-sm lg:text-base text-[#1F2937] hover:text-[#4F46E5] transition-colors">
              Report Outage
            </a>
            <a href="#" className="text-sm lg:text-base text-[#1F2937] hover:text-[#4F46E5] transition-colors">
              View Map
            </a>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {isLoggedIn ? (
              <>
                <Button
                  onClick={() => setShowDashboard(true)}
                  variant="ghost"
                  className="text-[#1F2937] hover:bg-gray-100"
                >
                  Dashboard
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="border-[#1F2937] text-[#1F2937] hover:bg-[#1F2937] hover:text-white text-sm px-3 py-2 sm:px-4 sm:py-2"
                >
                  Log Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={openSignUp}
                  className="border-[#1F2937] text-[#1F2937] hover:bg-[#1F2937] hover:text-white text-sm px-3 py-2 sm:px-4 sm:py-2"
                >
                  Sign Up
                </Button>
                <Button
                  onClick={openLogIn}
                  className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white text-sm px-3 py-2 sm:px-4 sm:py-2"
                >
                  Log In
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-20 pb-8 sm:pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Column - Content */}
            <div className="order-2 lg:order-1">
              {/* Main Heading */}
              <h1
                className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 sm:mb-6 ${namdhinggo.className}`}
              >
                <span className="text-[#4F46E5]">Report</span> <span className="text-[#1F2937]">and</span>{" "}
                <span className="text-[#1F2937] underline decoration-[#F59E0B] decoration-2 sm:decoration-4 underline-offset-4 sm:underline-offset-8">
                  Track
                </span>
                <br />
                <span className="text-[#1F2937]">Local Outages</span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg sm:text-xl lg:text-2xl text-[#1F2937] mb-8 sm:mb-12 max-w-3xl">
                Check and report electricity and water disruptions in your area.
              </p>

              {/* Location Input */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-2xl">
                <div className="flex-1">
                  <Input
                    placeholder="Enter your location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleLocationSubmit()}
                    className="h-12 sm:h-14 px-4 sm:px-6 text-base sm:text-lg border-2 border-[#F59E0B] focus:border-[#F59E0B] focus:ring-0 outline-none bg-white"
                  />
                </div>
                <Button
                  onClick={handleLocationSubmit}
                  className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-white font-semibold"
                >
                  Enter
                </Button>
              </div>
            </div>

            {/* Right Column - Illustration */}
            <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
              <div className="w-3/4 sm:w-2/3 md:w-full max-w-md lg:max-w-lg xl:max-w-xl">
                <img
                  src="/images/hero-illustration.png"
                  alt="Map interface showing location tracking for electricity and water outages"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Latest Updates Section */}
      <LatestUpdates />

      {/* How It Works Section */}
      <HowItWorks />

      {/* Benefits Section */}
      <Benefits />

      {/* Footer Section */}
      <Footer />

      {/* Auth Modals */}
      <AuthModals
        isSignUpOpen={isSignUpOpen}
        isLogInOpen={isLogInOpen}
        onCloseSignUp={closeSignUp}
        onCloseLogIn={closeLogIn}
        onSwitchToLogIn={switchToLogIn}
        onSwitchToSignUp={switchToSignUp}
        onLogin={handleLogin}
      />

      {/* Notification Modal */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        isLoggedIn={isLoggedIn}
        onOpenLogin={openLogIn}
      />
    </div>
  )
}
