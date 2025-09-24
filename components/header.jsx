"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Nunito } from "next/font/google";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Menu, X, Home, Info, AlertTriangle, Mail, HelpCircle, User, LogOut } from "lucide-react";
import { useMobileMenu } from "@/contexts/MobileMenuContext";
import LanguageSelector from "@/components/language-selector";
import { useTranslations } from 'next-intl';

const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nunito",
});

export default function Header({ currentPage = "home" }) {
  const t = useTranslations('navigation');
  const { isAuthenticated, signOut, openLogIn, openSignUp } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { isMenuOpen: mobileMenuOpen, setMenuOpen: setMobileMenuOpen, isMenuClosing, setMenuClosing: setIsMenuClosing } = useMobileMenu();
  // Drag-to-close state
  const [dragStartY, setDragStartY] = useState(null);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

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

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        handleMenuCloseWithAnimation();
      }
    };

    if (mobileMenuOpen && !isMenuClosing) {
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen, isMenuClosing]);

  // Helper to close menu with animation
  const handleMenuCloseWithAnimation = () => {
    setIsMenuClosing(true);
    setTimeout(() => {
      setMobileMenuOpen(false);
      setIsMenuClosing(false);
      setDragY(0);
    }, 300); // match transition duration
  };

  const handleNavigation = (page, scrollTo = null) => {
    // Close mobile menu with animation when navigating
    if (mobileMenuOpen) {
      handleMenuCloseWithAnimation();
    }
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

  // Drag handlers for mobile menu
  const handleDragStart = (e) => {
    setIsDragging(true);
    setDragStartY(e.touches ? e.touches[0].clientY : e.clientY);
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    const currentY = e.touches ? e.touches[0].clientY : e.clientY;
    const deltaY = currentY - dragStartY;
    setDragY(deltaY > 0 ? deltaY : 0);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    if (dragY > 80) {
      handleMenuCloseWithAnimation();
    }
    setTimeout(() => setDragY(0), 200); // allow transition to finish
  };

  return (
    <>
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

          {/* Desktop Navigation */}
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
              {t('home')}
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
              {t('about')}
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
              {t('reportOutage')}
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
              {t('contact')}
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
              {t('faqs')}
            </a>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-2 sm:space-x-3">
            <LanguageSelector />
            {isAuthenticated ? (
              <>
                {currentPage !== "dashboard" && (
                  <Button
                    onClick={() => handleNavigation("dashboard")}
                    variant="ghost"
                    className="text-[#1F2937] hover:bg-gray-100"
                  >
                    {t('dashboard')}
                  </Button>
                )}
                <Button
                  onClick={signOut}
                  variant="outline"
                  className="border-[#1F2937] text-[#1F2937] hover:bg-[#1F2937] hover:text-white text-sm px-3 py-2 sm:px-4 sm:py-2"
                >
                  {t('logout')}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={openSignUp}
                  className="border-[#1F2937] text-[#1F2937] hover:bg-[#1F2937] hover:text-white text-sm px-3 py-2 sm:px-4 sm:py-2"
                >
                  {t('signup')}
                </Button>
                <Button
                  onClick={openLogIn}
                  className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white text-sm px-3 py-2 sm:px-4 sm:py-2"
                >
                  {t('login')}
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-[#1F2937] focus:outline-none"
            aria-label="Toggle mobile menu"
            style={{ background: 'transparent' }}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {(mobileMenuOpen || isMenuClosing) && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 md:hidden bg-white/20 backdrop-blur-sm backdrop-saturate-125 transition-all duration-300 select-none"
            onClick={handleMenuCloseWithAnimation}
          />
          
          {/* Mobile Menu Panel - Sliding from bottom */}
          <div 
            className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl border-t-4 border-[#4F46E5] z-50 md:hidden transform transition-transform duration-300 ease-out
              ${ (mobileMenuOpen && !isMenuClosing) ? '' : 'translate-y-full' } ${nunito.className}`}
            style={{
              maxHeight: '80vh',
              touchAction: 'none',
              transform: `translateY(${(mobileMenuOpen && !isMenuClosing) ? dragY : window.innerHeight}px)`,
              transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
            }}
            onTouchMove={isDragging ? handleDragMove : undefined}
            onTouchEnd={isDragging ? handleDragEnd : undefined}
            onMouseMove={isDragging ? handleDragMove : undefined}
            onMouseUp={isDragging ? handleDragEnd : undefined}
          >
            <div className="p-6 select-none">
              {/* Handle bar */}
              <div
                className="w-12 h-1.5 bg-[#4F46E5] rounded-full mx-auto mb-6 cursor-pointer active:bg-[#3730A3]"
                style={{ touchAction: 'none' }}
                onTouchStart={handleDragStart}
                onMouseDown={handleDragStart}
              ></div>
              
              {/* Navigation Links */}
              <div className="space-y-1 mb-8">
                <button
                  onClick={() => handleNavigation("home")}
                  className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-colors ${
                    currentPage === "home" ? "bg-[#4F46E5]/10 text-[#4F46E5]" : "text-[#1F2937] hover:bg-gray-50"
                  }`}
                >
                  <Home className="w-5 h-5 mr-3" />
                  <span className="font-medium">Home</span>
                </button>
                
                <button
                  onClick={() => handleNavigation("about")}
                  className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-colors ${
                    currentPage === "about" ? "bg-[#4F46E5]/10 text-[#4F46E5]" : "text-[#1F2937] hover:bg-gray-50"
                  }`}
                >
                  <Info className="w-5 h-5 mr-3" />
                  <span className="font-medium">About Us</span>
                </button>
                
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      sessionStorage.setItem("postLoginAction", "report");
                      setMobileMenuOpen(false);
                      openLogIn();
                    } else {
                      handleNavigation("report");
                    }
                  }}
                  className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-colors ${
                    currentPage === "report" ? "bg-[#4F46E5]/10 text-[#4F46E5]" : "text-[#1F2937] hover:bg-gray-50"
                  }`}
                >
                  <AlertTriangle className="w-5 h-5 mr-3" />
                  <span className="font-medium">Report Outage</span>
                </button>
                
                <button
                  onClick={() => handleNavigation("contact")}
                  className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-colors ${
                    currentPage === "contact" ? "bg-[#4F46E5]/10 text-[#4F46E5]" : "text-[#1F2937] hover:bg-gray-50"
                  }`}
                >
                  <Mail className="w-5 h-5 mr-3" />
                  <span className="font-medium">Contact Us</span>
                </button>
                
                <button
                  onClick={() => handleNavigation("faqs")}
                  className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-colors ${
                    currentPage === "faqs" ? "bg-[#4F46E5]/10 text-[#4F46E5]" : "text-[#1F2937] hover:bg-gray-50"
                  }`}
                >
                  <HelpCircle className="w-5 h-5 mr-3" />
                  <span className="font-medium">FAQs</span>
                </button>

                {/* Removed duplicate Dashboard button (top) to avoid redundancy */}
              </div>

              {/* Auth Actions */}
              <div className="border-t border-gray-100 pt-1">
                {isAuthenticated ? (
                  <div className="flex flex-row gap-3">
                    {currentPage !== "dashboard" && (
                      <Button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          handleNavigation("dashboard");
                        }}
                        variant="outline"
                        className="flex-1 border-[#1F2937] text-[#1F2937] hover:bg-[#1F2937] hover:text-white py-3"
                      >
                        Dashboard
                      </Button>
                    )}
                    <Button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        signOut();
                      }}
                      className="flex-1 bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white py-3"
                    >
                      Log Out
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-row gap-3">
                    <Button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        openSignUp();
                      }}
                      variant="outline"
                      className="flex-1 border-[#1F2937] text-[#1F2937] hover:bg-[#1F2937] hover:text-white py-3"
                    >
                      Sign Up
                    </Button>
                    <Button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        openLogIn();
                      }}
                      className="flex-1 bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white py-3"
                    >
                      Log In
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}