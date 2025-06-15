"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { X, MapPin, Zap, Droplet, Camera } from "lucide-react"
import dynamic from "next/dynamic";

const SearchBox = dynamic(() => import("@mapbox/search-js-react").then(mod => mod.SearchBox), {
  ssr: false,
});


export function ReportModal({ isOpen, onClose, isLoggedIn, onOpenLogin }) {
  const [reportForm, setReportForm] = useState({
    type: "electricity",
    description: "",
    address: "",
    
    photo: null,
    name: "",
    contact: "",
  })
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  if (!isOpen) return null

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

    if (!reportForm.name.trim()) {
      errors.name = "Name is required"
    }

    if (!reportForm.contact.trim()) {
      errors.contact = "Contact information is required"
    } else if (!/^\S+@\S+\.\S+$/.test(reportForm.contact) && !/^\d{10}$/.test(reportForm.contact)) {
      errors.contact = "Please enter a valid email or phone number"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmitReport = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportForm),
      });
      const result = await res.json();
      if (result.success) {
        setSubmitSuccess(true);
        setReportForm({
          type: "electricity",
          description: "",
          address: "",
          photo: null,
          name: "",
          contact: "",
        });
      } else {
        alert(result.error || 'Failed to submit report. Please try again.');
      }
    } catch (error) {
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose()
    setSubmitSuccess(false)
    setFormErrors({})
  }

  // If user is not logged in, show login prompt
  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#1F2937]">Report an Outage</h2>
              <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800">You need to be logged in to report an outage.</p>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleClose} className="border-gray-300">
                Cancel
              </Button>
              <Button
                onClick={() => {
                  handleClose()
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {submitSuccess ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#1F2937] mb-4">Report Submitted Successfully!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for reporting the issue. Our team will review it and take appropriate action. You will receive
              updates on the status of your report.
            </p>
            <Button onClick={handleClose} className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmitReport}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#1F2937]">Report an Outage</h2>
                <button
                  type="button"
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Outage Type */}
                <div>
                  <label className="block text-sm font-medium text-[#1F2937] mb-3">Outage Type</label>
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
                        <div className="flex items-center">
                          <Zap className="w-5 h-5 mr-2 text-gray-700" />
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
                          <Droplet className="w-5 h-5 mr-2 text-gray-700" />
                          <div>
                            <p className="font-medium">Water</p>
                            <p className="text-xs text-gray-500">Water supply issues</p>
                          </div>
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
                    className={`min-h-[100px] border-2 ${
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
                    <SearchBox
                      accessToken="pk.eyJ1IjoiaGl0bWFuMTMxMCIsImEiOiJjbWJzYXE0N20waGw0MnFxdGxzdThrd2V6In0.J4LGkO6DJWUuRoER09zorA"
                      options={{ language: "en", limit: 5 }}
                      value={reportForm.address}
                      onRetrieve={(res) => {
                        setReportForm((prev) => ({
                          ...prev,
                          address: res.features?.[0]?.place_name || "",
                        }));
                      }}
                      onChange={(e) => {
                        if (typeof e === "string") {
                          setReportForm((prev) => ({ ...prev, address: e }));
                        } else if (e && e.target) {
                          setReportForm((prev) => ({ ...prev, address: e.target.value }));
                        }
                      }}
                      theme={{ variables: { borderRadius: "8px" } }}
                      inputProps={{
                        id: "address",
                        name: "address",
                        placeholder: "Enter specific location of the issue",
                        className: `pl-10 h-12 border-2 w-full ${
                          formErrors.address ? "border-red-500" : "border-gray-300"
                        } focus:border-[#4F46E5] focus:ring-0 outline-none`,
                      }}
                    />
                  </div>
                  {formErrors.address && <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>}
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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
                            <Camera className="w-10 h-10 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600">Click to upload a photo of the issue</p>
                            <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                          </>
                        )}
                      </div>
                    </label>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-[#1F2937] mb-4">Your Information</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-[#1F2937] mb-2">
                        Your Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Enter your full name"
                        value={reportForm.name}
                        onChange={handleFormChange}
                        className={`h-12 border-2 ${
                          formErrors.name ? "border-red-500" : "border-gray-300"
                        } focus:border-[#4F46E5] focus:ring-0 outline-none`}
                      />
                      {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                    </div>

                    {/* Contact */}
                    <div>
                      <label htmlFor="contact" className="block text-sm font-medium text-[#1F2937] mb-2">
                        Email or Phone <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="contact"
                        name="contact"
                        placeholder="Enter your email or phone number"
                        value={reportForm.contact}
                        onChange={handleFormChange}
                        className={`h-12 border-2 ${
                          formErrors.contact ? "border-red-500" : "border-gray-300"
                        } focus:border-[#4F46E5] focus:ring-0 outline-none`}
                      />
                      {formErrors.contact && <p className="text-red-500 text-sm mt-1">{formErrors.contact}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="border-gray-300"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-white px-8"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Submitting...
                    </div>
                  ) : (
                    "Submit Report"
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
