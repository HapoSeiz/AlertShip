import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Loader2 } from "lucide-react";
import LocationDropdown from "@/components/LocationDropdown";
import LocationButton from "@/components/ui/LocationButton";
import SearchButton from "@/components/ui/SearchButton";
import clsx from "clsx";
import { useDashboardContext } from "@/contexts/DashboardContext";
import { addSavedLocation, updateSavedLocations } from "@/firebase/firestoreHelpers";
import { useGooglePlaces } from "@/hooks/useGooglePlaces";
import { useToast } from "@/hooks/use-toast";

export default function AddLocationModal() {
  const {
    showAddLocationModal,
    setShowAddLocationModal,
    editingLocationId,
    setEditingLocationId,
    newLocation,
    setNewLocation,
    setLocationSuccessMessage,
    user,
    savedLocations,
    setSavedLocations,
    locationSuccessMessage,
  } = useDashboardContext();

  const { toast } = useToast();

  // Local state for form validation errors
  const [formError, setFormError] = useState("");

  // Use the consolidated Google Places hook
  const {
    isReady,
    isSearching,
    searchResults,
    showResults,
    searchError,
    hasSearched,
    isAutofilled,
    isGettingLocation,
    handleSearch,
    handlePlaceSelect,
    handleGetCurrentLocation,
    handleClearSearch,
  } = useGooglePlaces({
    toast,
    onLocationUpdate: (locationData) => {
      setNewLocation(prev => ({
        ...prev,
        ...locationData
      }));
    }
  });

  const [isLocationFocused, setIsLocationFocused] = React.useState(false);
  const [hasUserTyped, setHasUserTyped] = React.useState(false);
  const locationInputRef = useRef(null);

  React.useEffect(() => {
    if (!newLocation.address) {
      handleClearSearch();
      setHasUserTyped(false);
    }
  }, [newLocation.address, handleClearSearch]);

  // Reset hasUserTyped when modal opens/closes or when switching between add/edit
  React.useEffect(() => {
    setHasUserTyped(false);
  }, [editingLocationId, showAddLocationModal]);

  // Custom handlers that work with the hook
  const onSearchClick = () => handleSearch(newLocation.address);
  const onPlaceSelectClick = (prediction) => handlePlaceSelect(prediction);
  const onGetLocationClick = () => handleGetCurrentLocation();
  const onClearClick = () => {
    setNewLocation(prev => ({ ...prev, address: "" }));
    setHasUserTyped(true); // User has interacted, so show search button next time
    handleClearSearch();
  };

  const handleAddLocation = async (e) => {
    e.preventDefault();
    if (!user?.uid) return;
    if (!newLocation.name.trim() || !newLocation.address.trim()) {
      setFormError("Please fill out both location name and address.");
      return;
    }
    const cleanLocation = {
      name: newLocation.name,
      address: newLocation.address,
      ...(newLocation.placeId && { placeId: newLocation.placeId }),
      ...(typeof newLocation.lat === 'number' && { lat: newLocation.lat }),
      ...(typeof newLocation.lng === 'number' && { lng: newLocation.lng }),
      ...(newLocation.premise && { premise: newLocation.premise }),
      ...(newLocation.route && { route: newLocation.route }),
      ...(newLocation.neighborhood && { neighborhood: newLocation.neighborhood }),
      ...(newLocation.sublocality && { sublocality: newLocation.sublocality }),
      ...(newLocation.city && { city: newLocation.city }),
      ...(newLocation.state && { state: newLocation.state }),
      ...(newLocation.pinCode && { pinCode: newLocation.pinCode })
    };
    try {
      if (editingLocationId) {
        const updatedLocations = savedLocations.map((loc) =>
          loc.id === editingLocationId ? { ...loc, ...cleanLocation } : loc
        );
        await updateSavedLocations(user.uid, updatedLocations);
        setSavedLocations(updatedLocations);
        setLocationSuccessMessage(`Location "${newLocation.name}" updated successfully!`);
        toast({
          title: "Location updated!",
          description: `Location \"${newLocation.name}\" updated successfully!`,
          variant: "success"
        });
      } else {
        const newLocationItem = {
          id: Date.now().toString(),
          ...cleanLocation,
        };
        await addSavedLocation(user.uid, newLocationItem);
        setSavedLocations([...savedLocations, newLocationItem]);
        setLocationSuccessMessage(`Location "${newLocation.name}" added successfully!`);
        toast({
          title: "Location added!",
          description: `Location \"${newLocation.name}\" added successfully!`,
          variant: "success"
        });
      }
      setShowAddLocationModal(false);
      setEditingLocationId(null);
      setNewLocation({ name: "", address: "" });
      setFormError("");
      setTimeout(() => setLocationSuccessMessage(""), 5000);
    } catch (error) {
      console.error("Error saving location:", error);
      let errorMsg = "Could not save location. Please try again.";
      if (error && error.message) {
        errorMsg += `\n${error.message}`;
      }
      setFormError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive"
      });
    }
  };

  // Unified close handler
  const handleCloseModal = () => {
    setShowAddLocationModal(false);
    setEditingLocationId(null);
    setNewLocation({ name: "", address: "" });
    setLocationSuccessMessage("");
    setFormError("");
    handleClearSearch();
  };

  if (!showAddLocationModal) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => {
        if (e.target === e.currentTarget) {
          handleCloseModal();
        }
      }}
    >
      <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transition-all duration-200 ${showResults && searchResults.length > 0 ? 'min-h-[500px] sm:min-h-[500px] min-h-[60vh]' : 'min-h-[400px] sm:min-h-[400px] min-h-[40vh]'}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#1F2937]">
              {editingLocationId ? "Edit Location" : "Add New Location"}
            </h2>
            <button
              onClick={handleCloseModal}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <form onSubmit={handleAddLocation} className="space-y-4">
            <div>
              <label htmlFor="location-name" className="block text-sm font-medium text-[#1F2937] mb-2">
                Location Name
              </label>
              <Input
                id="location-name"
                value={newLocation.name}
                onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                placeholder="e.g. Home, Office, etc."
                className="h-10 border-gray-300 focus:border-[#4F46E5] focus:ring-0"
                required
              />
            </div>
            <div>
              <label htmlFor="location-address" className="block text-sm font-medium text-[#1F2937] mb-2">
                Address
              </label>
              <div className="relative">
                <LocationButton
                  isLoading={isGettingLocation}
                  onClick={onGetLocationClick}
                  className="absolute left-2 top-1/2 -translate-y-1/2 !p-1 !w-5 !h-5"
                  style={{ minWidth: 28, minHeight: 28 }}
                />
                <input
                  type="text"
                  id="location-address"
                  value={newLocation.address}
                  onChange={(e) => {
                    setNewLocation({ ...newLocation, address: e.target.value });
                    setHasUserTyped(true); // User has started typing
                  }}
                  placeholder="Enter address"
                  className={clsx(
                    "pl-14 pr-12 h-12 w-full border-2 focus:border-[#4F46E5] focus:ring-0 outline-none rounded-md",
                    searchError || formError ? "border-red-500 bg-red-50" : "border-gray-300"
                  )}
                  ref={locationInputRef}
                  autoComplete="off"
                  onFocus={() => {
                    setIsLocationFocused(true);
                  }}
                  onBlur={() => setIsLocationFocused(false)}
                  onKeyDown={e => {
                    if (
                      e.key === "Enter" &&
                      newLocation.address.trim() &&
                      !isSearching &&
                      newLocation.address.trim().length >= 5
                    ) {
                      e.preventDefault();
                      onSearchClick();
                    }
                  }}
                  required
                />
                {/* Show X (clear) button when editing initially, then switch to search button after user types or clears */}
                {newLocation.address.trim() && !isSearching && newLocation.address.trim().length >= 5 && (
                  editingLocationId && !hasUserTyped && !isAutofilled ? (
                    <SearchButton
                      isLoading={false}
                      showClear={true}
                      onClick={onClearClick}
                      onClear={onClearClick}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      aria-label="Clear address"
                      tabIndex={0}
                    />
                  ) : (
                    <SearchButton
                      isLoading={false}
                      showClear={isAutofilled || showResults}
                      onClick={onSearchClick}
                      onClear={onClearClick}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      aria-label={(isAutofilled || showResults) ? "Clear address" : "Search address"}
                      tabIndex={0}
                    />
                  )
                )}
                {newLocation.address.trim() && isSearching && (
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400"
                    aria-label="Loading"
                    disabled
                  >
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </button>
                )}
                <LocationDropdown
                  results={searchResults}
                  show={showResults}
                  onSelect={onPlaceSelectClick}
                  inputRef={locationInputRef}
                />
              </div>
              {isLocationFocused && !searchError && !formError && (
                <p className="text-blue-600 text-sm mt-1">
                  Click on the location icon for automatic fetching or enter at least 5 characters to search.
                </p>
              )}
              {(searchError || formError) && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {searchError || formError}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
                className="border-gray-300"
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white">
                {editingLocationId ? "Update Location" : "Add Location"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
