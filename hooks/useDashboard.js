/**
 * useDashboard.js
 *
 * Custom React hook for managing all state and data-fetching logic for the user dashboard.
 * - Handles tab state, loading/submission, modals, and user profile/location/notification/report data.
 * - Fetches data from Firebase and exposes all state and setters for use in the dashboard UI.
 * - Keeps the main dashboard component clean and declarative by centralizing state management.
 */
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  fetchUserProfile,
  fetchNotificationSettings,
  updateNotificationSettings,
  saveUserProfile,
  isEmailInUse,
  fetchOutageReportsByUid,
} from "@/firebase/firestoreHelpers";

/**
 * Custom hook for managing dashboard state and logic
 */
export const useDashboard = (user) => {
  const router = useRouter();
  
  // Tab state
  const [activeTab, setActiveTab] = useState("overview");
  
  // Loading and submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Location-related state
  const [savedLocations, setSavedLocations] = useState([]);
  const [showAddLocationModal, setShowAddLocationModal] = useState(false);
  const [editingLocationId, setEditingLocationId] = useState(null);
  const [newLocation, setNewLocation] = useState({ name: "", address: "" });
  const [locationSuccessMessage, setLocationSuccessMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState(null);
  
  // Notification state
  const [notificationSettings, setNotificationSettings] = useState({
    browser: false,
    whatsapp: false,
    email: false,
  });
  const [notificationSaved, setNotificationSaved] = useState(false);
  const notificationSettingsRef = useRef(notificationSettings);
  
  // Profile state
  const [profile, setProfile] = useState({ name: "", email: "", phone: "" });
  const [originalProfile, setOriginalProfile] = useState({ name: "", email: "", phone: "" });
  const [profileError, setProfileError] = useState("");
  const [profileSuccessMessage, setProfileSuccessMessage] = useState("");
  
  // Reports state
  const [recentReports, setRecentReports] = useState([]);
  const [expandedReportId, setExpandedReportId] = useState(null);
  const [reportFilters, setReportFilters] = useState({
    type: "all",
    severity: "all",
  });
  
  // Modal and page states
  const [showOutagesPage, setShowOutagesPage] = useState(false);
  const [showOutageDetailsModal, setShowOutageDetailsModal] = useState(false);
  const [selectedOutageDetails, setSelectedOutageDetails] = useState(null);
  const [expandedOutageId, setExpandedOutageId] = useState(null);
  
  // Mock data (should be moved to API calls later)
  const upcomingOutages = [
    {
      id: 1,
      type: "electricity",
      location: "Sector 15",
      date: "2023-06-15",
      time: "10:00 AM - 2:00 PM",
      description: "Scheduled maintenance of electrical lines",
    },
    {
      id: 2,
      type: "water",
      location: "Phase 2",
      date: "2023-06-21",
      time: "8:00 AM - 12:00 PM",
      description: "Pipeline cleaning and pressure testing",
    },
  ];
  
  // Effects for data fetching
  useEffect(() => {
    if (user?.uid) {
      // Fetch recent reports
      fetchOutageReportsByUid(user.uid).then((reports) => {
        const sorted = [...reports].sort(
          (a, b) => new Date(b.timestamp || b.reportedAt) - new Date(a.timestamp || a.reportedAt)
        );
        setRecentReports(sorted);
      });
      
      // Fetch user profile and saved locations
      fetchUserProfile(user.uid).then((profileData) => {
        if (profileData) {
          setProfile({
            name: profileData.name || "",
            email: profileData.email || "",
            phone: profileData.phone || ""
          });
          setOriginalProfile({
            name: profileData.name || "",
            email: profileData.email || "",
            phone: profileData.phone || ""
          });
          
          if (profileData.savedLocations) {
            setSavedLocations(profileData.savedLocations);
          } else {
            setSavedLocations([]);
          }
        }
      });
      
      // Fetch notification settings
      fetchNotificationSettings(user.uid).then((settings) => {
        if (settings) setNotificationSettings(settings);
      });
    }
  }, [user?.uid]);
  
  // Update notification settings ref
  useEffect(() => {
    notificationSettingsRef.current = notificationSettings;
  }, [notificationSettings]);
  
  return {
    // State
    activeTab,
    setActiveTab,
    isSubmitting,
    setIsSubmitting,
    savedLocations,
    setSavedLocations,
    showAddLocationModal,
    setShowAddLocationModal,
    editingLocationId,
    setEditingLocationId,
    newLocation,
    setNewLocation,
    locationSuccessMessage,
    setLocationSuccessMessage,
    showDeleteModal,
    setShowDeleteModal,
    locationToDelete,
    setLocationToDelete,
    notificationSettings,
    setNotificationSettings,
    notificationSaved,
    setNotificationSaved,
    profile,
    setProfile,
    originalProfile,
    setOriginalProfile,
    profileError,
    setProfileError,
    profileSuccessMessage,
    setProfileSuccessMessage,
    recentReports,
    expandedReportId,
    setExpandedReportId,
    reportFilters,
    setReportFilters,
    showOutagesPage,
    setShowOutagesPage,
    showOutageDetailsModal,
    setShowOutageDetailsModal,
    selectedOutageDetails,
    setSelectedOutageDetails,
    expandedOutageId,
    setExpandedOutageId,
    upcomingOutages,
    
    // Refs
    notificationSettingsRef,
    
    // Router
    router,
  };
};
