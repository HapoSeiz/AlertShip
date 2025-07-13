"use client"

import { useState } from "react"
import { MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { AuthModals } from "@/components/auth-modals"
import { useAuth } from "@/contexts/AuthContext";
import { Nunito } from "next/font/google"

const nunito = Nunito({ 
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nunito",
})


export default function ReportPage() {
    const router = useRouter();
    const {
      isAuthenticated,
      user,
      loading,
      openLogIn,
      openSignUp,
      signOut,
    } = useAuth();

    // All state hooks at the top
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reportForm, setReportForm] = useState({
        type: "electricity",
        description: "",
        locality: "",
        city: "",
        state: "",
        pinCode: "",
        photo: null,
    });

    // --- Post-login redirect logic ---
    useEffect(() => {
      if (typeof window !== "undefined" && isAuthenticated) {
        const postLoginAction = sessionStorage.getItem("postLoginAction");
        if (postLoginAction === "report") {
          sessionStorage.removeItem("postLoginAction");
          router.replace("/report");
        }
      }
    }, [isAuthenticated, router]);

    // Route protection
    useEffect(() => {
      if (!loading && !isAuthenticated) {
        router.push("/");
      }
    }, [loading, isAuthenticated, router]);

    if (loading) {
      return null; // or <LoadingSpinner />
    }
    if (!isAuthenticated) {
      return null;
    }

    // Modify the handleReportIssue function to check login status first
    const handleReportIssue = () => {
        if (!isAuthenticated) {
        // If not logged in, open login modal
        openLogIn()
        return
        }
        // No-op or add your own logic here
    }

    const handleViewUpcomingOutages = () => {
        // No-op or add your own logic here
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

    return (
      <div className={`min-h-screen bg-[#F9FAFB] ${nunito.className}`}>
        {/* Header */}
        <Header currentPage="report" />

        {/* Main Content */}
        <main className="px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-8 sm:pb-12">
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
                  Thank you for reporting the issue. You will receive updates on the status of your report.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => {
                      router.push('/')
                      setSubmitSuccess(false)
                    }}
                    className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white"
                  >
                    Back to Home
                  </Button>
                  <Button
                    onClick={() => {
                      setSubmitSuccess(false)
                    }}
                    variant="outline"
                    className="border-[#1F2937] text-[#1F2937] hover:bg-[#1F2937] hover:text-white"
                  >
                    Report Another Issue
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2937]">Report an Outage</h1>
                  
                </div>

                <form onSubmit={handleSubmitReport} className="space-y-6">
                  {/* Rest of the form content remains the same */}
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
                            {reportForm.type === "electricity" && <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />}
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
                            required
                            placeholder="Enter your locality"
                            className="pl-10 h-12 w-full border-2 border-gray-300 focus:border-[#4F46E5] focus:ring-0 outline-none rounded-md"
                          />
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
                            required
                            placeholder="Enter your city"
                            className="pl-10 h-12 w-full border-2 border-gray-300 focus:border-[#4F46E5] focus:ring-0 outline-none rounded-md"
                          />
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
                            required
                            placeholder="Enter state name"
                            className="pl-10 h-12 w-full border-2 border-gray-300 focus:border-[#4F46E5] focus:ring-0 outline-none rounded-md"
                          />
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
                            required
                            placeholder="Enter 6-digit pin code"
                            maxLength={6}
                            pattern="[0-9]*"
                            className="pl-10 h-12 w-full border-2 border-gray-300 focus:border-[#4F46E5] focus:ring-0 outline-none rounded-md"
                          />
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

        {/* Footer */}
        <Footer />
        <AuthModals />
      </div>
    )
  }