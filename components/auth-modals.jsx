"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Eye, EyeOff, Mail, Lock, User, Shield, AlertTriangle } from "lucide-react"
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { app } from '@/lib/firebase';

// Google Icon Component
const GoogleIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
)

// Disposable email domains list (common ones)
const disposableEmailDomains = [
  "10minutemail.com",
  "10minutemail.net",
  "20minutemail.com",
  "2prong.com",
  "guerrillamail.com",
  "guerrillamail.net",
  "guerrillamail.org",
  "guerrillamail.biz",
  "mailinator.com",
  "mailinator.net",
  "mailinator.org",
  "mailinator2.com",
  "tempmail.org",
  "temp-mail.org",
  "throwaway.email",
  "yopmail.com",
  "maildrop.cc",
  "sharklasers.com",
  "grr.la",
  "guerrillamailblock.com",
  "pokemail.net",
  "spam4.me",
  "bccto.me",
  "chacuo.net",
  "dispostable.com",
  "emailondeck.com",
  "fakeinbox.com",
  "hide.biz.st",
  "mytrashmail.com",
  "mailnesia.com",
  "trashmail.at",
  "trashmail.com",
  "trashmail.me",
  "trashmail.net",
  "trashmail.org",
  "wegwerfmail.de",
  "wegwerfmail.net",
  "wegwerfmail.org",
  "0-mail.com",
  "0815.ru",
  "10mail.org",
  "123-m.com",
  "1chuan.com",
  "1pad.de",
  "20email.eu",
  "2fdgdfgdfgdf.tk",
  "2prong.com",
  "30minutemail.com",
  "3d-painting.com",
  "4warding.com",
  "4warding.net",
  "4warding.org",
  "60minutemail.com",
  "675hosting.com",
  "675hosting.net",
  "675hosting.org",
  "6url.com",
  "75hosting.com",
  "75hosting.net",
  "75hosting.org",
  "7tags.com",
  "9ox.net",
  "a-bc.net",
  "afrobacon.com",
]

