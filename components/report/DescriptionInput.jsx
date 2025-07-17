import React from "react";
import { Textarea } from "@/components/ui/textarea";
import clsx from "clsx";

export default function DescriptionInput({ value, onChange, error }) {
  return (
    <div>
      <label htmlFor="description" className="block text-sm font-medium text-[#1F2937] mb-2">
        Description <span className="text-red-500">*</span>
      </label>
      <Textarea
        id="description"
        name="description"
        placeholder="Please describe the issue in detail"
        value={value}
        onChange={onChange}
        className={clsx(
          "min-h-[120px] border-2 focus:border-[#4F46E5] focus:ring-0 outline-none",
          error ? "border-red-500 bg-red-50" : "border-gray-300"
        )}
      />
      {error && (
        <p className="text-red-500 text-sm mt-1 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
