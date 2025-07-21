import React from "react";

export default function SearchButton({
  isLoading = false,
  showClear = false,
  onClick,
  onClear,
  className = "",
  ...props
}) {
  return (
    <button
      type="button"
      onClick={showClear ? onClear : onClick}
      className={`bg-transparent border-0 rounded-full p-0 flex items-center justify-center text-[#4F46E5] hover:bg-[#4F46E5]/10 focus:bg-[#4F46E5]/20 focus:ring-2 focus:ring-[#4F46E5] transition-all cursor-pointer ${className}`}
      aria-label={showClear ? "Clear location" : "Search location"}
      style={{ minWidth: 28, minHeight: 28, zIndex: 50, pointerEvents: 'auto' }}
      {...props}
    >
      {isLoading ? (
        <svg
          className="w-7 h-7 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="#4F46E5"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="#4F46E5"
            d="M4 12a8 8 0 018-8v8z"
          ></path>
        </svg>
      ) : showClear ? (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="#4F46E5"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      ) : (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      )}
    </button>
  );
}
