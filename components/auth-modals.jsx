"use client"

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Eye, EyeOff, Mail, Lock, User, Shield, AlertTriangle } from "lucide-react";
import { useAuthContext } from "@/components/AuthContext";

export default function AuthModals() {
  const {
    user,
    isLoggedIn,
    isLoading,
    errors,
    showSignUp,
    showLogIn,
    showVerifyEmail,
    pendingVerificationUser,
    resentSuccess,
    resentError,
    signUp,
    logIn,
    googleAuth,
    resendVerificationEmail,
    logOut,
    openSignUp,
    openLogIn,
    closeSignUp,
    closeLogIn,
    closeVerifyEmail,
  } = useAuthContext();

  // Local state for form fields and UI
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signUpData, setSignUpData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [logInData, setLogInData] = useState({
    email: "",
    password: "",
  });

  // Handlers for form changes
  const handleSignUpChange = (e) => {
    const { name, value } = e.target;
    setSignUpData((prev) => ({ ...prev, [name]: value }));
  };
  const handleLogInChange = (e) => {
    const { name, value } = e.target;
    setLogInData((prev) => ({ ...prev, [name]: value }));
  };

  // Form submit handlers
  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    await signUp(signUpData);
  };
  const handleLogInSubmit = async (e) => {
    e.preventDefault();
    await logIn(logInData);
  };

  // Google Auth
  const handleGoogleSignIn = async (isSignUp) => {
    await googleAuth();
  };

  // Modal close handlers
  const handleCloseSignUp = () => {
    closeSignUp();
    setSignUpData({ name: "", email: "", password: "", confirmPassword: "" });
    setShowConfirmPassword(false);
    setShowPassword(false);
  };
  const handleCloseLogIn = () => {
    closeLogIn();
    setLogInData({ email: "", password: "" });
    setShowPassword(false);
  };

  // Switch modals
  const handleSwitchToLogIn = () => {
    openLogIn();
    setSignUpData({ name: "", email: "", password: "", confirmPassword: "" });
    setShowConfirmPassword(false);
    setShowPassword(false);
  };
  const handleSwitchToSignUp = () => {
    openSignUp();
    setLogInData({ email: "", password: "" });
    setShowConfirmPassword(false);
    setShowPassword(false);
  };

  // If neither modal is open, don't render anything
  if (!showSignUp && !showLogIn && !showVerifyEmail) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <style jsx global>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto hide-scrollbar relative">
        {/* Sign Up Modal */}
        {showSignUp && (
          <div className="p-6 sm:p-8">
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
            <Button
              type="button"
              onClick={() => handleGoogleSignIn(true)}
              disabled={isLoading}
              className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 hover:border-gray-400 font-semibold mb-6 flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">{/* GoogleIcon */}</svg>
              )}
              {isLoading ? "Signing up..." : "Continue with Google"}
            </Button>
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or continue with email</span>
              </div>
            </div>
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
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
                  <p className={`text-sm mt-1 ${errors.email.includes("Disposable") ? "text-red-600 font-medium" : "text-red-500"}`}>
                    {errors.email}
                  </p>
                )}
              </div>
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
        {/* Log In Modal */}
        {showLogIn && (
          <div className="p-6 sm:p-8">
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
            <Button
              type="button"
              onClick={() => handleGoogleSignIn(false)}
              disabled={isLoading}
              className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 hover:border-gray-400 font-semibold mb-6 flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">{/* GoogleIcon */}</svg>
              )}
              {isLoading ? "Logging in..." : "Continue with Google"}
            </Button>
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or continue with email</span>
              </div>
            </div>
            <form onSubmit={handleLogInSubmit} className="space-y-4">
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
        {/* Email Verification Modal */}
        {showVerifyEmail && (
          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#1F2937] text-center">Verify Your Email</h2>
              <button onClick={closeVerifyEmail} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
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
            <div className="text-center mb-8">
              <p className="text-gray-600 text-lg leading-relaxed">
                We have sent a link to your email address. Click on it to verify your account and then log in.
              </p>
              <p className="text-sm text-gray-500 mt-3">
                Check your email at <span className="font-semibold text-gray-700">{pendingVerificationUser?.email}</span>
              </p>
            </div>
            <div className="space-y-3">
              <Button
                onClick={closeVerifyEmail}
                className="w-full h-12 bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white font-semibold text-lg"
              >
                Go to Log In
              </Button>
            </div>
            <div className="text-center mt-6">
              <p className="text-sm text-gray-600 mb-2">Didn't receive the email?</p>
              <button
                onClick={resendVerificationEmail}
                className="text-sm text-[#4F46E5] font-semibold hover:underline"
                disabled={!pendingVerificationUser}
              >
                Resend Email
              </button>
              {resentSuccess && <p className="text-green-600 text-sm mt-2">Verification email resent!</p>}
              {resentError && <p className="text-red-600 text-sm mt-2">{resentError}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}