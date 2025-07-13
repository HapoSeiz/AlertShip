"use client"

import { useState, useEffect } from "react"
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
    loading,
    openLogIn,
    signOut,
  } = useAuth();

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
