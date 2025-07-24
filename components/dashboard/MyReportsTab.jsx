import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useDashboardContext } from "@/contexts/DashboardContext";

const MyReportsTab = () => {
  const {
    router,
    recentReports,
    reportFilters,
    setReportFilters,
    expandedReportId,
    handleViewDetails,
  } = useDashboardContext();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-[#1F2937]">My Reported Outages</h2>
        <Button onClick={() => router.push("/report")} className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white">
          Report New Outage
        </Button>
      </div>
      {/* Filter Controls: Only Type Filter */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Type</label>
            <div className="flex gap-2">
              <button
                onClick={() => setReportFilters((prev) => ({ ...prev, type: "all" }))}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  reportFilters.type === "all"
                    ? "bg-[#4F46E5] text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setReportFilters((prev) => ({ ...prev, type: "electricity" }))}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  reportFilters.type === "electricity"
                    ? "bg-[#F59E0B] text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Electricity
              </button>
              <button
                onClick={() => setReportFilters((prev) => ({ ...prev, type: "water" }))}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  reportFilters.type === "water"
                    ? "bg-[#4F46E5] text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Water
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Reports List */}
      <div className="space-y-4">
        {(() => {
          // Only use real backend data (recentReports)
          const filteredReports = recentReports.filter((report) => {
            const typeMatch = reportFilters.type === "all" || report.type === reportFilters.type;
            return typeMatch;
          });
          if (filteredReports.length === 0) {
            return (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No Reports Found</h3>
                <p className="text-gray-500 mb-6">No reports match the selected filters.</p>
                <Button
                  onClick={() => setReportFilters({ type: "all", severity: "all" })}
                  variant="outline"
                  className="border-[#4F46E5] text-[#4F46E5] hover:bg-[#4F46E5] hover:text-white"
                >
                  Clear Filters
                </Button>
              </div>
            );
          }
          return filteredReports.map((report) => (
            <div key={report.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      report.type === "electricity" ? "bg-[#F59E0B]/20" : "bg-[#4F46E5]/20"
                    }`}
                  >
                    {report.type === "electricity" ? (
                      // Bolt icon (yellow)
                      <svg className="w-5 h-5 text-[#F59E0B]" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      // Water drop icon (blue)
                      <svg className="w-5 h-5 text-[#4F46E5]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2C10 2 4 9.5 4 13a6 6 0 0012 0c0-3.5-6-11-6-11zm0 16a4 4 0 01-4-4c0-2.22 2.67-6.22 4-8.09C11.33 7.78 14 11.78 14 14a4 4 0 01-4 4z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{report.locality || report.location || "Unknown Locality"}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Reported on {(() => {
                        const dateStr = report.timestamp || report.reportedAt || report.date;
                        if (!dateStr) return "-";
                        const dateObj = new Date(dateStr);
                        if (isNaN(dateObj.getTime())) return "-";
                        return dateObj.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
                      })()}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    report.status === "resolved"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {report.status === "resolved" ? "Resolved" : "Pending"}
                </span>
              </div>
              {/* Expanded Details */}
              {expandedReportId === report.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Report Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Report ID:</span>
                          <span className="font-medium">#{report.id.toString().padStart(6, "0")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Type:</span>
                          <span className="font-medium capitalize">{report.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Priority:</span>
                          <span className="font-medium capitalize">{report.severity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Affected Users:</span>
                          <span className="font-medium">
                            ~{report.severity === "high" ? "150" : report.severity === "medium" ? "75" : "25"}{" "}
                            households
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Timeline</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                          <div>
                            <p className="font-medium">Report Submitted</p>
                            <p className="text-gray-500 text-xs">{report.date} at 2:30 PM</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5"></div>
                          <div>
                            <p className="font-medium">Under Maintenance</p>
                            <p className="text-gray-500 text-xs">{report.date} at 3:15 PM</p>
                          </div>
                        </div>
                        {report.status === "resolved" && (
                          <div className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                            <div>
                              <p className="font-medium">Issue Resolved</p>
                              <p className="text-gray-500 text-xs">{report.date} at 5:45 PM</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Additional Information</h4>
                    <p className="text-sm text-gray-600">
                      {report.type === "electricity"
                        ? "The power outage was caused by a transformer failure in the main distribution line. Our technical team has replaced the faulty equipment and restored power to all affected areas."
                        : "The water pressure issue was due to maintenance work on the main pipeline. The work has been completed and normal water pressure has been restored."}
                    </p>
                  </div>

                  {report.status === "pending" && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center">
                        <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                        <p className="text-sm text-yellow-800">
                          <span className="font-medium">Estimated Resolution:</span>{" "}
                          {report.severity === "high"
                            ? "1-2 hours"
                            : report.severity === "medium"
                              ? "2-4 hours"
                              : "4-6 hours"}{" "}
                          from now
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={() => handleViewDetails(report.id)}
                  variant="outline"
                  size="sm"
                  className="text-sm border-[#4F46E5] text-[#4F46E5] hover:bg-[#4F46E5] hover:text-white"
                >
                  {expandedReportId === report.id ? "Hide Details" : "View Details"}
                </Button>
              </div>
            </div>
          ));
        })()}
      </div>
    </div>
  );
};

export default MyReportsTab;