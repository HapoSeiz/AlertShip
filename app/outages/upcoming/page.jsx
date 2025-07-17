"use client";
import { useState } from "react";
import { Nunito } from "next/font/google";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useAuth } from "@/contexts/AuthContext";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday } from "date-fns";
import { NotificationModal } from "@/components/notification-modal";
import { AuthModals } from "@/components/auth-modals";

const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nunito",
});

export default function UpcomingOutagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const location = searchParams.get("location");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const { isAuthenticated, openLogIn, openSignUp, signOut } = useAuth();

  const handleBackToOutages = () => {
    router.push("/outages");
  };

  return (
    <div className={`min-h-screen bg-[#F9FAFB] ${nunito.className}`}>
      {/* Header */}
      <Header
        currentPage="outages"
        isLoggedIn={isAuthenticated}
        onLoginOpen={openLogIn}
        onSignUpOpen={openSignUp}
        onLogout={signOut}
        onNavigate={(page) => router.push(page === "home" ? "/" : `/${page}`)}
      />

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-8 sm:pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1F2937] mb-2">
                  Upcoming Scheduled Outages
                </h1>
                <p className="text-gray-600">Planned maintenance and scheduled outages in {location}</p>
              </div>
              <Button
                onClick={handleBackToOutages}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center ml-4"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </Button>
            </div>
          </div>

          {/* Calendar View */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#1F2937]">
                <Calendar className="inline-block w-5 h-5 mr-2 text-[#4F46E5]" />
                {format(currentMonth, "MMMM yyyy")}
              </h2>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-sm"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-sm"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                >
                  Next
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 mb-4 text-center text-sm font-medium text-gray-700">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>
            <div className="grid grid-cols-7 gap-2 text-sm">
              {(() => {
                // Get days in month
                const monthStart = startOfMonth(currentMonth);
                const monthEnd = endOfMonth(currentMonth);
                const startDate = monthStart;
                const endDate = monthEnd;

                const dateFormat = "d";
                const days = eachDayOfInterval({ start: startDate, end: endDate });

                // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
                const startDay = getDay(monthStart);

                // Create empty cells for days before the start of the month
                const emptyCellsBefore = Array.from({ length: startDay }, (_, i) => (
                  <div key={`empty-before-${i}`} className="h-24 p-1 border rounded-lg bg-gray-50 text-gray-400"></div>
                ));

                // Create cells for each day of the month
                const dayCells = days.map((day) => {
                  // Check if this day has any outages (for demo purposes)
                  const hasElectricityOutage = day.getDate() === 15;
                  const hasWaterOutage = day.getDate() === 21;

                  return (
                    <div
                      key={day.toString()}
                      className={`h-24 p-1 border rounded-lg ${isToday(day) ? "bg-blue-50 border-blue-200" : ""}`}
                    >
                      <div className={`${isToday(day) ? "font-bold text-blue-600" : ""}`}>{format(day, dateFormat)}</div>
                      {hasElectricityOutage && (
                        <div className="mt-1 p-1 text-xs bg-[#F59E0B]/20 text-[#F59E0B] rounded">Electricity</div>
                      )}
                      {hasWaterOutage && (
                        <div className="mt-1 p-1 text-xs bg-[#4F46E5]/20 text-[#4F46E5] rounded">Water</div>
                      )}
                    </div>
                  );
                });

                // Calculate how many empty cells we need after the month
                const totalCells = 42; // 6 rows of 7 days
                const emptyCellsAfterCount = totalCells - emptyCellsBefore.length - dayCells.length;

                // Create empty cells for days after the end of the month
                const emptyCellsAfter = Array.from({ length: emptyCellsAfterCount }, (_, i) => (
                  <div key={`empty-after-${i}`} className="h-24 p-1 border rounded-lg bg-gray-50 text-gray-400"></div>
                ));

                return [...emptyCellsBefore, ...dayCells, ...emptyCellsAfter];
              })()}
            </div>
          </div>

          {/* Upcoming Outages List */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <h2 className="text-xl font-semibold text-[#1F2937] mb-6">Scheduled Outages</h2>

            <div className="space-y-6">
              {/* Scheduled Outage Item */}
              <div className="border-l-4 border-[#F59E0B] pl-4 py-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-medium text-[#1F2937]">Electricity Maintenance</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Scheduled maintenance of electrical lines and transformers
                    </p>
                  </div>
                  <div className="mt-2 sm:mt-0 text-sm font-medium">June 15, 2023 • 10:00 AM - 2:00 PM</div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">Sector 15</span>
                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">Block A</span>
                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">Block B, C</span>
                  <span className="text-xs bg-[#F59E0B]/20 text-[#F59E0B] px-2 py-1 rounded">4 hours</span>
                </div>
              </div>

              {/* Scheduled Outage Item */}
              <div className="border-l-4 border-[#4F46E5] pl-4 py-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-medium text-[#1F2937]">Water Supply Maintenance</h3>
                    <p className="text-sm text-gray-600 mt-1">Pipeline cleaning and pressure testing</p>
                  </div>
                  <div className="mt-2 sm:mt-0 text-sm font-medium">June 21, 2023 • 8:00 AM - 12:00 PM</div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">Phase 2</span>
                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                    Main Road, Park Avenue
                  </span>
                  <span className="text-xs bg-[#4F46E5]/20 text-[#4F46E5] px-2 py-1 rounded">4 hours</span>
                </div>
              </div>

              {/* Scheduled Outage Item */}
              <div className="border-l-4 border-[#F59E0B] pl-4 py-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-medium text-[#1F2937]">Electricity Grid Upgrade</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Installation of new smart meters and grid modernization
                    </p>
                  </div>
                  <div className="mt-2 sm:mt-0 text-sm font-medium">July 5, 2023 • 9:00 AM - 3:00 PM</div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">Sector 12</span>
                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">All Blocks</span>
                  <span className="text-xs bg-[#F59E0B]/20 text-[#F59E0B] px-2 py-1 rounded">6 hours</span>
                </div>
              </div>
            </div>

            {/* Subscribe for Notifications */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="font-medium text-[#1F2937]">Get Notified About Scheduled Outages</h3>
                  <p className="text-sm text-gray-600 mt-1">Receive alerts before scheduled outages in your area</p>
                </div>
                <Button
                  onClick={() => {
                    if (isAuthenticated) {
                      setShowNotificationModal(true);
                    } else {
                      openLogIn();
                    }
                  }}
                  className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white whitespace-nowrap"
                >
                  Subscribe to Alerts
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <NotificationModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        isLoggedIn={isAuthenticated}
        onOpenLogin={openLogIn}
      />
      <AuthModals />
    </div>
  );
} 