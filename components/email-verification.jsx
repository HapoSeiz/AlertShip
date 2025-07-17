import { Button } from "@/components/ui/button";

export default function EmailVerification({
  email,
  resendTimer,
  resentSuccess,
  resentError,
  onResend,
  onClose,
  onGoToLogin,
  isLoading
}) {
  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1F2937] text-center w-full">Verify Your Account</h2>
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
          Check your email at <span className="font-semibold text-gray-700">{email}</span>
        </p>
      </div>
      <div className="space-y-3">
        {onGoToLogin && (
          <Button
            onClick={onGoToLogin}
            className="w-full h-12 bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white font-semibold text-lg"
            disabled={isLoading}
          >
            Go to Log In
          </Button>
        )}
        <Button
          onClick={onClose}
          variant="outline"
          className="w-full h-12 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-lg bg-transparent"
          disabled={isLoading}
        >
          Close
        </Button>
      </div>
      <div className="text-center mt-6">
        <p className="text-sm text-gray-600 mb-2">Didn't receive the email?</p>
        <button
          onClick={onResend}
          className="text-sm text-[#4F46E5] font-semibold hover:underline"
          disabled={isLoading || resendTimer > 0}
        >
          {resendTimer > 0 ? `Resend Email (${resendTimer}s)` : "Resend Email"}
        </button>
        {resentSuccess && <p className="text-green-600 text-sm mt-2">Verification email resent!</p>}
        {resentError && <p className="text-red-600 text-sm mt-2">{resentError}</p>}
      </div>
    </div>
  );
} 