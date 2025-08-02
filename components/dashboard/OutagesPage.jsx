import React from "react";
import { Button } from "@/components/ui/button";
import { MapPin, AlertTriangle, X } from "lucide-react";
import { useDashboardContext } from "@/contexts/DashboardContext";

/**
 * OutagesPage component - Handles the full-screen outages view
 */
const OutagesPage = () => {
  const {
    savedLocations,
    setShowOutagesPage,
    showOutageDetailsModal,
    selectedOutageDetails,
    setShowOutageDetailsModal,
    handleViewOutageDetails,
  } = useDashboardContext();

  const onBack = () => setShowOutagesPage(false);
  const onCloseOutageDetailsModal = () => setShowOutageDetailsModal(false);

  return (
    <div className="bg-[#F9FAFB] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2937]">Current Outages</h1>
              <p className="text-gray-600 mt-1">View active outages in your saved locations</p>
            </div>
            <Button
              onClick={onBack}
              variant="outline"
              className="border-[#1F2937] text-[#1F2937] hover:bg-[#1F2937] hover:text-white flex items-center"
            >
              ← Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Outages Content */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="p-6">
            <div className="space-y-6">
              {/* Locations with Outages */}
              {savedLocations.map((location) => (
                <div key={location.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-[#4F46E5]/10 rounded-full flex items-center justify-center mr-3">
                      <MapPin className="w-5 h-5 text-[#4F46E5]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#1F2937]">{location.name}</h3>
                  </div>

                  {/* Sample outage data - in a real app, this would come from an API */}
                  {location.id === 1 ? (
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-100">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-[#1F2937]">Power Outage</h4>
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">
                                Official
                              </span>
                            </div>
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Active</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Electrical grid maintenance affecting multiple blocks in this area.
                          </p>
                          <div className="flex justify-between items-center mt-2">
                            <p className="text-xs text-gray-500">Reported 35 minutes ago</p>
                            <p className="text-xs font-medium text-gray-700">Est. resolution: 2 hours</p>
                          </div>
                          <div className="mt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs border-red-300 text-red-700 hover:bg-red-100"
                              onClick={() => handleViewOutageDetails(location.id)}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                          <svg
                            className="w-4 h-4 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-green-800">No active outages reported</p>
                          <p className="text-sm text-green-600">
                            All utilities are functioning normally in this area
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Outage Details Modal */}
      {showOutageDetailsModal && selectedOutageDetails && (
        <OutageDetailsModal
          outageDetails={selectedOutageDetails}
          onClose={onCloseOutageDetailsModal}
        />
      )}
    </div>
  );
};

/**
 * OutageDetailsModal component - Displays detailed outage information
 */
const OutageDetailsModal = ({ outageDetails, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#1F2937]">{outageDetails.title}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    outageDetails.status === "active"
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {outageDetails.status === "active" ? "Active" : "Resolved"}
                </span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">
                  Official
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Details */}
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-[#1F2937] mb-3">Outage Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Outage ID:</span>
                    <span className="font-medium">#{outageDetails.id.toString().padStart(6, "0")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium capitalize">{outageDetails.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Priority:</span>
                    <span className="font-medium capitalize">{outageDetails.priority}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Affected Households:</span>
                    <span className="font-medium">~{outageDetails.affectedHouseholds} homes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Crew Status:</span>
                    <span className="font-medium">{outageDetails.crewStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Est. Restoration:</span>
                    <span className="font-medium">{outageDetails.estimatedRestoration}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-[#1F2937] mb-3">Description</h3>
                <p className="text-gray-600 leading-relaxed">{outageDetails.description}</p>
              </div>

              <div>
                <h3 className="font-semibold text-[#1F2937] mb-3">Technical Details</h3>
                <p className="text-gray-600 leading-relaxed">{outageDetails.technicalDetails}</p>
              </div>

              {outageDetails.safetyNotice && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-yellow-800 mb-1">Safety Notice</h4>
                      <p className="text-sm text-yellow-700">{outageDetails.safetyNotice}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Timeline */}
            <div>
              <h3 className="font-semibold text-[#1F2937] mb-4">Timeline</h3>
              <div className="space-y-4">
                {outageDetails.timeline.map((item, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full mt-2 ${
                        item.status === "completed"
                          ? "bg-green-500"
                          : item.status === "current"
                            ? "bg-blue-500"
                            : "bg-gray-300"
                      }`}
                    ></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4
                          className={`font-medium ${
                            item.status === "current" ? "text-blue-700" : "text-[#1F2937]"
                          }`}
                        >
                          {item.event}
                        </h4>
                        <span className="text-sm text-gray-500">{item.time}</span>
                      </div>
                      {item.status === "current" && <p className="text-sm text-blue-600 mt-1">In progress...</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutagesPage;
