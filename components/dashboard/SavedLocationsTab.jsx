/**
 * SavedLocationsTab.jsx
 *
 * Saved locations management component with Google Places API integration.
 * Features:
 * - Google Places autocomplete search (replaces Mapbox)
 * - Minimum 3 characters required for search
 * - Automatic location detection using browser geolocation + reverse geocoding
 * - Optimized address format (building/area + subcity/sector + city + state + pincode)
 * - Search button appears only after 3+ characters
 * - Displays helpful message when input is focused
 * - Uses SearchButton and LocationButton UI components
 */

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { MapPin, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
const DeleteLocationModal = dynamic(() => import("@/components/dashboard/DeleteLocationModal"), { ssr: false });
import { useDashboardContext } from "@/contexts/DashboardContext";
import {
  fetchUserProfile,
  addSavedLocation,
  updateSavedLocations,
} from "@/firebase/firestoreHelpers";
export default function SavedLocationsTab() {
  const {
    activeTab,
    savedLocations,
    setSavedLocations,
    handleViewOutages,
    handleSetAsDefault,
    user,
    showAddLocationModal,
    setShowAddLocationModal,
    editingLocationId,
    setEditingLocationId,
    newLocation,
    setNewLocation,
    showDeleteModal,
    setShowDeleteModal,
    locationToDelete,
    setLocationToDelete,
    setLocationSuccessMessage,
  } = useDashboardContext();

// Memoized LocationItem component for rendering each saved location
const LocationItem = React.memo(function LocationItem({ location, onEdit, onDelete, onSetDefault, onViewOutages }) {
  return (
    <div className="border rounded-lg p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="w-[52px] sm:w-[48px] lg:w-[40px] aspect-square bg-[#4F46E5]/10 rounded-full flex items-center justify-center p-1.5 sm:p-1.5 lg:p-1.5">
            <MapPin className="w-6 h-6 sm:w-6 sm:h-6 lg:w-6 lg:h-6 text-[#4F46E5]" />
          </div>
          <div>
            <h3 className="font-semibold text-[#1F2937] text-lg">{location.name}</h3>
            <p className="text-gray-600 mt-1">{location.address}</p>
          </div>
        </div>
        {/* Desktop: show buttons, Mobile: show menu */}
        <div className="hidden sm:flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewOutages(location.id)}
            className="border-gray-300 hover:bg-[#F59E0B] hover:border-[#F59E0B] hover:text-white"
          >
            View Outages
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(location.id)}
            className="border-gray-300 hover:bg-[#F59E0B] hover:border-[#F59E0B] hover:text-white"
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(location)}
            className="border-[#4F46E5] text-[#4F46E5] hover:bg-[#4F46E5] hover:text-white"
          >
            Delete
          </Button>
        </div>
        <div className="sm:hidden flex self-start mt-[-8px]">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="p-1">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-white border border-gray-200 rounded-xl shadow-xl min-w-[160px] py-2 px-0 mt-2"
              style={{ zIndex: 9999 }}
            >
              <DropdownMenuItem
                onClick={() => onViewOutages(location.id)}
                className="px-5 py-3 text-base text-gray-900 hover:bg-[#F59E0B]/10 hover:text-[#F59E0B] rounded-lg transition-colors cursor-pointer"
              >
                View Outages
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onEdit(location.id)}
                className="px-5 py-3 text-base text-gray-900 hover:bg-[#F59E0B]/10 hover:text-[#F59E0B] rounded-lg transition-colors cursor-pointer"
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(location)}
                className="px-5 py-3 text-base font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors cursor-pointer"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
});



  // Rest of the component logic stays the same
  if (activeTab !== "locations") return null;

  // Add or edit location
  const handleAddLocation = async (e) => {
    e.preventDefault();
    if (!user?.uid) return;

    if (!newLocation.name.trim() || !newLocation.address.trim()) {
      setSearchError("Please fill out both location name and address.");
      return;
    }

    // Clean the location object to ensure only serializable data
    console.log("=== CREATING CLEAN LOCATION FOR FIRESTORE ===");
    console.log("newLocation state:", newLocation);
    
    const cleanLocation = {
      name: newLocation.name,
      address: newLocation.address, // This will be our custom formatted address
      ...(newLocation.placeId && { placeId: newLocation.placeId }),
      ...(typeof newLocation.lat === 'number' && { lat: newLocation.lat }),
      ...(typeof newLocation.lng === 'number' && { lng: newLocation.lng }),
      // Save individual address components
      ...(newLocation.premise && { premise: newLocation.premise }),
      ...(newLocation.route && { route: newLocation.route }),
      ...(newLocation.neighborhood && { neighborhood: newLocation.neighborhood }),
      ...(newLocation.sublocality && { sublocality: newLocation.sublocality }),
      ...(newLocation.city && { city: newLocation.city }),
      ...(newLocation.state && { state: newLocation.state }),
      ...(newLocation.pinCode && { pinCode: newLocation.pinCode })
    };

    console.log("Clean location object for Firestore:", cleanLocation);
    console.log("Address being saved:", cleanLocation.address);
    console.log("Individual components being saved:", {
      premise: cleanLocation.premise,
      route: cleanLocation.route,
      neighborhood: cleanLocation.neighborhood,
      sublocality: cleanLocation.sublocality,
      city: cleanLocation.city,
      state: cleanLocation.state,
      pinCode: cleanLocation.pinCode
    });

    try {
      if (editingLocationId) {
        // Edit existing location
        const updatedLocations = savedLocations.map((loc) =>
          loc.id === editingLocationId ? { ...loc, ...cleanLocation } : loc
        );
        await updateSavedLocations(user.uid, updatedLocations);
        setSavedLocations(updatedLocations);
        setLocationSuccessMessage(`Location "${newLocation.name}" updated successfully!`);
      } else {
        // Add new location
        const newLocationItem = {
          id: Date.now().toString(),
          ...cleanLocation,
        };
        await addSavedLocation(user.uid, newLocationItem);
        setSavedLocations([...savedLocations, newLocationItem]);
        setLocationSuccessMessage(`Location "${newLocation.name}" added successfully!`);
      }

      // This code now only runs if the 'try' block was successful
      setShowAddLocationModal(false);
      setEditingLocationId(null);
      setNewLocation({ name: "", address: "" });
      setSearchError("");
      setTimeout(() => setLocationSuccessMessage(""), 5000);

    } catch (error) {
      // If any error occurs during the database operation, we catch it here
      console.error("Failed to save location:", error);
      setSearchError("Could not save location. Please try again.");
    }
  };


  // Memoized: Edit location (open modal)
  const handleEditLocation = React.useCallback((locationId) => {
    const locationToEdit = savedLocations.find((loc) => loc.id === locationId);
    if (locationToEdit) {
      setNewLocation(locationToEdit);
      setEditingLocationId(locationId);
      setShowAddLocationModal(true);
    }
  }, [savedLocations, setNewLocation, setEditingLocationId, setShowAddLocationModal]);

  // Memoized: Delete location
  const handleDeleteLocation = React.useCallback((location) => {
    setLocationToDelete(location);
    setShowDeleteModal(true);
  }, [setLocationToDelete, setShowDeleteModal]);

  // Memoized: Set as default location

  const handleSetAsDefaultMemo = React.useCallback((locationId) => {
    if (typeof handleSetAsDefault === 'function') {
      handleSetAsDefault(locationId);
    }
  }, [handleSetAsDefault]);

  // Memoized: View outages for location
  const handleViewOutagesMemo = React.useCallback((locationId) => {
    if (typeof handleViewOutages === 'function') {
      handleViewOutages(locationId);
    }
  }, [handleViewOutages]);

  // Confirm delete location (not passed to LocationItem, but keep as is)
  const confirmDeleteLocation = async () => {
    if (!user?.uid || !locationToDelete) return;
    const updatedLocations = savedLocations.filter((loc) => loc.id !== locationToDelete.id);
    setSavedLocations(updatedLocations);
    await updateSavedLocations(user.uid, updatedLocations);
    setLocationSuccessMessage(`Location "${locationToDelete.name}" deleted successfully!`);
    setShowDeleteModal(false);
    setLocationToDelete(null);
    setTimeout(() => setLocationSuccessMessage(""), 5000);
  };

  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-[#1F2937]">Saved Locations</h2>
          <Button
            onClick={() => setShowAddLocationModal(true)}
            className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white"
          >
            Add New Location
          </Button>
        </div>

        {savedLocations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No saved locations yet. Add your first location to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {savedLocations.map((location) => (
              <LocationItem
                key={location.id}
                location={location}
                onEdit={handleEditLocation}
                onDelete={handleDeleteLocation}
                onSetDefault={handleSetAsDefaultMemo}
                onViewOutages={handleViewOutagesMemo}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Location Modal is now global */}

      {/* Delete Confirmation Modal */}
      <DeleteLocationModal
        open={showDeleteModal}
        location={locationToDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setLocationToDelete(null);
        }}
        onConfirm={confirmDeleteLocation}
      />

    </>
  );
}
