"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Bell, MessageSquare, Shield, Mail, Lock } from "lucide-react"

export function NotificationModal({ isOpen, onClose, isLoggedIn, onOpenLogin }) {
  const [notificationPreferences, setNotificationPreferences] = useState({
    browser: true,
    whatsapp: false,
  })
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [errors, setErrors] = useState({})
  const [showLoginForm, setShowLoginForm] = useState(false)

  // WhatsApp OTP verification states
  const [showWhatsAppOtp, setShowWhatsAppOtp] = useState(false)
  const [whatsappOtp, setWhatsappOtp] = useState("")
  const [generatedWhatsappOtp, setGeneratedWhatsappOtp] = useState("")
  const [isVerifyingWhatsApp, setIsVerifyingWhatsApp] = useState(false)
  const [whatsappVerified, setWhatsappVerified] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)

  if (!isOpen) return null

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
  const sendWhatsAppOtp = async () => {
    const newOtp = generateOtp()
    setGeneratedWhatsappOtp(newOtp)
    setIsVerifyingWhatsApp(true)

    try {
      // Simulate sending WhatsApp OTP
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // In real implementation, you would send WhatsApp OTP here
      console.log(`WhatsApp OTP sent to ${phoneNumber}: ${newOtp}`)
      alert(`WhatsApp OTP sent! (For demo: ${newOtp})`)

      setShowWhatsAppOtp(true)
      startResendTimer()
    } catch (error) {
      console.error("Error sending WhatsApp OTP:", error)
      setErrors({ whatsapp: "Failed to send OTP. Please try again." })
    } finally {
      setIsVerifyingWhatsApp(false)
    }
  }

  // Verify WhatsApp OTP
  const verifyWhatsAppOtp = async () => {
    if (!whatsappOtp.trim()) {
      setErrors({ whatsappOtp: "OTP is required" })
      return
    }
    if (whatsappOtp.length !== 6) {
      setErrors({ whatsappOtp: "OTP must be 6 digits" })
      return
    }
    if (whatsappOtp !== generatedWhatsappOtp) {
      setErrors({ whatsappOtp: "Invalid OTP. Please try again." })
      return
    }

    setIsVerifyingWhatsApp(true)
    try {
      // Simulate verification
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setWhatsappVerified(true)
      setShowWhatsAppOtp(false)
      setErrors({})
      alert("WhatsApp number verified successfully!")
    } catch (error) {
      setErrors({ whatsappOtp: "Verification failed. Please try again." })
    } finally {
      setIsVerifyingWhatsApp(false)
    }
  }

  // Resend WhatsApp OTP
  const resendWhatsAppOtp = async () => {
    if (resendTimer > 0) return
    await sendWhatsAppOtp()
  }

  const handlePreferenceChange = (type) => {
    if (type === "whatsapp" && !notificationPreferences.whatsapp) {
      // If enabling WhatsApp, check if phone number is provided
      if (!phoneNumber.trim()) {
        setErrors({ phone: "Phone number is required for WhatsApp notifications" })
        return
      }
      if (!/^\+?[0-9]{10,15}$/.test(phoneNumber.replace(/\s/g, ""))) {
        setErrors({ phone: "Please enter a valid phone number" })
        return
      }

      // Send OTP for verification
      sendWhatsAppOtp()
    }

    setNotificationPreferences((prev) => ({
      ...prev,
      [type]: !prev[type],
    }))

    // Clear error when selecting an option
    if (errors.preferences) {
      setErrors((prev) => ({ ...prev, preferences: null }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Check if at least one notification method is selected
    if (!notificationPreferences.browser && !notificationPreferences.whatsapp) {
      newErrors.preferences = "Please select at least one notification method"
    }

    // Validate phone number if WhatsApp is selected
    if (notificationPreferences.whatsapp) {
      if (!phoneNumber.trim()) {
        newErrors.phone = "Phone number is required for WhatsApp notifications"
      } else if (!/^\+?[0-9]{10,15}$/.test(phoneNumber.replace(/\s/g, ""))) {
        newErrors.phone = "Please enter a valid phone number"
      } else if (!whatsappVerified) {
        newErrors.phone = "Please verify your WhatsApp number"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))
      console.log("Notification preferences saved:", {
        browser: notificationPreferences.browser,
        whatsapp: notificationPreferences.whatsapp,
        phoneNumber: notificationPreferences.whatsapp ? phoneNumber : null,
        whatsappVerified: whatsappVerified,
      })
      setSubmitSuccess(true)
    } catch (error) {
      console.error("Error saving notification preferences:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    onClose()
    // Reset states
    setNotificationPreferences({ browser: true, whatsapp: false })
    setPhoneNumber("")
    setErrors({})
    setSubmitSuccess(false)
    setShowWhatsAppOtp(false)
    setWhatsappOtp("")
    setWhatsappVerified(false)
    setResendTimer(0)
    setShowLoginForm(false)
  }

  const handleBackToNotification = () => {
    setShowLoginForm(false)
  }

  // If user is not logged in, show login prompt
  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#1F2937]">Subscribe to Alerts</h2>
              <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800">You need to be logged in to subscribe to alerts.</p>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleClose} className="border-gray-300">
                Cancel
              </Button>
              <Button onClick={() => setShowLoginForm(true)} className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white">
                Log In
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // If showing login form within the notification modal
  if (showLoginForm) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#1F2937]">Log In</h2>
              <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form className="space-y-4">
              {/* Email Field */}
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-[#1F2937] mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10 h-12 border-2 border-gray-300 focus:border-[#4F46E5] focus:ring-0 outline-none"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-[#1F2937] mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Enter your password"
                    className="pl-10 pr-10 h-12 border-2 border-gray-300 focus:border-[#4F46E5] focus:ring-0 outline-none"
                  />
                </div>
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <button type="button" className="text-sm text-[#4F46E5] hover:underline">
                  Forgot Password?
                </button>
              </div>

              {/* Submit Button */}
              <Button
                type="button"
                onClick={() => {
                  handleClose()
                  onOpenLogin() // Still use the parent's login handler for actual login
                }}
                className="w-full h-12 bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white font-semibold text-lg mt-6"
              >
                Log In
              </Button>
            </form>

            {/* Back Button */}
            <div className="text-center mt-6">
              <button onClick={handleBackToNotification} className="text-sm text-gray-600 hover:text-gray-800">
                ← Back to Notification Options
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Remove OTP modal logic, as it is now in otp-modal.jsx

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {submitSuccess ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#1F2937] mb-4">Subscription Successful!</h2>
            <p className="text-gray-600 mb-6">
              You will now receive alerts about outages in your area based on your preferences.
            </p>
            <Button onClick={handleClose} className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#1F2937]">Subscribe to Alerts</h2>
                <button
                  type="button"
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <p className="text-gray-600 mb-6">
                Choose how you'd like to receive notifications about outages in your area.
              </p>

              <div className="space-y-4 mb-6">
                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    notificationPreferences.browser
                      ? "border-[#4F46E5] bg-[#4F46E5]/10"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handlePreferenceChange("browser")}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                        notificationPreferences.browser ? "border-[#4F46E5]" : "border-gray-400"
                      }`}
                    >
                      {notificationPreferences.browser && <div className="w-3 h-3 rounded-full bg-[#4F46E5]" />}
                    </div>
                    <div className="flex items-center">
                      <Bell className="w-5 h-5 mr-2 text-gray-700" />
                      <div>
                        <p className="font-medium">Browser Notifications</p>
                        <p className="text-xs text-gray-500">Receive alerts directly in your browser</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    notificationPreferences.whatsapp
                      ? "border-[#4F46E5] bg-[#4F46E5]/10"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handlePreferenceChange("whatsapp")}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                        notificationPreferences.whatsapp ? "border-[#4F46E5]" : "border-gray-400"
                      }`}
                    >
                      {notificationPreferences.whatsapp && <div className="w-3 h-3 rounded-full bg-[#4F46E5]" />}
                    </div>
                    <div className="flex items-center">
                      <MessageSquare className="w-5 h-5 mr-2 text-gray-700" />
                      <div>
                        <p className="font-medium">WhatsApp Notifications</p>
                        <p className="text-xs text-gray-500">Receive alerts via WhatsApp messages</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pl-11">
                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                    <div className="relative">
                      <input
                        type="tel"
                        placeholder="e.g. +91 9876543210"
                        value={phoneNumber}
                        onChange={(e) => {
                          setPhoneNumber(e.target.value)
                          if (errors.phone) {
                            setErrors((prev) => ({ ...prev, phone: null }))
                          }
                        }}
                        className={`w-full p-2 pr-8 border rounded-md ${
                          errors.phone ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {whatsappVerified && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                            <svg
                              className="w-3 h-3 text-green-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                    {whatsappVerified && (
                      <p className="text-green-600 text-xs mt-1 flex items-center">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </p>
                    )}
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    {errors.whatsapp && <p className="text-red-500 text-xs mt-1">{errors.whatsapp}</p>}
                  </div>
                </div>
              </div>

              {errors.preferences && <p className="text-red-500 text-sm mb-4">{errors.preferences}</p>}

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="border-gray-300"
                  disabled={isSubmitting || isVerifyingWhatsApp}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white"
                  disabled={isSubmitting || isVerifyingWhatsApp}
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Saving...
                    </div>
                  ) : (
                    "Subscribe"
                  )}
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
