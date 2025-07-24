import React from "react";
import { Button } from "@/components/ui/button";
import { MapPin, X } from "lucide-react";

export default function DeleteLocationModal({
  open,
  location,
  onCancel,
  onConfirm
}) {
  if (!open || !location) return null;

  // Handler to close modal if clicking on backdrop
  const handleBackdropClick = (e) => {
    // Only close if the click is directly on the backdrop, not inside the modal
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#1F2937]">Delete Location</h2>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div>
                <h3 className="font-medium text-red-800 mb-1">Are you sure?</h3>
                <p className="text-sm text-red-700">
                  You are about to delete the location "{location.name}". This action cannot be undone.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-[#4F46E5]" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{location.name}</h4>
                <p className="text-sm text-gray-600">{location.address}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Location
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
