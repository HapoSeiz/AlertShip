"use client"

import { useState } from "react"
import { Nunito } from "next/font/google"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { AuthModals } from "@/components/auth-modals"
import UserDashboard from "@/components/user-dashboard"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext";

const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nunito",
})

export default function DashboardPage() {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    signOut,
  } = useAuth();

  // Navigation handler for hyperlinks
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
      <Header currentPage="dashboard" />

      <div className="pt-24 sm:pt-28 lg:pt-32">
        <UserDashboard user={user} onLogout={signOut} />
      </div>

      {/* Footer */}
      <Footer />

      {/* Auth Modals - Available on Dashboard */}
      <AuthModals />
    </div>
  )
}
