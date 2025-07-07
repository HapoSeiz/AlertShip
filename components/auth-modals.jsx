"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Eye, EyeOff, Mail, Lock, User, AlertTriangle } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

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

export function AuthModals() {
  const {
    isSignUpOpen,
    isLogInOpen,
    showVerifyEmail,
    isLoading,
    errors,
    resendTimer,
    resentSuccess,
    resentError,
    handleSignUp,
    handleLogIn,
    handleGoogleAuth,
    handleResendVerificationEmail,
    closeSignUp,
    closeLogIn,
    switchToLogIn,
    switchToSignUp,
    handleForgotPassword,
    forgotPasswordSuccess,
    forgotPasswordError,
  } = useAuth();

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
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState("")
  const [forgotResendTimer, setForgotResendTimer] = useState(0)

  // Start resend timer after successful reset
  useEffect(() => {
    if (forgotPasswordSuccess) {
      setForgotResendTimer(60);
      const timer = setInterval(() => {
        setForgotResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [forgotPasswordSuccess]);

  // Reset forgot password state when modals open/close
  useEffect(() => {
    if (!isLogInOpen && !isSignUpOpen) {
      setShowForgotPassword(false);
      setForgotEmail("");
    }
    if (isLogInOpen) {
      setShowForgotPassword(false);
      setForgotEmail("");
    }
  }, [isLogInOpen, isSignUpOpen]);

  // Handle form input changes
  const handleSignUpChange = (e) => {
    setSignUpData({ ...signUpData, [e.target.name]: e.target.value })
  }

  const handleLogInChange = (e) => {
    setLogInData({ ...logInData, [e.target.name]: e.target.value })
  }

  // Handle form submissions
  const handleSignUpSubmit = async (e) => {
    e.preventDefault()
    await handleSignUp(signUpData, setIsTransitioning)
  }

  const handleLogInSubmit = async (e) => {
    e.preventDefault()
    await handleLogIn(logInData)
  }

  const handleGoogleSignIn = async (isSignUp) => {
    await handleGoogleAuth(isSignUp)
  }

  

  const handleCloseSignUp = () => {
    closeSignUp()
    setSignUpData({ name: "", email: "", password: "", confirmPassword: "" })
    setShowPassword(false)
    setShowConfirmPassword(false)
    setIsTransitioning(false)
  }

  const handleCloseLogIn = () => {
    closeLogIn()
    setLogInData({ email: "", password: "" })
    setShowPassword(false)
    setIsTransitioning(false)
  }

  const handleSwitchToLogIn = () => {
    switchToLogIn()
    setSignUpData({ name: "", email: "", password: "", confirmPassword: "" })
    setLogInData({ email: "", password: "" })
    setShowPassword(false)
    setShowConfirmPassword(false)
    setIsTransitioning(false)
  }

  const handleSwitchToSignUp = () => {
    switchToSignUp()
    setSignUpData({ name: "", email: "", password: "", confirmPassword: "" })
    setLogInData({ email: "", password: "" })
    setShowPassword(false)
    setShowConfirmPassword(false)
    setIsTransitioning(false)
  }

  // Ensure only one modal is open at a time
  useEffect(() => {
    if (isSignUpOpen && isLogInOpen) {
      closeLogIn()
    }
  }, [isSignUpOpen, isLogInOpen, closeLogIn])

  // If neither modal is open, don't render anything
  if (!isSignUpOpen && !isLogInOpen) return null

  // Add a handler for clicking the backdrop
  const handleBackdropClick = (e) => {
    // Only close if the click is directly on the backdrop (not inside the modal)
    if (e.target === e.currentTarget) {
      if (isSignUpOpen && !showVerifyEmail) {
        handleCloseSignUp();
      } else if (isLogInOpen) {
        handleCloseLogIn();
      } else if (isSignUpOpen && showVerifyEmail) {
        handleCloseSignUp();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={handleBackdropClick}>
      <style jsx global>{`
        .hide-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;  /* Chrome, Safari and Opera */
        }
        .slide-transition {
          transition: transform 0.5s ease-in-out;
        }
        .slide-out-left {
          transform: translateX(-100%);
        }
        .slide-in-right {
          transform: translateX(0);
        }  
      `}</style>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[92vh] overflow-y-auto hide-scrollbar relative" onClick={e => e.stopPropagation()}>
        {/* Sign Up Modal */}
        {isSignUpOpen && !showVerifyEmail && (
          <div className={`p-6 sm:p-8 slide-transition ${isTransitioning ? 'slide-out-left' : 'slide-in-right'}`}>
            {/* Header */}
            <div className="relative mb-6 h-10">
              <h2 className="absolute left-1/2 transform -translate-x-1/2 text-2xl sm:text-3xl font-bold text-[#1F2937]">Sign Up</h2>
              <button
                onClick={handleCloseSignUp}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition-colors"
                disabled={isLoading}
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Google Sign Up Button */}
            <Button
              type="button"
              onClick={() => handleGoogleSignIn(true)}
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
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
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
                    name="name"
                    placeholder="Enter your full name"
                    value={signUpData.name}
                    onChange={handleSignUpChange}
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
                    name="email"
                    placeholder="Enter your email"
                    value={signUpData.email}
                    onChange={handleSignUpChange}
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
                    name="password"
                    placeholder="Create a password"
                    value={signUpData.password}
                    onChange={handleSignUpChange}
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
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={signUpData.confirmPassword}
                    onChange={handleSignUpChange}
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

              {/* General Error */}
              {errors.general && <p className="text-red-500 text-sm mt-1">{errors.general}</p>}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white font-semibold text-lg mt-6 disabled:opacity-75"
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

        {/* Email Verification Modal */}
        {isSignUpOpen && showVerifyEmail && (
          <div className={`p-6 sm:p-8 slide-transition ${isTransitioning ? 'slide-out-left' : 'slide-in-right'}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#1F2937] text-center w-full">Verify Your Account</h2>
              {/* <button
                onClick={handleCloseSignUp}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                disabled={isLoading}
              >
                <X className="w-5 h-5 text-gray-500" />
              </button> */}
            </div>
            {/* Success Icon */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            {/* Message */}
            <div className="text-center mb-8">
              <p className="text-gray-600 text-lg leading-relaxed">
                We have sent a link to your email address. Click on it to verify your account and then log in.
              </p>
              <p className="text-sm text-gray-500 mt-3">
                Check your email at <span className="font-semibold text-gray-700">{signUpData.email}</span>
              </p>
            </div>
            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => {
                  handleCloseSignUp()
                  setTimeout(() => {
                    switchToLogIn()
                  }, 100)
                }}
                className="w-full h-12 bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white font-semibold text-lg"
                disabled={isLoading}
              >
                Go to Log In
              </Button>
              <Button
                onClick={handleCloseSignUp}
                variant="outline"
                className="w-full h-12 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-lg bg-transparent"
                disabled={isLoading}
              >
                Close
              </Button>
            </div>
            {/* Resend Email */}
            <div className="text-center mt-6">
              <p className="text-sm text-gray-600 mb-2">Didn't receive the email?</p>
              <button
                onClick={handleResendVerificationEmail}
                className="text-sm text-[#4F46E5] font-semibold hover:underline"
                disabled={isLoading || resendTimer > 0}
              >
                {resendTimer > 0 ? `Resend Email (${resendTimer}s)` : "Resend Email"}
              </button>
              {resentSuccess && <p className="text-green-600 text-sm mt-2">Verification email resent!</p>}
              {resentError && <p className="text-red-600 text-sm mt-2">{resentError}</p>}
            </div>
          </div>
        )}

        {/* LogIn Modal */}
        {isLogInOpen && !showForgotPassword && (
          <div className={`p-6 sm:p-8 slide-transition ${isTransitioning ? 'slide-out-left' : 'slide-in-right'}`}>
            {/* Header */}
            <div className="relative mb-6 h-10">
              <h2 className="absolute left-1/2 transform -translate-x-1/2 text-2xl sm:text-3xl font-bold text-[#1F2937]">Log In</h2>
              <button
                onClick={handleCloseLogIn}
                disabled={isLoading}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Google Log In Button */}
            <Button
              type="button"
              onClick={() => handleGoogleSignIn(false)}
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
            <form onSubmit={handleLogInSubmit} className="space-y-4">
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
                    name="email"
                    placeholder="Enter your email"
                    value={logInData.email}
                    onChange={handleLogInChange}
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
                    name="password"
                    placeholder="Enter your password"
                    value={logInData.password}
                    onChange={handleLogInChange}
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

              {/* General Error */}
              {errors.general && <p className="text-red-500 text-sm mt-1">{errors.general}</p>}

              {/* Forgot Password */}
              <div className="text-right">
                <button
                  type="button"
                  disabled={isLoading}
                  className="text-sm text-[#4F46E5] hover:underline disabled:opacity-50"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white font-semibold text-lg mt-6 disabled:opacity-75"
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
                {"Don't have an account? "}
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

        {/* Forgot Password Modal */}
        {isLogInOpen && showForgotPassword && (
          <div className="p-6 sm:p-8 slide-transition">
            <div className="relative mb-6 h-10">
              <h2 className="absolute left-1/2 transform -translate-x-1/2 text-2xl sm:text-3xl font-bold text-[#1F2937] text-center w-full">Reset Password</h2>
              <button
                onClick={handleCloseLogIn}
                disabled={isLoading}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await handleForgotPassword(forgotEmail);
              }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="forgot-email" className="block text-sm font-medium text-[#1F2937] mb-2 text-left">
                  Enter your email address
                </label>
                <Input
                  id="forgot-email"
                  type="email"
                  name="forgot-email"
                  placeholder="Enter your email"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  disabled={isLoading}
                  className="h-12 border-2 border-gray-300 focus:border-[#4F46E5] focus:ring-0 outline-none text-left placeholder:text-left"
                />
              </div>
              {forgotPasswordError && <p className="text-red-500 text-sm mt-1 text-center">{forgotPasswordError}</p>}
              {forgotPasswordSuccess && <p className="text-green-600 text-sm mt-1 text-center">{forgotPasswordSuccess}</p>}
              <div className="flex flex-col items-center">
                <Button
                  type="submit"
                  disabled={isLoading || !forgotEmail || forgotResendTimer > 0}
                  className={`w-full h-12 font-semibold text-lg mt-2 disabled:opacity-75 text-center
                    ${isLoading ? 'bg-[#312e81] text-white' : forgotResendTimer > 0 ? 'bg-[#a5b4fc] text-white' : 'bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white'}`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </div>
                  ) : forgotResendTimer > 0 ? (
                    `Resend Link (${forgotResendTimer}s)`
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </div>
            </form>
            <div className="text-center mt-6">
              <button
                onClick={() => setShowForgotPassword(false)}
                className="text-[#4F46E5] font-semibold hover:underline disabled:opacity-50"
                disabled={isLoading}
              >
                Back to Log In
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}