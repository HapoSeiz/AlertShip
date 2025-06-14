"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Bell, MessageSquare } from "lucide-react"

export function NotificationModal({ isOpen, onClose, isLoggedIn, onOpenLogin }) {
  const [notificationPreferences, setNotificationPreferences] = useState({
    browser: true,
    whatsapp: false,
  })
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [errors, setErrors] = useState({})

  // Add WhatsApp OTP verification states
  const [showWhatsAppOtp, setShowWhatsAppOtp] = useState(false)
  const [whatsappOtp, setWhatsappOtp] = useState("")
  const [generatedWhatsappOtp, setGeneratedWhatsappOtp] = useState("")
  const [whatsappOtpSent, setWhatsappOtpSent] = useState(false)
  const [whatsappResendTimer, setWhatsappResendTimer] = useState(0)

  // Generate random 6-digit OTP for WhatsApp
  const generateWhatsAppOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  // Send WhatsApp OTP (simulated)
  const sendWhatsAppOtp = async (phoneNumber) => {
    const newOtp = generateWhatsAppOtp()
    setGeneratedWhatsappOtp(newOtp)

    // Simulate sending WhatsApp message
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // In real implementation, you would send WhatsApp message here
    console.log(`WhatsApp OTP sent to ${phoneNumber}: ${newOtp}`)
    alert(`WhatsApp OTP sent to ${phoneNumber}! (For demo: ${newOtp})`)

    setWhatsappOtpSent(true)
    startWhatsAppResendTimer()
  }

  // Start WhatsApp resend timer
  const startWhatsAppResendTimer = () => {
    setWhatsappResendTimer(60)
    const timer = setInterval(() => {
      setWhatsappResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const validateWhatsAppOtp = () => {
    if (!whatsappOtp.trim()) {
      setErrors({ whatsappOtp: "OTP is required" })
      return false
    }
    if (whatsappOtp.length !== 6) {
      setErrors({ whatsappOtp: "OTP must be 6 digits" })
      return false
    }
    if (whatsappOtp !== generatedWhatsappOtp) {
      setErrors({ whatsappOtp: "Invalid OTP. Please try again." })
      return false
    }
    setErrors({})
    return true
  }

  const handleWhatsAppOtpVerification = async (e) => {
    e.preventDefault()
    if (validateWhatsAppOtp()) {
      setIsSubmitting(true)
      try {
        // Simulate WhatsApp number verification
        await new Promise((resolve) => setTimeout(resolve, 1000))
        console.log("WhatsApp number verified:", phoneNumber)

        // Proceed with saving notification preferences
        await new Promise((resolve) => setTimeout(resolve, 500))
        console.log("Notification preferences saved:", {
          browser: notificationPreferences.browser,
          whatsapp: true,
          phoneNumber: phoneNumber,
        })
        setSubmitSuccess(true)
      } catch (error) {
        console.error("Error verifying WhatsApp number:", error)
        setErrors({ whatsappOtp: "Verification failed. Please try again." })
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleResendWhatsAppOtp = async () => {
    if (whatsappResendTimer > 0) return

    setIsSubmitting(true)
    try {
      await sendWhatsAppOtp(phoneNumber)
    } catch (error) {
      alert("Failed to resend WhatsApp OTP. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // If WhatsApp is selected, show OTP verification
    if (notificationPreferences.whatsapp && !showWhatsAppOtp) {
      setIsSubmitting(true)
      try {
        await sendWhatsAppOtp(phoneNumber)
        setShowWhatsAppOtp(true)
      } catch (error) {
        alert("Failed to send WhatsApp OTP. Please try again.")
      } finally {
        setIsSubmitting(false)
      }
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call for browser notifications only
      await new Promise((resolve) => setTimeout(resolve, 1500))
      console.log("Notification preferences saved:", {
        browser: notificationPreferences.browser,
        whatsapp: false,
        phoneNumber: null,
      })
      setSubmitSuccess(true)
    } catch (error) {
      console.error("Error saving notification preferences:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const validateForm = () => {
    if (!phoneNumber.trim() && notificationPreferences.whatsapp) {
      setErrors({ phone: "Phone number is required for WhatsApp notifications" })
      return false
    }
    setErrors({})
    return true
  }

  const handlePreferenceChange = (preference) => {
    setNotificationPreferences((prev) => ({
      ...prev,
      [preference]: !prev[preference],
    }))
  }

  // If user is not logged in, show login prompt
  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#1F2937]">Subscribe to Alerts</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800">You need to be logged in to subscribe to alerts.</p>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onClose} className="border-gray-300">
                Cancel
              </Button>
              <Button
                onClick={() => {
                  onClose()
                  onOpenLogin()
                }}
                className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white"
              >
                Log In
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

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
            <Button onClick={onClose} className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white">
              Close
            </Button>
          </div>
        ) : // WhatsApp OTP Verification
        showWhatsAppOtp ? (
          <form onSubmit={handleWhatsAppOtpVerification}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#1F2937]">Verify WhatsApp Number</h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-green-800">
                      We've sent a 6-digit verification code to <span className="font-semibold">{phoneNumber}</span> via
                      WhatsApp
                    </p>
                    <p className="text-xs text-green-600 mt-1">Please check your WhatsApp and enter the code below.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
                  <input
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={whatsappOtp}
                    onChange={(e) => setWhatsappOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className={`w-full p-3 text-center text-lg tracking-widest border rounded-md ${
                      errors.whatsappOtp ? "border-red-500" : "border-gray-300"
                    }`}
                    maxLength={6}
                  />
                  {errors.whatsappOtp && <p className="text-red-500 text-xs mt-1">{errors.whatsappOtp}</p>}
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
                  <button
                    type="button"
                    onClick={handleResendWhatsAppOtp}
                    disabled={isSubmitting || whatsappResendTimer > 0}
                    className="text-sm text-[#4F46E5] font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {whatsappResendTimer > 0 ? `Resend in ${whatsappResendTimer}s` : "Resend Code"}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowWhatsAppOtp(false)}
                  className="border-gray-300"
                  disabled={isSubmitting}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white"
                  disabled={isSubmitting || whatsappOtp.length !== 6}
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Verifying...
                    </div>
                  ) : (
                    "Verify & Subscribe"
                  )}
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#1F2937]">Subscribe to Alerts</h2>
                <button
                  type="button"
                  onClick={onClose}
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

                  {notificationPreferences.whatsapp && (
                    <div className="mt-3 pl-11">
                      <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                      <input
                        type="tel"
                        placeholder="e.g. +91 9876543210"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className={`w-full p-2 border rounded-md ${
                          errors.phone ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>
                  )}
                </div>
              </div>

              {errors.preferences && <p className="text-red-500 text-sm mb-4">{errors.preferences}</p>}

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="border-gray-300"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white" disabled={isSubmitting}>
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
