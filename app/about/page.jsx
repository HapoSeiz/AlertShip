"use client"

import { useState, useEffect } from "react"
import { MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Nunito } from "next/font/google"
import Footer from "@/components/footer"
import { AuthModals } from "@/components/auth-modals"

const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nunito",
})

export default function AboutPage() {
  const [isSignUpOpen, setIsSignUpOpen] = useState(false)
  const [isLogInOpen, setIsLogInOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)

  const [scrolled, setScrolled] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  // Update the scroll effect with smoother calculation
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = Math.min((scrollTop / docHeight) * 100, 100)

      setScrolled(scrollTop > 10)
      setScrollProgress(scrollPercent)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Check if user is logged in on component mount
  useEffect(() => {
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

  const handleLogin = (userData) => {
    setUser(userData)
    setIsLoggedIn(true)
    localStorage.setItem("alertship_user", JSON.stringify(userData))
    closeLogIn()
    closeSignUp()
  }

  const handleLogout = () => {
    setUser(null)
    setIsLoggedIn(false)
    localStorage.removeItem("alertship_user")
  }

  const renderNavbar = () => (
    <header
      className={`fixed top-0 left-0 right-0 z-40 px-4 sm:px-6 lg:px-8 py-4 transition-all duration-500 ease-out ${
        scrolled ? "backdrop-blur-md bg-white/80" : "bg-transparent"
      }`}
    >
      {/* Bottom border that fills up smoothly */}
      <div
        className="absolute bottom-0 left-0 h-1 bg-[#4F46E5] transition-all duration-500 ease-out"
        style={{ width: `${scrollProgress}%` }}
      />

      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <img src="/images/alertship-logo.png" alt="AlertShip" className="h-10 sm:h-12" />
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
          <a href="/" className="text-sm lg:text-base text-[#1F2937] hover:text-[#4F46E5] transition-colors">
            Home
          </a>
          <a href="/about" className="text-sm lg:text-base text-[#4F46E5] font-semibold transition-colors">
            About
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              if (!isLoggedIn) {
                setIsLogInOpen(true)
              } else {
                // Navigate to report page
                window.location.href = "/?report=true"
              }
            }}
            className="text-sm lg:text-base text-[#1F2937] hover:text-[#4F46E5] transition-colors"
          >
            Report Outage
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              alert("Contact Us page coming soon!")
            }}
            className="text-sm lg:text-base text-[#1F2937] hover:text-[#4F46E5] transition-colors"
          >
            Contact Us
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              alert("FAQs page coming soon!")
            }}
            className="text-sm lg:text-base text-[#1F2937] hover:text-[#4F46E5] transition-colors"
          >
            FAQs
          </a>
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {isLoggedIn ? (
            <>
              <Button
                onClick={() => (window.location.href = "/?dashboard=true")}
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
  )

  return (
    <div className={`min-h-screen bg-[#F9FAFB] ${nunito.className}`}>
      {/* Header */}
      {renderNavbar()}

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-8 sm:pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1F2937] mb-6 font-playfair">
              About <span className="text-[#4F46E5]">AlertShip</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Keeping communities informed and connected during utility outages with real-time reporting and intelligent
              alerts.
            </p>
          </div>

          {/* Mission Section */}
          <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-sm border mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-[#1F2937] mb-6">Our Mission</h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  AlertShip was born from a simple yet powerful idea: communities should never be left in the dark about
                  utility outages. We believe that timely, accurate information can transform how people prepare for and
                  respond to power and water disruptions.
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
                  Report outages instantly and see real-time updates from your community. No more wondering if it's just
                  your house or the whole neighborhood.
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
          <div className="mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1F2937] text-center mb-12">Meet Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-sm border text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">SC</span>
                </div>
                <h3 className="text-xl font-bold text-[#1F2937] mb-2">Sarah Chen</h3>
                <p className="text-[#4F46E5] font-medium mb-4">CEO & Co-Founder</p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Former utility engineer with 10+ years of experience in grid management and community infrastructure
                  at Pacific Gas & Electric.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-sm border text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">MR</span>
                </div>
                <h3 className="text-xl font-bold text-[#1F2937] mb-2">Marcus Rodriguez</h3>
                <p className="text-[#4F46E5] font-medium mb-4">CTO & Co-Founder</p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Tech veteran specializing in real-time systems and AI-powered analytics. Previously led engineering
                  teams at Tesla and SpaceX.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-sm border text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">PP</span>
                </div>
                <h3 className="text-xl font-bold text-[#1F2937] mb-2">Priya Patel</h3>
                <p className="text-[#4F46E5] font-medium mb-4">Head of Community</p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Community advocate with experience at Nextdoor and Ring. Focused on making technology accessible for
                  diverse neighborhoods.
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
                    Your data is yours. We collect only what's necessary to provide our service and never sell personal
                    information.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#F59E0B]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
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
                    We continuously innovate to provide better predictions, faster alerts, and more useful insights for
                    our users.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
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
    </div>
  )
}
