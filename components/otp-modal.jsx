import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function OtpModal({
  isOpen,
  phone,
  otp,
  resendTimer,
  onResend,
  onVerify,
  onClose,
  onChange,
  error,
  isLoading
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#1F2937]">Verify Phone Number</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors" disabled={isLoading}>
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="mb-4">
            <p className="text-gray-600">Enter the 6-digit code sent to <span className="font-semibold">{phone}</span></p>
          </div>
          <div className="mb-4">
            <input
              type="text"
              value={otp}
              onChange={onChange}
              maxLength={6}
              className="h-12 text-center text-lg tracking-widest border-2 w-full mb-2"
              placeholder="------"
              disabled={isLoading}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
            <button
              type="button"
              onClick={onResend}
              disabled={isLoading || resendTimer > 0}
              className="text-sm text-[#4F46E5] font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
            </button>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-gray-300"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={onVerify}
              className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white"
              disabled={isLoading || otp.length !== 6}
            >
              Verify
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 