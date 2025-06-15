"use client"

import { useState, useEffect } from "react"
import { MapPin, List, Map, Calendar, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Nunito } from "next/font/google"
import LatestUpdates from "@/components/latest-updates"
import HowItWorks from "@/components/how-it-works"
import Benefits from "@/components/benefits"
import Footer from "@/components/footer"
import { AuthModals } from "@/components/auth-modals"
import UserDashboard from "@/components/user-dashboard"
import { NotificationModal } from "@/components/notification-modal"
import { fetchOutageReportsByCity } from "@/lib/firestoreHelpers"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday } from "date-fns"
import dynamic from "next/dynamic";

const SearchBox = dynamic(() => import("@mapbox/search-js-react").then(mod => mod.SearchBox), {
  ssr: false,
});

const useSearchBoxCore = dynamic(
  () => import("@mapbox/search-js-react").then((mod) => mod.useSearchBoxCore),
  { ssr: false }
);

const OutageMap = dynamic(() => import("@/components/outage-map"), {
  ssr: false,
});

const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nunito",
})

export default function LandingPage() {
  const [locality, setLocality] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [pinCode, setPinCode] = useState('')
  const [isSignUpOpen, setIsSignUpOpen] = useState(false)
  const [isLogInOpen, setIsLogInOpen] = useState(false)
  const [location, setLocation] = useState("")
  const [showOutagePage, setShowOutagePage] = useState(false)
  const [showReportForm, setShowReportForm] = useState(false)
  const [viewMode, setViewMode] = useState("list") // "list" or "map"
  const [showUpcomingOutages, setShowUpcomingOutages] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [showDashboard, setShowDashboard] = useState(false)
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [showInPageLogin, setShowInPageLogin] = useState(false)
  const [showAboutPage, setShowAboutPage] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [currentPage, setCurrentPage] = useState("home")
  const [showContactPage, setShowContactPage] = useState(false)
  const [showFaqPage, setShowFaqPage] = useState(false)

  const [scrolled, setScrolled] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  const [outages, setOutages] = useState([])
  const [loadingOutages, setLoadingOutages] = useState(false)

  const [isLoadingLocation, setIsLoadingLocation] = useState(false)

  const [currentCity, setCurrentCity] = useState("");

  const { retrieve } = useSearchBoxCore({
    accessToken: "pk.eyJ1IjoiaGl0bWFuMTMxMCIsImEiOiJjbWJzYXE0N20waGw0MnFxdGxzdThrd2V6In0.J4LGkO6DJWUuRoER09zorA",
    options: { language: "en", limit: 5 }
  });

  // Update the scroll effect with smoother calculation
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = Math.min((scrollTop / Math.max(docHeight, 1)) * 100, 100)

      setScrolled(scrollTop > 10)
      setScrollProgress(scrollPercent)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Form state
  const [reportForm, setReportForm] = useState({
    type: "electricity",
    description: "",
    locality: "",
    city: "",
    state: "",
    pinCode: "",
    photo: null,
  })
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Add a new state to track which outage details are being shown
  const [expandedOutageId, setExpandedOutageId] = useState(null)

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

  // Add footer navigation event listeners
  useEffect(() => {
    const handleNavigateToAbout = (event) => {
      setShowAboutPage(true)
      setShowContactPage(false)
      setShowFaqPage(false)
      setShowDashboard(false)
      setShowReportForm(false)
      setShowOutagePage(false)
      setShowUpcomingOutages(false)
      setCurrentPage("about")

      setTimeout(() => {
        if (event.detail?.scrollTo) {
          const element = document.getElementById(event.detail.scrollTo)
          if (element) {
            element.scrollIntoView({ behavior: "smooth" })
          }
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" })
        }
      }, 100)
    }

    const handleNavigateToContact = () => {
      setShowAboutPage(false)
      setShowContactPage(true)
      setShowFaqPage(false)
      setShowDashboard(false)
      setShowReportForm(false)
      setShowOutagePage(false)
      setShowUpcomingOutages(false)
      setCurrentPage("contact")
      window.scrollTo({ top: 0, behavior: "smooth" })
    }

    const handleNavigateToFaqs = () => {
      setShowAboutPage(false)
      setShowContactPage(false)
      setShowFaqPage(true)
      setShowDashboard(false)
      setShowReportForm(false)
      setShowOutagePage(false)
      setShowUpcomingOutages(false)
      setCurrentPage("faqs")
      window.scrollTo({ top: 0, behavior: "smooth" })
    }

    window.addEventListener("navigate-to-about", handleNavigateToAbout)
    window.addEventListener("navigate-to-contact", handleNavigateToContact)
    window.addEventListener("navigate-to-faqs", handleNavigateToFaqs)

    return () => {
      window.removeEventListener("navigate-to-about", handleNavigateToAbout)
      window.removeEventListener("navigate-to-contact", handleNavigateToContact)
      window.removeEventListener("navigate-to-faqs", handleNavigateToFaqs)
    }
  }, [])

  // Fetch outages from Firebase on mount
  useEffect(() => {
    const fetchOutages = async () => {
      setLoadingOutages(true)
      try {
        const res = await fetch('/api/data')
        const data = await res.json()
        if (data.success && data.data) {
          // Firestore already returns an array of { id, ...fields }
          setOutages(data.data)
        } else {
          setOutages([])
        }
      } catch (error) {
        setOutages([])
      } finally {
        setLoadingOutages(false)
      }
    }
    fetchOutages()
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

  const handleLocationSubmit = async () => {
    if (!location.trim()) return;

    try {
      setLoadingOutages(true);
      // Reset all view states first
      setShowDashboard(false);
      setShowReportForm(false);
      setShowUpcomingOutages(false);
      setShowAboutPage(false);
      setShowContactPage(false);
      setShowFaqPage(false);
      
      // Set the outage page
      setShowOutagePage(true);
      setCurrentPage("outages");
      
      // Fetch outages for the selected city
      const reports = await fetchOutageReportsByCity(location.trim());
      setOutages(reports);
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Error fetching outages:", err);
      setOutages([]);
    } finally {
      setLoadingOutages(false);
    }
  };

  const handleBackToHome = () => {
    setShowOutagePage(false)
    setShowReportForm(false)
    setShowUpcomingOutages(false)
    setShowDashboard(false)
    setShowAboutPage(false)
    setShowContactPage(false)
    setShowFaqPage(false)
    setCurrentPage("home")
    setLocation("")
    setSubmitSuccess(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleBackToOutages = () => {
    setShowReportForm(false)
    setShowUpcomingOutages(false)
    setSubmitSuccess(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Modify the handleReportIssue function to check login status first
  const handleReportIssue = () => {
    if (!isLoggedIn) {
      // If not logged in, open login modal
      setIsLogInOpen(true)
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

  // Modify the handleSubscribeToAlerts function to ensure it shows the modal directly
  const handleLogin = (userData) => {
    setUser(userData)
    setIsLoggedIn(true)
    localStorage.setItem("alertship_user", JSON.stringify(userData))
    closeLogIn()
    closeSignUp()

    // Check if there's a post-login action stored
    const postLoginAction = sessionStorage.getItem("postLoginAction")

    if (postLoginAction === "report") {
      // Clear the stored action
      sessionStorage.removeItem("postLoginAction")
      // Navigate to report form
      setShowAboutPage(false)
      setShowContactPage(false)
      setShowFaqPage(false)
      setShowDashboard(false)
      setShowReportForm(true)
      setShowOutagePage(false)
      setShowUpcomingOutages(false)
      setCurrentPage("report")
      window.scrollTo({ top: 0, behavior: "smooth" })
    } else if (!showOutagePage && !showDashboard && !showReportForm) {
      // Only redirect to dashboard if user is on the landing page and no specific action was intended
      setShowDashboard(true)
      setCurrentPage("dashboard")
    }
    // If user is already on outage page, dashboard, or report form, keep them there
  }

  const handleLogout = () => {
    setUser(null)
    setIsLoggedIn(false)
    localStorage.removeItem("alertship_user")
    setShowDashboard(false)
    // Always redirect to home page after logout
    setShowAboutPage(false)
    setShowContactPage(false)
    setShowFaqPage(false)
    setShowReportForm(false)
    setShowOutagePage(false)
    setShowUpcomingOutages(false)
    setCurrentPage("home")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Update the handleOpenReportModal function to show login modal directly

  const renderNavbar = (page = "home") => (
    <header
      className={`fixed top-0 left-0 right-0 z-40 px-4 sm:px-6 lg:px-8 py-4 transition-all duration-500 ease-out ${
        scrolled ? "backdrop-blur-md bg-white/80" : "bg-transparent"
      }`}
    >
      {/* Bottom border that fills up smoothly */}
      <div
        className="absolute bottom-0 left-0 h-1 bg-[#4F46E5] transition-all duration-300 ease-out"
        style={{ width: `${scrollProgress}%` }}
      />

      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setShowAboutPage(false)
              setShowContactPage(false)
              setShowFaqPage(false)
              setShowDashboard(false)
              setShowReportForm(false)
              setShowOutagePage(false)
              setShowUpcomingOutages(false)
              setCurrentPage("home")
              window.scrollTo({ top: 0, behavior: "smooth" })
            }}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <img src="/images/alertship-logo.png" alt="AlertShip" className="h-10 sm:h-12" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              setShowAboutPage(false)
              setShowContactPage(false)
              setShowFaqPage(false)
              setShowDashboard(false)
              setShowReportForm(false)
              setShowOutagePage(false)
              setShowUpcomingOutages(false)
              setCurrentPage("home")
              window.scrollTo({ top: 0, behavior: "smooth" })
            }}
            className={`text-sm lg:text-base transition-colors ${
              page === "home" ? "text-[#4F46E5] font-semibold" : "text-[#1F2937] hover:text-[#4F46E5]"
            }`}
          >
            Home
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              setShowAboutPage(true)
              setShowContactPage(false)
              setShowFaqPage(false)
              setShowDashboard(false)
              setShowReportForm(false)
              setShowOutagePage(false)
              setShowUpcomingOutages(false)
              setCurrentPage("about")
              window.scrollTo({ top: 0, behavior: "smooth" })
            }}
            className={`text-sm lg:text-base transition-colors ${
              page === "about" ? "text-[#4F46E5] font-semibold" : "text-[#1F2937] hover:text-[#4F46E5]"
            }`}
          >
            About
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              if (!isLoggedIn) {
                // Store the intended action for after login
                sessionStorage.setItem("postLoginAction", "report")
                setIsLogInOpen(true)
              } else {
                // Directly go to report form for logged-in users
                setShowAboutPage(false)
                setShowContactPage(false)
                setShowFaqPage(false)
                setShowDashboard(false)
                setShowReportForm(true)
                setShowOutagePage(false)
                setShowUpcomingOutages(false)
                setCurrentPage("report")
                window.scrollTo({ top: 0, behavior: "smooth" })
              }
            }}
            className={`text-sm lg:text-base transition-colors ${
              page === "report" ? "text-[#4F46E5] font-semibold" : "text-[#1F2937] hover:text-[#4F46E5]"
            }`}
          >
            Report Outage
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              setShowAboutPage(false)
              setShowContactPage(true)
              setShowFaqPage(false)
              setShowDashboard(false)
              setShowReportForm(false)
              setShowOutagePage(false)
              setShowUpcomingOutages(false)
              setCurrentPage("contact")
              window.scrollTo({ top: 0, behavior: "smooth" })
            }}
            className={`text-sm lg:text-base transition-colors ${
              page === "contact" ? "text-[#4F46E5] font-semibold" : "text-[#1F2937] hover:text-[#4F46E5]"
            }`}
          >
            Contact Us
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              setShowAboutPage(false)
              setShowContactPage(false)
              setShowFaqPage(true)
              setShowDashboard(false)
              setShowReportForm(false)
              setShowOutagePage(false)
              setShowUpcomingOutages(false)
              setCurrentPage("faqs")
              window.scrollTo({ top: 0, behavior: "smooth" })
            }}
            className={`text-sm lg:text-base transition-colors ${
              page === "faqs" ? "text-[#4F46E5] font-semibold" : "text-[#1F2937] hover:text-[#4F46E5]"
            }`}
          >
            FAQs
          </a>
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {isLoggedIn ? (
            <>
              {page !== "dashboard" && (
                <Button
                  onClick={() => {
                    setShowAboutPage(false)
                    setShowContactPage(false)
                    setShowFaqPage(false)
                    setShowDashboard(true)
                    setShowReportForm(false)
                    setShowOutagePage(false)
                    setShowUpcomingOutages(false)
                    setCurrentPage("dashboard")
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }}
                  variant="ghost"
                  className="text-[#1F2937] hover:bg-gray-100"
                >
                  Dashboard
                </Button>
              )}
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
  )

  // User Dashboard
  if (showDashboard) {
    return (
      <div className={`min-h-screen bg-[#F9FAFB] ${nunito.className}`}>
        {/* Header */}
        {renderNavbar("dashboard")}

        <div className="pt-24 sm:pt-28 lg:pt-32">
          <UserDashboard user={user} onLogout={handleLogout} />
        </div>

        {/* Footer */}
        <Footer />

        {/* Auth Modals - Available on Dashboard */}
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

  // About Page
  if (showAboutPage) {
    return (
      <div className={`min-h-screen bg-[#F9FAFB] ${nunito.className}`}>
        {/* Header */}
        {renderNavbar("about")}

        {/* Main Content */}
        <main className="px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-8 sm:pb-12">
          <div className="max-w-7xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-16">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1F2937] mb-6 font-playfair">
                About <span className="text-[#4F46E5]">AlertShip</span>
              </h1>
              <p className="text-xl sm:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Keeping communities informed and connected during utility outages with real-time reporting and
                intelligent alerts.
              </p>
            </div>

            {/* Mission Section */}
            <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-sm border mb-16">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-bold text-[#1F2937] mb-6">Our Mission</h2>
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    AlertShip was born from a simple yet powerful idea: communities should never be left in the dark
                    about utility outages. We believe that timely, accurate information can transform how people prepare
                    for and respond to power and water disruptions.
                  </p>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Our platform empowers residents to report outages instantly, stay informed about scheduled
                    maintenance, and receive personalized alerts that help them plan ahead.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-[#4F46E5]/10 to-[#F59E0B]/10 rounded-2xl p-8 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-[#4F46E5] rounded-full flex items-center justify-center mx-auto mb-4">
                      <MapPin className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#1F2937] mb-2">Community First</h3>
                    <p className="text-gray-600">Connecting neighbors through shared information</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Section */}
            <div className="mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-[#1F2937] text-center mb-12">How We Help</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white rounded-2xl p-8 shadow-sm border text-center">
                  <div className="w-16 h-16 bg-[#F59E0B]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#1F2937] mb-4">Real-Time Reporting</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Report outages instantly and see real-time updates from your community. No more wondering if it's
                    just your house or the whole neighborhood.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-sm border text-center">
                  <div className="w-16 h-16 bg-[#4F46E5]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-[#4F46E5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM16 3h5v5h-5V3zM4 3h6v6H4V3z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#1F2937] mb-4">Smart Alerts</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Get personalized notifications via browser, WhatsApp, or email. Stay informed about outages and
                    scheduled maintenance in your area.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-sm border text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#1F2937] mb-4">Predictive Insights</h3>
                  <p className="text-gray-600 leading-relaxed">
                    AI-powered predictions help estimate restoration times and identify patterns to help you plan ahead
                    for future outages.
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="bg-gradient-to-r from-[#4F46E5] to-[#F59E0B] rounded-2xl p-8 sm:p-12 text-white mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">Our Impact</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-4xl sm:text-5xl font-bold mb-2">50K+</div>
                  <div className="text-white/90">Active Users</div>
                </div>
                <div>
                  <div className="text-4xl sm:text-5xl font-bold mb-2">200+</div>
                  <div className="text-white/90">Cities Covered</div>
                </div>
                <div>
                  <div className="text-4xl sm:text-5xl font-bold mb-2">1M+</div>
                  <div className="text-white/90">Reports Processed</div>
                </div>
                <div>
                  <div className="text-4xl sm:text-5xl font-bold mb-2">99.9%</div>
                  <div className="text-white/90">Uptime</div>
                </div>
              </div>
            </div>

            {/* Team Section */}
            <div className="mb-16" id="team">
              <h2 className="text-3xl sm:text-4xl font-bold text-[#1F2937] text-center mb-12">Meet Our Team</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white rounded-2xl p-8 shadow-sm border text-center">
                  <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-6"></div>
                  <h3 className="text-xl font-bold text-[#1F2937] mb-2">Sarah Chen</h3>
                  <p className="text-[#4F46E5] font-medium mb-4">CEO & Co-Founder</p>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Former utility engineer with 10+ years of experience in grid management and community
                    infrastructure.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-sm border text-center">
                  <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-6"></div>
                  <h3 className="text-xl font-bold text-[#1F2937] mb-2">Marcus Rodriguez</h3>
                  <p className="text-[#4F46E5] font-medium mb-4">CTO & Co-Founder</p>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Tech veteran specializing in real-time systems and AI-powered analytics for critical infrastructure.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-sm border text-center">
                  <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-6"></div>
                  <h3 className="text-xl font-bold text-[#1F2937] mb-2">Priya Patel</h3>
                  <p className="text-[#4F46E5] font-medium mb-4">Head of Community</p>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Community advocate focused on making technology accessible and useful for diverse neighborhoods.
                  </p>
                </div>
              </div>
            </div>

            {/* Values Section */}
            <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-sm border mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-[#1F2937] text-center mb-12">Our Values</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#4F46E5]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-[#4F46E5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#1F2937] mb-3">Privacy First</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Your data is yours. We collect only what's necessary to provide our service and never sell
                      personal information.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#F59E0B]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#1F2937] mb-3">Speed & Reliability</h3>
                    <p className="text-gray-600 leading-relaxed">
                      When the lights go out, every second counts. Our platform is built for speed and reliability when
                      you need it most.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#1F2937] mb-3">Community Driven</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Our platform is powered by community reports and feedback. Together, we create a more resilient
                      infrastructure.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#1F2937] mb-3">Innovation</h3>
                    <p className="text-gray-600 leading-relaxed">
                      We continuously innovate to provide better predictions, faster alerts, and more useful insights
                      for our users.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-[#1F2937] mb-6">Ready to Stay Connected?</h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Join thousands of users who trust AlertShip to keep them informed about utility outages in their
                community.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => {
                    setShowAboutPage(false)
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }}
                  className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white px-8 py-3 text-lg"
                >
                  Get Started
                </Button>
                <Button
                  onClick={() => {
                    if (!isLoggedIn) {
                      // Store the intended action for after login
                      sessionStorage.setItem("postLoginAction", "report")
                      setIsLogInOpen(true)
                    } else {
                      // Directly go to report form for logged-in users
                      setShowAboutPage(false)
                      setShowContactPage(false)
                      setShowFaqPage(false)
                      setShowDashboard(false)
                      setShowReportForm(true)
                      setShowOutagePage(false)
                      setShowUpcomingOutages(false)
                      setCurrentPage("report")
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                  }}
                  variant="outline"
                  className="border-[#1F2937] text-[#1F2937] hover:bg-[#1F2937] hover:text-white px-8 py-3 text-lg"
                >
                  Report an Outage
                </Button>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <Footer />

        {/* Auth Modals - Available on About Page */}
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

  // Contact Page
  if (showContactPage) {
    return (
      <div className={`min-h-screen bg-[#F9FAFB] ${nunito.className}`}>
        {/* Header */}
        {renderNavbar("contact")}

        {/* Main Content */}
        <main className="px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-8 sm:pb-12">
          <div className="max-w-7xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-16">
              <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1F2937] mb-6 ${nunito.className}`}>
                Contact <span className="text-[#4F46E5]">Us</span>
              </h1>
              <p className="text-xl sm:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Have questions or need support? We're here to help. Reach out to us and we'll get back to you as soon as
                possible.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border">
                <h2 className="text-2xl font-bold text-[#1F2937] mb-6">Send us a message</h2>

                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-[#1F2937] mb-2">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="firstName"
                        name="firstName"
                        placeholder="Enter your first name"
                        className="h-12 border-2 border-gray-300 focus:border-[#4F46E5] focus:ring-0 outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-[#1F2937] mb-2">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="lastName"
                        name="lastName"
                        placeholder="Enter your last name"
                        className="h-12 border-2 border-gray-300 focus:border-[#4F46E5] focus:ring-0 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-[#1F2937] mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email address"
                      className="h-12 border-2 border-gray-300 focus:border-[#4F46E5] focus:ring-0 outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-[#1F2937] mb-2">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="What is this regarding?"
                      className="h-12 border-2 border-gray-300 focus:border-[#4F46E5] focus:ring-0 outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-[#1F2937] mb-2">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tell us how we can help you..."
                      className="min-h-[120px] border-2 border-gray-300 focus:border-[#4F46E5] focus:ring-0 outline-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white h-12 text-lg font-semibold"
                  >
                    Send Message
                  </Button>
                </form>
              </div>

              {/* Contact Information */}
              <div className="space-y-8">
                <div className="bg-white rounded-2xl p-8 shadow-sm border">
                  <h2 className="text-2xl font-bold text-[#1F2937] mb-6">Get in touch</h2>

                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-[#4F46E5]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-[#4F46E5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[#1F2937] mb-1">Email</h3>
                        <p className="text-gray-600">support@alertship.com</p>
                        <p className="text-gray-600">info@alertship.com</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-[#F59E0B]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[#1F2937] mb-1">Phone</h3>
                        <p className="text-gray-600">+91 123-4567</p>
                        <p className="text-gray-600">+91 987-6543</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[#1F2937] mb-1">Office</h3>
                        <p className="text-gray-600">123 Keshar Tower</p>
                        <p className="text-gray-600">Gwalior, MP 476001</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-sm border">
                  <h3 className="text-xl font-bold text-[#1F2937] mb-4">Business Hours</h3>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex justify-between">
                      <span>Monday - Friday</span>
                      <span>9:00 AM - 6:00 PM PST</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturday</span>
                      <span>10:00 AM - 4:00 PM PST</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sunday</span>
                      <span>Closed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <Footer />

        {/* Auth Modals - Available on Contact Page */}
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

  // FAQ Page
  if (showFaqPage) {
    return (
      <div className={`min-h-screen bg-[#F9FAFB] ${nunito.className}`}>
        {/* Header */}
        {renderNavbar("faqs")}

        {/* Main Content */}
        <main className="px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-8 sm:pb-12">
          <div className="max-w-4xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-16">
              <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1F2937] mb-6 ${nunito.className}`}>
                Frequently Asked <span className="text-[#4F46E5]">Questions</span>
              </h1>
              <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Find answers to common questions about AlertShip and how to stay informed about utility outages.
              </p>
            </div>

            {/* FAQ Items */}
            <div className="space-y-6">
              {/* FAQ Item 1 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <h3 className="text-xl font-bold text-[#1F2937] mb-4">How do I report an outage?</h3>
                <p className="text-gray-600 leading-relaxed">
                  To report an outage, simply click the "Report Outage" button in the navigation menu or on the
                  homepage. You'll need to create an account or log in first. Then fill out the form with details about
                  the outage including the type (electricity or water), location, and description.
                </p>
              </div>

              {/* FAQ Item 2 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <h3 className="text-xl font-bold text-[#1F2937] mb-4">
                  How do I get notified about outages in my area?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  After creating an account, you can subscribe to alerts for your specific location. We'll send you
                  notifications via browser notifications, email, or WhatsApp about both current outages and scheduled
                  maintenance in your area.
                </p>
              </div>

              {/* FAQ Item 3 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <h3 className="text-xl font-bold text-[#1F2937] mb-4">Is AlertShip free to use?</h3>
                <p className="text-gray-600 leading-relaxed">
                  Yes! AlertShip is completely free for all users. You can report outages, receive notifications, and
                  access all features without any cost. We believe that access to utility information should be
                  available to everyone in the community.
                </p>
              </div>

              {/* FAQ Item 4 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <h3 className="text-xl font-bold text-[#1F2937] mb-4">How accurate is the outage information?</h3>
                <p className="text-gray-600 leading-relaxed">
                  We combine official reports from utility companies with community-sourced information. Official
                  reports are marked with a green "Official" badge, while community reports are marked as
                  "Crowdsourced". Our system cross-references multiple reports to ensure accuracy.
                </p>
              </div>

              {/* FAQ Item 5 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <h3 className="text-xl font-bold text-[#1F2937] mb-4">
                  Can I see scheduled maintenance and planned outages?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Yes! Click on "Upcoming Outages" to view a calendar of scheduled maintenance and planned outages. This
                  helps you prepare in advance for any disruptions to your electricity or water service.
                </p>
              </div>

              {/* FAQ Item 6 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <h3 className="text-xl font-bold text-[#1F2937] mb-4">What areas does AlertShip cover?</h3>
                <p className="text-gray-600 leading-relaxed">
                  AlertShip currently covers over 200 cities and is expanding rapidly. Simply enter your location on the
                  homepage to check if your area is covered. If not, you can still report outages to help us expand our
                  coverage to your community.
                </p>
              </div>

              {/* FAQ Item 7 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <h3 className="text-xl font-bold text-[#1F2937] mb-4">How do I update my notification preferences?</h3>
                <p className="text-gray-600 leading-relaxed">
                  After logging in, go to your Dashboard and click on "Settings". There you can choose how you want to
                  receive notifications (browser, email, WhatsApp), set your preferred locations, and customize the
                  types of alerts you want to receive.
                </p>
              </div>

              {/* FAQ Item 8 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <h3 className="text-xl font-bold text-[#1F2937] mb-4">What should I do during an extended outage?</h3>
                <p className="text-gray-600 leading-relaxed">
                  During extended outages, stay updated through AlertShip for restoration estimates. Keep flashlights
                  and batteries handy, avoid opening refrigerators unnecessarily, and check on elderly neighbors. For
                  water outages, store clean water and avoid using electrical appliances when power returns until you're
                  sure the supply is stable.
                </p>
              </div>
            </div>

            {/* Contact CTA */}
            <div className="mt-16 text-center bg-gradient-to-r from-[#4F46E5] to-[#F59E0B] rounded-2xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
              <p className="text-white/90 mb-6">
                Can't find the answer you're looking for? Our support team is here to help.
              </p>
              <Button
                onClick={() => {
                  setShowFaqPage(false)
                  setShowContactPage(true)
                  setCurrentPage("contact")
                  window.scrollTo({ top: 0, behavior: "smooth" })
                }}
                className="bg-white text-[#4F46E5] hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
              >
                Contact Support
              </Button>
            </div>
          </div>
        </main>

        {/* Footer */}
        <Footer />

        {/* Auth Modals - Available on FAQ Page */}
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

  // Report Form Page - Show as standalone page
  if (showReportForm) {
    // Check if user is logged in
    if (!isLoggedIn) {
      // Store the intended action and redirect to login
      sessionStorage.setItem("postLoginAction", "report")
      setShowReportForm(false)
      setIsLogInOpen(true)
      return null
    }

    return (
      <div className={`min-h-screen bg-[#F9FAFB] ${nunito.className}`}>
        {/* Header */}
        {renderNavbar("report")}

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
                      setShowReportForm(false)
                      setShowOutagePage(false)
                      setShowAboutPage(false)
                      setShowContactPage(false)
                      setShowFaqPage(false)
                      setShowDashboard(false)
                      setShowUpcomingOutages(false)
                      setCurrentPage("home")
                      window.scrollTo({ top: 0, behavior: "smooth" })
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
                  <Button
                    onClick={() => {
                      setShowReportForm(false)
                      setShowAboutPage(false)
                      setShowContactPage(false)
                      setShowFaqPage(false)
                      setShowDashboard(false)
                      setShowOutagePage(false)
                      setShowUpcomingOutages(false)
                      setCurrentPage("home")
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }}
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
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

        {/* Auth Modals - Available on Report Page */}
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

  // Outage Page Content
  if (showOutagePage) {
    // Upcoming Outages Page
    if (showUpcomingOutages) {
      return (
        <div className={`min-h-screen bg-[#F9FAFB] ${nunito.className}`}>
          {/* Header */}
          {renderNavbar("outages")}

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
                      onClick={() => setShowInPageLogin(true)}
                      className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white whitespace-nowrap"
                    >
                      Subscribe to Alerts
                    </Button>
                  </div>
                </div>
                {showInPageLogin && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-[#1F2937]">Log in to Subscribe</h3>
                        <button
                          onClick={() => setShowInPageLogin(false)}
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <X className="w-5 h-5 text-gray-500" />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                          </label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            className="h-10 border-gray-300 focus:border-[#4F46E5] focus:ring-0"
                          />
                        </div>

                        <div>
                          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                          </label>
                          <Input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            className="h-10 border-gray-300 focus:border-[#4F46E5] focus:ring-0"
                          />
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="text-sm">
                            <button
                              type="button"
                              onClick={() => {
                                setShowInPageLogin(false)
                                setIsSignUpOpen(true)
                              }}
                              className="text-[#4F46E5] hover:underline"
                            >
                              Don't have an account?
                            </button>
                          </div>
                          <Button
                            onClick={() => {
                              // Simulate login
                              setIsLoggedIn(true)
                              setUser({
                                name: "Demo User",
                                email: "demo@example.com",
                                id: "user_" + Date.now(),
                              })
                              setShowInPageLogin(false)
                              localStorage.setItem(
                                "alertship_user",
                                JSON.stringify({
                                  name: "Demo User",
                                  email: "demo@example.com",
                                  id: "user_" + Date.now(),
                                }),
                              )
                              // Show notification modal after login
                              setShowNotificationModal(true)
                            }}
                            className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white"
                          >
                            Log In
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Notification Modal */}
              <NotificationModal
                isOpen={showNotificationModal}
                onClose={() => setShowNotificationModal(false)}
                isLoggedIn={isLoggedIn}
                onOpenLogin={() => {
                  setShowNotificationModal(false)
                  setIsLogInOpen(true)
                }}
              />
            </div>
          </main>

          {/* Footer */}
          <Footer />

          {/* Auth Modals - Available on Upcoming Outages Page */}
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

    // Main Outage Page
    return (
      <div className={`min-h-screen bg-[#F9FAFB] ${nunito.className}`}>
        {/* Header */}
        {renderNavbar("outages")}

        {/* Main Content */}
        <main className="px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-8 sm:pb-12">
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

                <Button
                  onClick={() => {
                    if (!isLoggedIn) {
                      // Open login modal directly on this page
                      setIsLogInOpen(true)
                      return
                    } else {
                      setShowReportForm(true)
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

        {/* Auth Modals - Available on Outage Page */}
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

  // Landing Page
  return (
    <div className={`min-h-screen bg-[#F9FAFB] ${nunito.className}`}>
      {/* Header */}
      {renderNavbar("home")}

      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-8 sm:pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="text-center lg:text-left">
              <h1
                className={`text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-[#1F2937] mb-6 ${nunito.className}`}
              >
                <span className="text-[#4F46E5]">Report and Track</span>
                <br />
                Local Outages
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Check and report electricity and water disruptions in your area.
              </p>

              {/* Location Input */}
              <div className="bg-white rounded-2xl p-4 shadow-lg border max-w-md mx-auto lg:mx-0 mb-6">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-[#4F46E5] flex-shrink-0" />
                  <SearchBox
                    accessToken="pk.eyJ1IjoiaGl0bWFuMTMxMCIsImEiOiJjbWJzYXE0N20waGw0MnFxdGxzdThrd2V6In0.J4LGkO6DJWUuRoER09zorA"
                    options={{ language: "en", limit: 5 }}
                    value={location}
                    onRetrieve={(res) => {
                      console.log("Mapbox oneretrieve fired.")
                      if (res?.suggestion?.name) {
                        setLocation(res.suggestion.name);
                      } else if (res?.features?.[0]?.place_name) {
                        setLocation(res.features[0].place_name);
                      }
                    }}
                    onChange={(e) => {
                      const value = typeof e === "string" ? e : e?.target?.value || '';
                      setLocation(value);
                    }}
                    inputProps={{
                      placeholder: "Enter your location",
                      className: "border-0 focus:ring-0 text-base placeholder-gray-500 w-full",
                      onKeyPress: (e) => e.key === "Enter" && handleLocationSubmit(),
                    }}
                    resultsListProps={{
                      className: "mbx023e2d0e--Results",
                      role: "listbox",
                      "aria-label": "Search results",
                      onMouseDown: (e) => {
                        // Prevent the default behavior that might cause focus issues
                        e.preventDefault();
                      }
                    }}
                    suggestionProps={{
                      role: "option",
                      onMouseDown: (e) => {
                        // Prevent the default behavior that might cause focus issues
                        e.preventDefault();
                      }
                    }}
                    suggestions={[
                      {
                        id: 'current-location',
                        text: isLoadingLocation ? 'Getting location...' : 'Use current location',
                        icon: isLoadingLocation ? (
                          <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        ),
                        onClick: () => {
                          if (!isLoadingLocation) {
                            handleGetCurrentLocation();
                          }
                        }
                      }
                    ]}
                  />
                  <Button
                    type="button" 
                    onClick={handleLocationSubmit}
                    className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white px-6 py-2 rounded-xl"
                  >
                    Check
                  </Button>
                </div>
              </div>

              {/* CTA Buttons */}
              {!isLoggedIn && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button
                    onClick={() => {
                      setIsSignUpOpen(true)
                    }}
                    className="bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-white px-8 py-3 text-lg font-semibold h-auto"
                  >
                    Get Started Free
                  </Button>
                </div>
              )}
            </div>

            {/* Right Column - Hero Image */}
            <div className="relative">
              <div className="relative z-10">
                <img
                  src="/images/hero-illustration.png"
                  alt="AlertShip Dashboard"
                  className="w-full h-auto rounded-2xl"
                />
              </div>
              {/* Background decoration */}
              <div className="absolute -top-4 -right-4 w-full h-full bg-gradient-to-br from-[#4F46E5]/20 to-[#F59E0B]/20 rounded-2xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Updates Section */}
      <LatestUpdates />

      {/* How It Works Section */}
      <HowItWorks />

      {/* Benefits Section */}
      <Benefits />

      {/* Footer */}
      <Footer showQuestionsSection={true} />

      {/* Auth Modals - Available on Home Page */}
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

const handleGetCurrentLocation = () => {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser")
    return
  }

  setIsLoadingLocation(true)
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const { latitude, longitude } = position.coords
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=pk.eyJ1IjoiaGl0bWFuMTMxMCIsImEiOiJjbWJzYXE0N20waGw0MnFxdGxzdThrd2V6In0.J4LGkO6DJWUuRoER09zorA`
        )
        const data = await response.json()
        if (data.features && data.features.length > 0) {
          setLocation(data.features[0].place_name)
          handleLocationSubmit()
        }
      } catch (error) {
        console.error("Error getting location:", error)
        alert("Error getting location. Please try again.")
      } finally {
        setIsLoadingLocation(false)
      }
    },
    (error) => {
      console.error("Error getting location:", error)
      alert("Error getting location. Please try again.")
      setIsLoadingLocation(false)
    }
  )
}