export function AuthModals({
  isSignUpOpen,
  isLogInOpen,
  onCloseSignUp,
  onCloseLogIn,
  onSwitchToLogIn,
  onSwitchToSignUp,
  onLogin,
}) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [signUpData, setSignUpData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [logInData, setLogInData] = useState({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showOtpVerification, setShowOtpVerification] = useState(false)
  const [otp, setOtp] = useState("")
  const [generatedOtp, setGeneratedOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)

  // Check if email is disposable
  const isDisposableEmail = (email) => {
    if (!email || !email.includes("@")) return false
    const domain = email.split("@")[1]?.toLowerCase()
    return disposableEmailDomains.includes(domain)
  }

  // Generate random 6-digit OTP
  const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  // Send OTP (simulated)
  const sendOtp = async (email) => {
    const newOtp = generateOtp()
    setGeneratedOtp(newOtp)

    // Simulate sending email
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // In real implementation, you would send email here
    console.log(`OTP sent to ${email}: ${newOtp}`)
    alert(`OTP sent to your email! (For demo: ${newOtp})`)

    setOtpSent(true)
    startResendTimer()
  }

  // Start resend timer
  const startResendTimer = () => {
    setResendTimer(60)
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const validateSignUp = () => {
    const newErrors = {}

    if (!signUpData.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!signUpData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(signUpData.email)) {
      newErrors.email = "Email is invalid"
    } else if (isDisposableEmail(signUpData.email)) {
      newErrors.email = "Disposable emails are not allowed. Please use a permanent email address."
    }

    if (!signUpData.password) {
      newErrors.password = "Password is required"
    } else if (signUpData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (signUpData.password !== signUpData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateLogIn = () => {
    const newErrors = {}

    if (!logInData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(logInData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!logInData.password) {
      newErrors.password = "Password is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateOtp = () => {
    if (!otp.trim()) {
      setErrors({ otp: "OTP is required" })
      return false
    }
    if (otp.length !== 6) {
      setErrors({ otp: "OTP must be 6 digits" })
      return false
    }
    if (otp !== generatedOtp) {
      setErrors({ otp: "Invalid OTP. Please try again." })
      return false
    }
    setErrors({})
    return true
  }

  const handleGoogleAuth = async (isSignUp = false) => {
    setIsLoading(true)
    try {
      const auth = getAuth(app)
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const idToken = await result.user.getIdToken()
      // Send the ID token to your backend
      const res = await fetch('/api/auth-google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })
      const data = await res.json()
      if (data.success) {
        onLogin({ email: result.user.email, id: result.user.uid, name: result.user.displayName })
        resetForms()
        alert('Google signup successful!')
      } else {
        alert(data.error || 'Google signup failed')
      }
    } catch (error) {
      alert('Google signup failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    if (validateSignUp()) {
      setIsLoading(true)
      try {
        // Call backend to create user
        const res = await fetch('/api/auth-signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: signUpData.email,
            password: signUpData.password,
          }),
        })
        const data = await res.json()
        if (data.success) {
          onLogin({ email: signUpData.email, id: data.user.uid, name: signUpData.name })
          resetForms()
          alert('Signup successful!')
        } else {
          alert(data.error || 'Signup failed')
        }
      } catch (error) {
        alert('Signup failed')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleOtpVerification = async (e) => {
    e.preventDefault()
    if (validateOtp()) {
      setIsLoading(true)
      try {
        // Simulate account creation
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const userData = {
          name: signUpData.name,
          email: signUpData.email,
          id: "user_" + Date.now(),
        }

        onLogin(userData)
        resetForms()
      } catch (error) {
        alert("Account creation failed. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleResendOtp = async () => {
    if (resendTimer > 0) return

    setIsLoading(true)
    try {
      await sendOtp(signUpData.email)
    } catch (error) {
      alert("Failed to resend OTP. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogIn = async (e) => {
    e.preventDefault()
    if (validateLogIn()) {
      setIsLoading(true)
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const userData = {
          name: "John Doe",
          email: logInData.email,
          id: "user_" + Date.now(),
        }

        onLogin(userData)
        resetForms()
      } catch (error) {
        alert("Login failed. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
  }

  const resetForms = () => {
    setSignUpData({ name: "", email: "", password: "", confirmPassword: "" })
    setLogInData({ email: "", password: "" })
    setErrors({})
    setShowPassword(false)
    setShowConfirmPassword(false)
    setIsLoading(false)
    setShowOtpVerification(false)
    setOtp("")
    setGeneratedOtp("")
    setOtpSent(false)
    setResendTimer(0)
  }

  const handleCloseSignUp = () => {
    onCloseSignUp()
    resetForms()
  }

  const handleCloseLogIn = () => {
    onCloseLogIn()
    resetForms()
  }

  const handleSwitchToLogIn = () => {
    onSwitchToLogIn()
    resetForms()
  }

  const handleSwitchToSignUp = () => {
    onSwitchToSignUp()
    resetForms()
  }

  const handleBackToSignUp = () => {
    setShowOtpVerification(false)
    setOtp("")
    setGeneratedOtp("")
    setOtpSent(false)
    setResendTimer(0)
    setErrors({})
  }

  // If neither modal is open, don't render anything
  if (!isSignUpOpen && !isLogInOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <style jsx global>{`
        .hide-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;  /* Chrome, Safari and Opera */
        }
      `}</style>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto hide-scrollbar">
        {/* Sign Up Modal */}
        {isSignUpOpen && !showOtpVerification && (
          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#1F2937]">Sign Up</h2>
              <button
                onClick={handleCloseSignUp}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                disabled={isLoading}
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Google Sign Up Button */}
            <Button
              type="button"
              onClick={() => handleGoogleAuth(true)}
              disabled={isLoading}
              className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 hover:border-gray-400 font-semibold mb-6 flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              {isLoading ? "Signing up..." : "Continue with Google"}
            </Button>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or continue with email</span>
              </div>
            </div>

            {/* Sign Up Form */}
            <form onSubmit={handleSignUp} className="space-y-4">
              {/* Name Field */}
              <div>
                <label htmlFor="signup-name" className="block text-sm font-medium text-[#1F2937] mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={signUpData.name}
                    onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                    disabled={isLoading}
                    className={`pl-10 h-12 border-2 ${errors.name ? "border-red-500" : "border-gray-300"} focus:border-[#4F46E5] focus:ring-0 outline-none`}
                  />
                </div>
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="signup-email" className="block text-sm font-medium text-[#1F2937] mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={signUpData.email}
                    onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                    disabled={isLoading}
                    className={`pl-10 h-12 border-2 ${errors.email ? "border-red-500" : "border-gray-300"} focus:border-[#4F46E5] focus:ring-0 outline-none`}
                  />
                  {errors.email && errors.email.includes("Disposable") && (
                    <AlertTriangle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 w-5 h-5" />
                  )}
                </div>
                {errors.email && (
                  <p
                    className={`text-sm mt-1 ${errors.email.includes("Disposable") ? "text-red-600 font-medium" : "text-red-500"}`}
                  >
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="signup-password" className="block text-sm font-medium text-[#1F2937] mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={signUpData.password}
                    onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                    disabled={isLoading}
                    className={`pl-10 pr-10 h-12 border-2 ${errors.password ? "border-red-500" : "border-gray-300"} focus:border-[#4F46E5] focus:ring-0 outline-none`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="signup-confirm-password" className="block text-sm font-medium text-[#1F2937] mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="signup-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={signUpData.confirmPassword}
                    onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                    disabled={isLoading}
                    className={`pl-10 pr-10 h-12 border-2 ${errors.confirmPassword ? "border-red-500" : "border-gray-300"} focus:border-[#4F46E5] focus:ring-0 outline-none`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white font-semibold text-lg mt-6 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing up...
                  </div>
                ) : (
                  "Continue"
                )}
              </Button>
            </form>

            {/* Switch to Log In */}
            <div className="text-center mt-6">
              <p className="text-gray-600">
                Already have an account?{" "}
                <button
                  onClick={handleSwitchToLogIn}
                  disabled={isLoading}
                  className="text-[#4F46E5] font-semibold hover:underline disabled:opacity-50"
                >
                  Log In
                </button>
              </p>
            </div>
          </div>
        )}

        {/* OTP Verification Modal */}
        {isSignUpOpen && showOtpVerification && (
          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#1F2937]">Verify Email</h2>
              <button
                onClick={handleCloseSignUp}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                disabled={isLoading}
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-800">
                    We've sent a 6-digit verification code to <span className="font-semibold">{signUpData.email}</span>
                  </p>
                  <p className="text-xs text-blue-600 mt-1">Please check your inbox and enter the code below.</p>
                </div>
              </div>
            </div>

            {/* OTP Form */}
            <form onSubmit={handleOtpVerification} className="space-y-4">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-[#1F2937] mb-2">
                  Verification Code
                </label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  disabled={isLoading}
                  className={`h-12 text-center text-lg tracking-widest border-2 ${errors.otp ? "border-red-500" : "border-gray-300"} focus:border-[#4F46E5] focus:ring-0 outline-none`}
                  maxLength={6}
                />
                {errors.otp && <p className="text-red-500 text-sm mt-1">{errors.otp}</p>}
              </div>

              {/* Resend OTP */}
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isLoading || resendTimer > 0}
                  className="text-sm text-[#4F46E5] font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
                </button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full h-12 bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white font-semibold text-lg mt-6 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Verifying...
                  </div>
                ) : (
                  "Verify & Create Account"
                )}
              </Button>
            </form>

            {/* Back Button */}
            <div className="text-center mt-6">
              <button
                onClick={handleBackToSignUp}
                disabled={isLoading}
                className="text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
              >
                ← Back to Sign Up
              </button>
            </div>
          </div>
        )}

        {/* Log In Modal */}
        {isLogInOpen && (
          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#1F2937]">Log In</h2>
              <button
                onClick={handleCloseLogIn}
                disabled={isLoading}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Google Log In Button */}
            <Button
              type="button"
              onClick={() => handleGoogleAuth(false)}
              disabled={isLoading}
              className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 hover:border-gray-400 font-semibold mb-6 flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              {isLoading ? "Logging in..." : "Continue with Google"}
            </Button>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or continue with email</span>
              </div>
            </div>

            {/* Log In Form */}
            <form onSubmit={handleLogIn} className="space-y-4">
              {/* Email Field */}
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-[#1F2937] mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="Enter your email"
                    value={logInData.email}
                    onChange={(e) => setLogInData({ ...logInData, email: e.target.value })}
                    disabled={isLoading}
                    className={`pl-10 h-12 border-2 ${errors.email ? "border-red-500" : "border-gray-300"} focus:border-[#4F46E5] focus:ring-0 outline-none`}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-[#1F2937] mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={logInData.password}
                    onChange={(e) => setLogInData({ ...logInData, password: e.target.value })}
                    disabled={isLoading}
                    className={`pl-10 pr-10 h-12 border-2 ${errors.password ? "border-red-500" : "border-gray-300"} focus:border-[#4F46E5] focus:ring-0 outline-none`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <button
                  type="button"
                  disabled={isLoading}
                  className="text-sm text-[#4F46E5] hover:underline disabled:opacity-50"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white font-semibold text-lg mt-6 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Logging in...
                  </div>
                ) : (
                  "Log In"
                )}
              </Button>
            </form>

            {/* Switch to Sign Up */}
            <div className="text-center mt-6">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <button
                  onClick={handleSwitchToSignUp}
                  disabled={isLoading}
                  className="text-[#4F46E5] font-semibold hover:underline disabled:opacity-50"
                >
                  Sign Up
                </button>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
