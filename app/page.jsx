"use client"

import { useState, useEffect, useRef } from "react"
import { MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Nunito } from "next/font/google"
import LatestUpdates from "@/components/latest-updates"
import HowItWorks from "@/components/how-it-works"
import Benefits from "@/components/benefits"
import Footer from "@/components/footer"
import Header from "@/components/header"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { AuthModals } from "@/components/auth-modals"

const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nunito",
})

export default function LandingPage() {
  const router = useRouter()
  const searchParams = useSearchParams();
  const [location, setLocation] = useState("")
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [showInfoMessage, setShowInfoMessage] = useState(false)
  const locationAreaRef = useRef(null)
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)
  const [selectedFromDropdown, setSelectedFromDropdown] = useState(false)
  // All Google Places/Maps API code removed
  const { isAuthenticated, openSignUp, openLogIn } = useAuth()
  
  // Track input focus for button color feedback
  const [inputFocused, setInputFocused] = useState(false);
  // Location search using Photon API
  const handleLocationSearch = async () => {
    console.log('handleLocationSearch called', { location });
    if (location.trim().length < 3) {
      console.warn('Input too short', { location });
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    setShowDropdown(true);
    try {
      const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(location)}&limit=5&lang=en`);
      const data = await response.json();
      const predictions = data.features || [];
      setSearchResults(predictions);
      console.log('Predictions:', predictions);
    } catch (err) {
      setSearchResults([]);
      console.error('Error fetching predictions', err);
    }
    setIsSearching(false);
  };
  
  
  // Clear search results and dropdown if input is cleared or too short
  useEffect(() => {
    if (location.trim().length < 3) {
      setSearchResults([]);
      setShowDropdown(false);
    }
  }, [location]);

  // Hide dropdown on outside click
  useEffect(() => {
    if (!showDropdown) return;
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && !locationAreaRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  useEffect(() => {
    if (searchParams.get("login") === "true") {
      openLogIn();
    }
  }, [searchParams, openLogIn]);

  const handleLocationSubmit = () => {
    if (!location.trim()) return
    router.push(`/outages?location=${encodeURIComponent(location.trim())}`)
  }

  // Fetch user's current location
  const handleGetCurrentLocation = async () => {
    if (!navigator.geolocation) return
    setIsGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Use reverse geocoding here if needed, for now just set as 'Current Location'
        setLocation("Current Location")
        setIsGettingLocation(false)
      },
      (error) => {
        setIsGettingLocation(false)
        // Optionally show error message
      }
    )
  }

  // Show info message until user clicks outside the location input area
  useEffect(() => {
    if (!showInfoMessage) return;
    function handleClickOutside(event) {
      if (locationAreaRef.current && !locationAreaRef.current.contains(event.target)) {
        setShowInfoMessage(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showInfoMessage]);

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


              {/* Location Input (Refactored) */}
              <div ref={locationAreaRef} className="bg-white rounded-2xl p-4 shadow-lg border max-w-md mx-auto lg:mx-0 mb-6">
                <div className="flex items-center w-full" onFocus={() => setShowInfoMessage(true)} onClick={() => setShowInfoMessage(true)} tabIndex={-1}>
                  {/* Input group with icons */}
                  <div className="flex items-center flex-1 relative bg-white rounded-xl px-2 py-1">
                    {/* Location Button */}
                    <button
                      type="button"
                      onClick={async () => {
                        if (!navigator.geolocation) return;
                        setIsGettingLocation(true);
                        navigator.geolocation.getCurrentPosition(async (position) => {
                          const { latitude, longitude } = position.coords;
                          try {
                            // Use OpenStreetMap Nominatim reverse geocoding with English language
                            const response = await fetch(
                              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
                              { headers: { 'Accept-Language': 'en' } }
                            );
                            const data = await response.json();
                            // Try to get city, fallback to town/village/state
                            const city = data.address.city || data.address.town || data.address.village || data.address.state || '';
                            setLocation(city);
                            setSelectedFromDropdown(true); // Enable Check button after autofetch
                          } catch (err) {
                            setLocation('');
                            setSelectedFromDropdown(false);
                          }
                          setIsGettingLocation(false);
                        }, () => {
                          setIsGettingLocation(false);
                          setSelectedFromDropdown(false);
                        });
                      }}
                      disabled={isGettingLocation}
                      className="bg-white border-0 rounded-full p-1 flex items-center justify-center text-[#4F46E5] hover:bg-[#4F46E5]/10 focus:bg-[#4F46E5]/20 focus:ring-2 focus:ring-[#4F46E5] transition-all cursor-pointer disabled:opacity-50 mr-1"
                      aria-label="Get current location"
                      title="Click to get your current location"
                      style={{ minWidth: 40, minHeight: 40 }}
                    >
                      {isGettingLocation ? (
                        <svg className="w-7 h-7 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="#4F46E5" strokeWidth="4"></circle><path className="opacity-75" fill="#4F46E5" d="M4 12a8 8 0 018-8v8z"></path></svg>
                      ) : (
                        <MapPin className="w-7 h-7 text-[#4F46E5]" />
                      )}
                    </button>
                    {/* Input with search icon inside */}
                    <div className="relative w-full">
                      <Input
                        type="text"
                        placeholder="Enter your city"
                        className="border-0 focus:ring-0 text-base placeholder-gray-500 w-full bg-transparent pr-10"
                        value={location || ""}
                        onChange={(e) => {
                          setLocation(e.target.value || "");
                          setSelectedFromDropdown(false);
                        }}
                        onFocus={() => {
                          setShowInfoMessage(true);
                          setInputFocused(true);
                        }}
                        onBlur={() => setInputFocused(false)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            if (selectedFromDropdown) {
                              handleLocationSubmit();
                            } else if ((location || "").trim().length >= 3) {
                              handleLocationSearch();
                            }
                          }
                        }}
                      />
                      {/* Search Icon Button (inside input, right) */}
                      {(location || "").trim().length >= 3 && (
                        <button
                          type="button"
                          onClick={handleLocationSearch}
                          className="absolute top-1/2 right-2 -translate-y-1/2 bg-transparent border-0 rounded-full p-0 flex items-center justify-center text-[#4F46E5] hover:bg-[#4F46E5]/10 focus:bg-[#4F46E5]/20 focus:ring-2 focus:ring-[#4F46E5] transition-all cursor-pointer"
                          aria-label="Search location"
                          style={{ minWidth: 28, minHeight: 28, zIndex: 50, pointerEvents: 'auto' }}
                        >
                          {isSearching ? (
                            <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="#4F46E5" strokeWidth="4"></circle><path className="opacity-75" fill="#4F46E5" d="M4 12a8 8 0 018-8v8z"></path></svg>
                          ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                          )}
                        </button>
                      )}
                      {/* Dropdown for search results */}
                      {showDropdown && searchResults.length > 0 && (
                        <div
                          ref={dropdownRef}
                          className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-[100] max-h-60 overflow-y-auto w-full"
                          style={{
                            minWidth: '220px',
                            maxWidth: '480px',
                          }}
                        >
                          {searchResults.map((result, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                // Extract city name from Photon API response
                                const city = result.properties.city || result.properties.name || "";
                                setLocation(city);
                                setSelectedFromDropdown(true);
                                setShowDropdown(false);
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                            >
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {result.properties.name}
                                    {result.properties.city && result.properties.city !== result.properties.name && `, ${result.properties.city}`}
                                    {result.properties.country && `, ${result.properties.country}`}
                                  </p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      {/* All Google Places/Maps API code removed */}
                    </div>
                  </div>
                  {/* Check Button (always visible, outside input group) */}
                  <Button
                    type="button"
                    onClick={handleLocationSubmit}
                    className={`ml-3 px-6 py-2 rounded-xl text-white font-semibold transition-colors
                      bg-[#4F46E5] hover:bg-[#4F46E5]/90
                      disabled:bg-[#4F46E5] disabled:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                    disabled={!selectedFromDropdown}
                    style={{ pointerEvents: !selectedFromDropdown ? 'none' : undefined }}
                  >
                    Check
                  </Button>
                </div>
                {/* Info Message */}
                {showInfoMessage && (
                  <p className="text-[#4F46E5] text-sm mt-2 text-center">
                    Click the location icon for automatic fetching or enter at least 3 characters to search.
                  </p>
                )}
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
