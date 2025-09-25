
"use client"

import { useEffect, useState, useRef } from "react";

import { useRouter } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { AuthModals } from "@/components/auth-modals";
import { useAuth } from "@/contexts/AuthContext";
import { Nunito } from "next/font/google";
import OutageTypeSelector from "@/components/report/OutageTypeSelector";
import LocationDetails from "@/components/report/LocationDetails";
import DescriptionInput from "@/components/report/DescriptionInput";
import PhotoUpload from "@/components/report/PhotoUpload";
import SuccessMessage from "@/components/report/SuccessMessage";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import clsx from "clsx";
import { useReportForm } from "@/hooks/useReportForm";

const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nunito",
});





export default function ReportPage() {
  // Ref for description textarea
  const descriptionInputRef = useRef(null);
  // Ref for latest description value
  const descriptionValueRef = useRef("");
  console.log("Google Maps API Key:", process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? "Present" : "Missing");
  

  
  const router = useRouter();
  const { isAuthenticated, user, loading } = useAuth();
  const { toast } = useToast();

  const {
    formData,
    setFormData,
    formErrors,
    setFormErrors,
    validate,
    submitSuccess,
    setSubmitSuccess,
    isSubmitting,
    setIsSubmitting,
    localityInputKey,
    setLocalityInputKey,
    localityInputRef,
    isSearching,
    searchResults,
    showResults,
    searchError,
    isGettingLocation,
    handleTypeChange,
    handleLocationChange,
    handleDescriptionChange,
    handleRemovePhoto,
    handleSubmitReport,
    handleSearch,
    handleClearSearch,
    handlePlaceSelect,
    handleGetCurrentLocation,
  } = useReportForm({ user, toast, router, descriptionValueRef });

  // Track if form was just submitted
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Accessibility: focus first invalid field only after submit
  useEffect(() => {
    if (hasSubmitted && formErrors) {
      const firstErrorField = Object.keys(formErrors).find((key) => formErrors[key]);
      if (firstErrorField) {
        const el = document.querySelector(`[name="${firstErrorField}"]`);
        if (el) el.focus();
      }
      setHasSubmitted(false); // Reset after focusing
    }
  }, [formErrors, hasSubmitted]);

  // Scroll to top when report is successfully submitted
  useEffect(() => {
    if (submitSuccess) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [submitSuccess]);

  // Route protection with proper loading state check
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/");
    }
  }, [loading, isAuthenticated, router]);


  // Only render after auth state is loaded
  if (loading) return null;
  if (!isAuthenticated) return null;



  return (
    <div className={`min-h-screen bg-[#F9FAFB] ${nunito.className}`}>
      <Header currentPage="report" />
      <main className="px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-8 sm:pb-12">
        <div className="max-w-3xl mx-auto">
          {submitSuccess ? (
            <SuccessMessage
              onBackHome={() => {
                router.push("/");
                setSubmitSuccess(false);
              }}
              onReportAnother={() => {
                setSubmitSuccess(false);
                setLocalityInputKey(Date.now());
              }}
            />
          ) : (
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2937]">Report an Outage</h1>
              </div>
              <form
                onSubmit={e => {
                  setHasSubmitted(true);
                  handleSubmitReport(e);
                }}
                className="space-y-6"
                noValidate
                aria-live="polite"
              >
                <OutageTypeSelector value={formData.issue.type} onChange={handleTypeChange} />
                <LocationDetails
                  location={formData.location}
                  onChange={handleLocationChange}
                  formErrors={formErrors}
                  setFormErrors={setFormErrors}
                  localityInputRef={localityInputRef}
                  localityInputKey={localityInputKey}
                  isSearching={isSearching}
                  searchResults={searchResults}
                  showResults={showResults}
                  searchError={searchError}
                  onSearch={handleSearch}
                  onClearSearch={handleClearSearch}
                  onPlaceSelect={handlePlaceSelect}
                  onGetCurrentLocation={() => handleGetCurrentLocation(descriptionInputRef)}
                  isGettingLocation={isGettingLocation}
                  descriptionInputRef={descriptionInputRef}
                />
                <DescriptionInput
                  value={formData.issue.description}
                  onChange={e => {
                    setHasSubmitted(false); // Reset so focus doesn't jump while typing
                    handleDescriptionChange(e);
                    descriptionValueRef.current = e.target.value;
                  }}
                  error={formErrors.description}
                  inputRef={descriptionInputRef}
                />
                <PhotoUpload
                  photo={formData.user.photo}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFormData((prev) => ({
                        ...prev,
                        user: { ...prev.user, photo: e.target.files[0] },
                      }));
                    }
                  }}
                  onRemove={handleRemovePhoto}
                />
                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-white px-8 py-3 text-lg font-semibold h-auto"
                    aria-busy={isSubmitting}
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
      <Footer />
      <AuthModals />
    </div>
  );
}
