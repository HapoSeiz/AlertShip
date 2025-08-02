import React from "react";
import { Button } from "@/components/ui/button";
import { Bell, MessageSquare } from "lucide-react";
import { useDashboardContext } from "@/contexts/DashboardContext";

/**
 * NotificationSettingsTab component
 */
const NotificationSettingsTab = () => {
  const {
    activeTab,
    notificationSettings,
    handleToggleNotification,
    handleSaveNotificationSettings,
    isSubmitting,
    notificationSaved,
  } = useDashboardContext();
  
  if (activeTab !== "notifications") return null;
  
  return (
    <div>
      <h2 className="text-xl font-semibold text-[#1F2937] mb-6">Notification Settings</h2>
      <div className="space-y-6">
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#4F46E5]/10 rounded-full flex items-center justify-center">
                <Bell className="w-5 h-5 text-[#4F46E5]" />
              </div>
              <div>
                <h3 className="font-medium">Browser Notifications</h3>
                <p className="text-sm text-gray-600">Receive alerts directly in your browser</p>
              </div>
            </div>
            <div
              className={`relative inline-block w-12 h-6 rounded-full ${notificationSettings.browser ? "bg-[#4F46E5]" : "bg-gray-200"} flex-shrink-0`}
              onClick={() => handleToggleNotification("browser")}
              style={{ cursor: "pointer" }}
            >
              <input
                type="checkbox"
                className="opacity-0 w-0 h-0"
                checked={notificationSettings.browser}
                readOnly
                tabIndex={-1}
                style={{ pointerEvents: "none" }}
              />
              <span
                className={`absolute top-0 left-0 right-0 bottom-0 rounded-full transition-colors duration-200`}
                style={{ pointerEvents: "none" }}
              ></span>
              <span
                className={`absolute w-4 h-4 top-1 bg-white rounded-full transition-transform duration-200 ${
                  notificationSettings.browser ? "transform translate-x-7" : "transform translate-x-1"
                }`}
                style={{ pointerEvents: "none" }}
              ></span>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#4F46E5]/10 rounded-full flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-[#4F46E5]" />
              </div>
              <div>
                <h3 className="font-medium">WhatsApp Notifications</h3>
                <p className="text-sm text-gray-600">Receive alerts via WhatsApp messages</p>
              </div>
            </div>
            <div
              className={`relative inline-block w-12 h-6 rounded-full ${notificationSettings.whatsapp ? "bg-[#4F46E5]" : "bg-gray-200"} flex-shrink-0`}
              onClick={() => handleToggleNotification("whatsapp")}
              style={{ cursor: "pointer" }}
            >
              <input
                type="checkbox"
                className="opacity-0 w-0 h-0"
                checked={notificationSettings.whatsapp}
                readOnly
                tabIndex={-1}
                style={{ pointerEvents: "none" }}
              />
              <span
                className={`absolute top-0 left-0 right-0 bottom-0 rounded-full transition-colors duration-200`}
                style={{ pointerEvents: "none" }}
              ></span>
              <span
                className={`absolute w-4 h-4 top-1 bg-white rounded-full transition-transform duration-200 ${
                  notificationSettings.whatsapp ? "transform translate-x-7" : "transform translate-x-1"
                }`}
                style={{ pointerEvents: "none" }}
              ></span>
            </div>
          </div>
          {notificationSettings.whatsapp && (
            <div className="mt-3 pl-12">
              <p className="text-sm text-gray-600">Connected number: +91 98765 43210</p>
              <Button
                variant="link"
                size="sm"
                className="text-[#4F46E5] p-0 h-auto text-sm"
                //onClick={handleChangeWhatsAppNumber}
              >
                Change Number
              </Button>
            </div>
          )}
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#4F46E5]/10 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-[#4F46E5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Email Notifications</h3>
                <p className="text-sm text-gray-600">Receive alerts via email</p>
              </div>
            </div>
            <div
              className={`relative inline-block w-12 h-6 rounded-full ${notificationSettings.email ? "bg-[#4F46E5]" : "bg-gray-200"}`}
              onClick={() => handleToggleNotification("email")}
              style={{ cursor: "pointer" }}
            >
              <input
                type="checkbox"
                className="opacity-0 w-0 h-0"
                checked={notificationSettings.email}
                readOnly
                tabIndex={-1}
                style={{ pointerEvents: "none" }}
              />
              <span
                className={`absolute top-0 left-0 right-0 bottom-0 rounded-full transition-colors duration-200`}
                style={{ pointerEvents: "none" }}
              ></span>
              <span
                className={`absolute w-4 h-4 top-1 bg-white rounded-full transition-transform duration-200 ${
                  notificationSettings.email ? "transform translate-x-7" : "transform translate-x-1"
                }`}
                style={{ pointerEvents: "none" }}
              ></span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Button
          onClick={handleSaveNotificationSettings}
          disabled={isSubmitting}
          className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white"
        >
          {notificationSaved ? "Changes Saved" : isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

export default NotificationSettingsTab;