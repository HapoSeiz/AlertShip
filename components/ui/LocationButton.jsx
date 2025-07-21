import React from "react";
import { MapPin } from "lucide-react";

export default function LocationButton({
  isLoading = false,
  onClick,
  className = "",
  ...props
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className={`bg-white border-0 rounded-full p-1 flex items-center justify-center text-[#4F46E5] hover:bg-[#4F46E5]/10 focus:bg-[#4F46E5]/20 focus:ring-2 focus:ring-[#4F46E5] transition-all cursor-pointer disabled:opacity-50 ${className}`}
      aria-label="Get current location"
      title="Click to get your current location"
      style={{ minWidth: 40, minHeight: 40 }}
      {...props}
    >
      {isLoading ? (
        <svg className="w-7 h-7 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="#4F46E5" strokeWidth="4"></circle><path className="opacity-75" fill="#4F46E5" d="M4 12a8 8 0 018-8v8z"></path></svg>
      ) : (
        <MapPin className="w-7 h-7 text-[#4F46E5]" />
      )}
    </button>
  );
}
