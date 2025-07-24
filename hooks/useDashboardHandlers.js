/**
 * useDashboardHandlers.js
 *
 * Custom React hook containing all business logic and event handlers for the user dashboard.
 * - Provides functions for handling user actions (profile updates, notification toggles, viewing outage details, etc.).
 * - Keeps side-effect logic and business rules out of the main dashboard component.
 * - Works with useDashboard.js to keep state and logic modular and maintainable.
 */
import {
  updateNotificationSettings,
  saveUserProfile,
  isEmailInUse,
} from "@/firebase/firestoreHelpers";

/**
 * Custom hook containing all dashboard business logic handlers
 */
export const useDashboardHandlers = (user, dashboardState) => {
  const {
    setIsSubmitting,
    setNotificationSaved,
    notificationSettingsRef,
    notificationSettings,
    setExpandedReportId,
    expandedReportId,
    setExpandedOutageId,
    expandedOutageId,
    setShowOutageDetailsModal,
    setSelectedOutageDetails,
    setProfile,
    profile,
    originalProfile,
    setOriginalProfile,
    setProfileError,
    setProfileSuccessMessage,
  } = dashboardState;

  // Notification handlers
  const handleToggleNotification = (type) => {
    dashboardState.setNotificationSettings((prev) => {
      const updated = { ...prev, [type]: !prev[type] };
      setNotificationSaved(false);
      return updated;
    });
  };

  const handleSaveNotificationSettings = async () => {
    setIsSubmitting(true);
    try {
      if (user?.uid) {
        await updateNotificationSettings(user.uid, notificationSettings);
      }
      setNotificationSaved(true);
      setTimeout(() => {
        if (notificationSettingsRef.current === notificationSettings) {
          setNotificationSaved(false);
        }
      }, 5000);
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Report handlers
  const handleViewDetails = (reportId) => {
    setExpandedReportId(expandedReportId === reportId ? null : reportId);
  };

  // Location handlers
  const handleSetAsDefault = (locationId) => {
    console.log("Setting location as default:", locationId);
    alert(`Location ${locationId} set as default`);
  };

  const handleToggleOutageDetails = (locationId) => {
    setExpandedOutageId(expandedOutageId === locationId ? null : locationId);
  };

  const handleViewOutageDetails = (outageId) => {
    // Sample detailed outage data - in real app this would come from API
    const outageDetails = {
      id: outageId,
      title: "Power Outage - Sector 15",
      type: "electricity",
      status: "active",
      priority: "high",
      location: "Sector 15, Block A",
      affectedHouseholds: 150,
      cause: "Transformer failure in main distribution grid",
      crewStatus: "On-site working",
      estimatedRestoration: "2-4 hours",
      reportedAt: "Today at 1:25 PM",
      lastUpdate: "35 minutes ago",
      description:
        "Complete power failure reported in residential area. Maintenance team dispatched to replace faulty transformer unit.",
      timeline: [
        { time: "1:25 PM", event: "Outage Reported", status: "completed" },
        { time: "1:45 PM", event: "Crew Dispatched", status: "completed" },
        { time: "2:00 PM", event: "Work in Progress", status: "current" },
        { time: "4:00 PM", event: "Estimated Restoration", status: "pending" },
      ],
      technicalDetails:
        "Transformer T-15A in the main distribution grid requires replacement due to overheating. The maintenance crew is currently installing a new transformer unit. Power will be restored once the installation is complete and safety checks are performed.",
      safetyNotice:
        "Please avoid using high-power appliances immediately after power restoration to prevent voltage fluctuations.",
    };

    setSelectedOutageDetails(outageDetails);
    setShowOutageDetailsModal(true);
  };

  // Profile handlers
  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
    setProfileError("");
  };

  const handleUpdateProfile = async () => {
    setIsSubmitting(true);
    setProfileError("");

    // Check what changed
    const emailChanged = profile.email !== originalProfile.email;
    const phoneChanged = profile.phone !== originalProfile.phone;
    const nameChanged = profile.name !== originalProfile.name;

    if (emailChanged && phoneChanged) {
      setProfileError("Please change either email or phone number, not both at once.");
      setIsSubmitting(false);
      return;
    }

    try {
      if (emailChanged) {
        // Check if email is already in use
        const inUse = await isEmailInUse(profile.email, user.uid);
        if (inUse) {
          setProfileError("This email is already in use by another account.");
          setIsSubmitting(false);
          return;
        }
        await saveUserProfile(user.uid, { email: profile.email });
        setOriginalProfile({ ...originalProfile, email: profile.email });
        setProfileSuccessMessage("Email updated successfully!");
      } else if (phoneChanged) {
        await saveUserProfile(user.uid, { phone: profile.phone });
        setOriginalProfile({ ...originalProfile, phone: profile.phone });
        setProfileSuccessMessage("Phone number updated successfully!");
      } else if (nameChanged) {
        await saveUserProfile(user.uid, { name: profile.name });
        setOriginalProfile({ ...originalProfile, name: profile.name });
        setProfileSuccessMessage("Profile updated successfully!");
      }

      setTimeout(() => setProfileSuccessMessage(""), 3000);
    } catch (error) {
      setProfileError(`Failed to update ${emailChanged ? 'email' : phoneChanged ? 'phone number' : 'profile'}. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async () => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Password changed successfully!");
    } catch (error) {
      alert("Failed to change password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      console.log("Deleting account");
      alert("Account deletion initiated. You will be contacted for confirmation.");
    }
  };

  return {
    handleToggleNotification,
    handleSaveNotificationSettings,
    handleViewDetails,
    handleSetAsDefault,
    handleToggleOutageDetails,
    handleViewOutageDetails,
    handleProfileChange,
    handleUpdateProfile,
    handleChangePassword,
    handleDeleteAccount,
  };
};
