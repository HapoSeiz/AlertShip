"use client"

import { useState, useEffect, useRef } from "react"
import { MapPin } from "lucide-react"
import LocationDropdown from "@/components/LocationDropdown";
import LocationButton from "@/components/ui/LocationButton"
import SearchButton from "@/components/ui/SearchButton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Nunito } from "next/font/google"
import LatestUpdates from "@/components/homePage/latest-updates"
import HowItWorks from "@/components/homePage/how-it-works"
import Benefits from "@/components/homePage/benefits"
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
  const locationInputRef = useRef(null);
  const dropdownRef = useRef(null)
  const [selectedFromDropdown, setSelectedFromDropdown] = useState(false)
  // All Google Places/Maps API code removed
  const { isAuthenticated, openSignUp, openLogIn } = useAuth()
  
  // Track input focus for button color feedback
  const [inputFocused, setInputFocused] = useState(false);
  
  // Location search using Photon API (via Next.js proxy)
  const handleLocationSearch = async () => {
    if (location.trim().length < 3) {
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setShowDropdown(true);

    try {
      const apiUrl = `/api/photon?q=${encodeURIComponent(location)}`;

      const response = await fetch(apiUrl);
      if (!response.ok) {
        const errorDetails = `Photon proxy error: ${response.status} ${response.statusText}`;  
        throw new Error(errorDetails);  
      }
      const data = await response.json();
      const predictions = data.features || [];

      setSearchResults(predictions);
    } catch (err) {
      setSearchResults([]);
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

  // Hide dropdown on outside click (mobile-friendly, debounce, ignore search button)
  useEffect(() => {
    if (!showDropdown) return;
    let touchTimeout = null;
    function handleClickOutside(event) {
      // Ignore clicks/touches on the search button or inside the input group
      const isSearchBtn = event.target.closest('button[aria-label="Search location"]');
      const isInputGroup = event.target.closest('.location-input-group');
      if (isSearchBtn || isInputGroup) return;
      setShowDropdown(false);
    }
    function handleTouchStart(event) {
      if (touchTimeout) clearTimeout(touchTimeout);
      touchTimeout = setTimeout(() => {
        handleClickOutside(event);
      }, 100);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleTouchStart);
    // Scroll dropdown into view when it opens (for mobile/keyboard)
    if (dropdownRef.current) {
      setTimeout(() => {
        try {
          dropdownRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } catch (e) {
          console.error("Error scrolling dropdown into view:", e);  
        }
      }, 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleTouchStart);
      if (touchTimeout) clearTimeout(touchTimeout);
    };
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

  // No longer need to force overflow: visible on ancestors with new dropdown structure

  return (
    <div className={`min-h-screen bg-[#F9FAFB] ${nunito.className}`} style={{ overflow: 'visible' }}>
      {/* Header */}
      <Header currentPage="home" />

      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-8 sm:pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="text-center lg:text-left" style={{ overflow: 'visible' }}>
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
                <div className="flex items-center w-full gap-2" onFocus={() => setShowInfoMessage(true)} onClick={() => setShowInfoMessage(true)} tabIndex={-1}>
                  {/* Location Button */}
                  <LocationButton
                    isLoading={isGettingLocation}
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
                  />
                  {/* Input and dropdown in a relative container, only input and dropdown inside */}
                  <div className="relative flex-1 location-input-group">
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
                      <SearchButton
                        isLoading={isSearching}
                        onClick={handleLocationSearch}
                        className="absolute top-1/2 right-2 -translate-y-1/2"
                      />
                    )}
  {/* Reusable LocationDropdown for Photon API */}
  <LocationDropdown
    results={searchResults.map((result, idx) => ({
      // Map Photon fields to expected fields for dropdown
      key: result.properties.osm_id || idx,
      mainText: result.properties.name,
      secondaryText: [
        result.properties.city,
        result.properties.state,
        result.properties.country
      ].filter(Boolean).join(", "),
      raw: result // keep original for onSelect
    }))}
    show={showDropdown && searchResults.length > 0}
    onSelect={(item) => {
      // item.raw is the original photon result
      const city = item.raw.properties.city || item.raw.properties.name || "";
      setLocation(city);
      setSelectedFromDropdown(true);
      setShowDropdown(false);
    }}
    inputRef={locationInputRef}
  />
                  </div>
                  {/* Check Button (always visible, outside input group) */}
                  <Button
                    type="button"
                    onClick={handleLocationSubmit}
                    className={`px-6 py-2 rounded-xl text-white font-semibold transition-colors
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
              {isAuthenticated ? (
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button
                    onClick={() => router.push('/dashboard')}
                    className="bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-white px-8 py-3 text-lg font-semibold h-auto"
                  >
                    Go to Dashboard
                  </Button>
                </div>
              ) : (
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
