import React from "react";
import { Button } from "@/components/ui/button";

export default function SuccessMessage({ onBackHome, onReportAnother }) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-[#1F2937] mb-4">Report Submitted Successfully!</h2>
      <p className="text-gray-600 mb-6">
        Thank you for reporting the issue. You will receive updates on the status of your report.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={onBackHome}
          className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white"
        >
          Back to Home
        </Button>
        <Button
          onClick={onReportAnother}
          variant="outline"
          className="border-[#1F2937] text-[#1F2937] hover:bg-[#1F2937] hover:text-white"
        >
          Report Another Issue
        </Button>
      </div>
    </div>
  );
}
