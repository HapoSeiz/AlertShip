"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Nunito } from "next/font/google";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nunito",
});

export default function Header({ currentPage = "home" }) {
  const { isAuthenticated, signOut, openLogIn, openSignUp } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Scroll effect for header styling
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.min((scrollTop / Math.max(docHeight, 1)) * 100, 100);

      setScrolled(scrollTop > 10);
      setScrollProgress(scrollPercent);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavigation = (page, scrollTo = null) => {
    if (page === "home") {
      router.push("/");
    } else if (page === "about") {
      router.push("/about");
    } else if (page === "report") {
      router.push("/report");
    } else if (page === "contact") {
      router.push("/contact");
    } else if (page === "faqs") {
      router.push("/faqs");
    } else if (page === "dashboard") {
      router.push("/dashboard");
    }
    
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 px-4 sm:px-6 lg:px-8 py-4 transition-all duration-500 ease-out ${
        scrolled ? "backdrop-blur-md bg-white/80" : "bg-transparent"
      } ${nunito.className}`}
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
            onClick={() => handleNavigation("home")}
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
              e.preventDefault();
              handleNavigation("home");
            }}
            className={`text-sm lg:text-base transition-colors ${
              currentPage === "home" ? "text-[#4F46E5] font-semibold" : "text-[#1F2937] hover:text-[#4F46E5]"
            }`}
          >
            Home
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleNavigation("about");
            }}
            className={`text-sm lg:text-base transition-colors ${
              currentPage === "about" ? "text-[#4F46E5] font-semibold" : "text-[#1F2937] hover:text-[#4F46E5]"
            }`}
          >
            About
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (!isAuthenticated) {
                sessionStorage.setItem("postLoginAction", "report");
                openLogIn();
              } else {
                handleNavigation("report");
              }
            }}
            className={`text-sm lg:text-base transition-colors ${
              currentPage === "report" ? "text-[#4F46E5] font-semibold" : "text-[#1F2937] hover:text-[#4F46E5]"
            }`}
          >
            Report Outage
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleNavigation("contact");
            }}
            className={`text-sm lg:text-base transition-colors ${
              currentPage === "contact" ? "text-[#4F46E5] font-semibold" : "text-[#1F2937] hover:text-[#4F46E5]"
            }`}
          >
            Contact Us
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleNavigation("faqs");
            }}
            className={`text-sm lg:text-base transition-colors ${
              currentPage === "faqs" ? "text-[#4F46E5] font-semibold" : "text-[#1F2937] hover:text-[#4F46E5]"
            }`}
          >
            FAQs
          </a>
        </nav>

                {/* Auth Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {isAuthenticated ? (
            <>
              {currentPage !== "dashboard" && (
                <Button
                  onClick={() => handleNavigation("dashboard")}
                  variant="ghost"
                  className="text-[#1F2937] hover:bg-gray-100"
                >
                  Dashboard
                </Button>
              )}
              <Button
                onClick={signOut}
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
  );
}