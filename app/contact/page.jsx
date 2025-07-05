"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Footer from "@/components/footer"
import { AuthModals } from "@/components/auth-modals"
import { Nunito } from "next/font/google"
import { useState } from "react"
import Header from "@/components/header"
import { useRouter } from "next/navigation"
import { useAuthModals } from "@/hooks/useAuthModals";

const nunito = Nunito({ 
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nunito",
})

export default function ContactPage() {
  const router = useRouter();
  const {
    isLoggedIn,
    user,
    openLogIn,
    openSignUp,
    handleLogout,
    isSignUpOpen,
    isLogInOpen,
    closeSignUp,
    closeLogIn,
    switchToLogIn,
    switchToSignUp,
    handleLogin,
  } = useAuthModals();

  const handleNavigate = (page) => {
    if (page === "home") router.push("/")
    else if (page === "about") router.push("/about")
    else if (page === "contact") router.push("/contact")
    else if (page === "faqs") router.push("/faqs")
    else if (page === "dashboard") router.push("/dashboard")
    else if (page === "report") router.push("/report")
    else router.push("/")
  }

  return (
    <div className={`min-h-screen bg-[#F9FAFB] ${nunito.className}`}>
      {/* Header */}
      <Header
        currentPage="contact"
        isLoggedIn={isLoggedIn}
        onLoginOpen={openLogIn}
        onSignUpOpen={openSignUp}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
      />  

      <main className="px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-8 sm:pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1F2937] mb-6 ${nunito.className}`}>Contact <span className="text-[#4F46E5]">Us</span></h1>
            <p className="text-xl sm:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Have questions or need support? We're here to help. Reach out to us and we'll get back to you as soon as possible.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border">
              <h2 className="text-2xl font-bold text-[#1F2937] mb-6">Send us a message</h2>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-[#1F2937] mb-2">First Name <span className="text-red-500">*</span></label>
                    <Input id="firstName" name="firstName" placeholder="Enter your first name" className="h-12 border-2 border-gray-300 focus:border-[#4F46E5] focus:ring-0 outline-none" />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-[#1F2937] mb-2">Last Name <span className="text-red-500">*</span></label>
                    <Input id="lastName" name="lastName" placeholder="Enter your last name" className="h-12 border-2 border-gray-300 focus:border-[#4F46E5] focus:ring-0 outline-none" />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#1F2937] mb-2">Email Address <span className="text-red-500">*</span></label>
                  <Input id="email" name="email" type="email" placeholder="Enter your email address" className="h-12 border-2 border-gray-300 focus:border-[#4F46E5] focus:ring-0 outline-none" />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-[#1F2937] mb-2">Subject <span className="text-red-500">*</span></label>
                  <Input id="subject" name="subject" placeholder="What is this regarding?" className="h-12 border-2 border-gray-300 focus:border-[#4F46E5] focus:ring-0 outline-none" />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-[#1F2937] mb-2">Message <span className="text-red-500">*</span></label>
                  <Textarea id="message" name="message" placeholder="Tell us how we can help you..." className="min-h-[120px] border-2 border-gray-300 focus:border-[#4F46E5] focus:ring-0 outline-none" />
                </div>
                <Button type="submit" className="w-full bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white h-12 text-lg font-semibold">Send Message</Button>
              </form>
            </div>
            {/* Contact Information */}
            <div className="space-y-8">
              <div className="bg-white rounded-2xl p-8 shadow-sm border">
                <h2 className="text-2xl font-bold text-[#1F2937] mb-6">Get in touch</h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-[#4F46E5]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-[#4F46E5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#1F2937] mb-1">Email</h3>
                      <p className="text-gray-600">support@alertship.com</p>
                      <p className="text-gray-600">info@alertship.com</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-[#F59E0B]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#1F2937] mb-1">Phone</h3>
                      <p className="text-gray-600">+91 7828060298</p>
                      <p className="text-gray-600">+91 7722909474</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#1F2937] mb-1">Office</h3>
                      <p className="text-gray-600">2, Keshar Towers</p>
                      <p className="text-gray-600">Gwalior, MP 474002</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-sm border">
                <h3 className="text-xl font-bold text-[#1F2937] mb-4">Business Hours</h3>
                <div className="space-y-2 text-gray-600">
                  <div className="flex justify-between"><span>Monday - Friday</span><span>9:00 AM - 6:00 PM PST</span></div>
                  <div className="flex justify-between"><span>Saturday</span><span>10:00 AM - 4:00 PM PST</span></div>
                  <div className="flex justify-between"><span>Sunday</span><span>Closed</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer onNavigate={() => {}} />
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
