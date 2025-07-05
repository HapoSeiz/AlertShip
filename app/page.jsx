"use client"

import { useState } from "react"
import { MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Nunito } from "next/font/google"
import LatestUpdates from "@/components/latest-updates"
import HowItWorks from "@/components/how-it-works"
import Benefits from "@/components/benefits"
import Footer from "@/components/footer"
import Header from "@/components/header"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { AuthModals } from "@/components/auth-modals"

const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nunito",
})

export default function LandingPage() {
  const router = useRouter()
  const [location, setLocation] = useState("")
  const { isAuthenticated, openSignUp } = useAuth()

  const handleLocationSubmit = () => {
    if (!location.trim()) return
    router.push(`/outages?location=${encodeURIComponent(location.trim())}`)
  }

  return (
    <div className={`min-h-screen bg-[#F9FAFB] ${nunito.className}`}>
      {/* Header */}
      <Header currentPage="home" />

      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-8 sm:pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="text-center lg:text-left">
              <h1 className={`text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-[#1F2937] mb-6 ${nunito.className}`}>
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
                  <Input
                    type="text"
                    placeholder="Enter your location"
                    className="border-0 focus:ring-0 text-base placeholder-gray-500 w-full"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleLocationSubmit()
                      }
                    }}
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
              {!isAuthenticated && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button
                    onClick={openSignUp}
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
      <HowItWorks />
      <Benefits />
      <Footer showQuestionsSection={true} />
      <AuthModals />
    </div>
  )
}
