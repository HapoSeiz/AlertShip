import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Loader2 } from "lucide-react";
import LocationDropdown from "@/components/LocationDropdown";
import LocationButton from "@/components/ui/LocationButton";
import SearchButton from "@/components/ui/SearchButton";
import clsx from "clsx";
import { useDashboardContext } from "@/contexts/DashboardContext";
import { addSavedLocation } from "@/firebase/firestoreHelpers";
import { useGooglePlaces } from "@/contexts/GooglePlacesContext";
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
    setHasSearched,
    setIsAutofilled,
    setSearchResults,
    setShowResults,
    setSearchError,
    user,
    savedLocations,
    setSavedLocations,
    updateSavedLocations,
    locationSuccessMessage,
  } = useDashboardContext();

  const { toast } = useToast();

  const [searchResults, setSearchResultsLocal] = React.useState([]);
  const [showResults, setShowResultsLocal] = React.useState(false);
  const [isSearching, setIsSearching] = React.useState(false);
  const [isGettingLocation, setIsGettingLocation] = React.useState(false);
  const [searchError, setSearchErrorLocal] = React.useState("");
  const [isLocationFocused, setIsLocationFocused] = React.useState(false);
  const [hasSearched, setHasSearchedLocal] = React.useState(false);
  const [isAutofilled, setIsAutofilledLocal] = React.useState(false);
  const locationInputRef = useRef(null);
  const { isLoaded, fetchPredictions, fetchPlaceDetails, formatLocationAddress } = useGooglePlaces();
  const isReady = isLoaded;

  React.useEffect(() => {
    if (!newLocation.address) {
      setHasSearchedLocal(false);
      setIsAutofilledLocal(false);
      setSearchResultsLocal([]);
      setShowResultsLocal(false);
      setSearchErrorLocal("");
    }
  }, [newLocation.address]);

  const handleSearch = async () => {
    const query = newLocation.address.trim();
    if (query.length < 3) {
      setSearchErrorLocal("Please enter at least 3 characters to search");
      setShowResultsLocal(false);
      return;
    }
    if (!isReady) {
      setSearchErrorLocal("Places API is not ready. Please try again.");
      setShowResultsLocal(false);
      return;
    }
    setSearchErrorLocal("");
    setIsSearching(true);
    setShowResultsLocal(false);
    setHasSearchedLocal(true);
    try {
      const predictions = await fetchPredictions(query);
      setSearchResultsLocal(predictions);
      setShowResultsLocal(true);
    } catch (error) {
      setSearchErrorLocal("Failed to search places. Please try again.");
      setSearchResultsLocal([]);
      setShowResultsLocal(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePlaceSelect = async (prediction) => {
    setIsAutofilledLocal(true);
    setShowResultsLocal(false);
    try {
      const placeDetails = await fetchPlaceDetails(prediction);
      if (!placeDetails) throw new Error("No place details received");
      let lat = null, lng = null;
      if (placeDetails.geometry?.location) {
        lat = typeof placeDetails.geometry.location.lat === 'function'
          ? placeDetails.geometry.location.lat()
          : placeDetails.geometry.location.lat;
        lng = typeof placeDetails.geometry.location.lng === 'function'
          ? placeDetails.geometry.location.lng()
          : placeDetails.geometry.location.lng;
      }
      const formattedLocation = formatLocationAddress(placeDetails);
      const components = formattedLocation.components || {};
      const finalAddress = formattedLocation.address || placeDetails.formatted_address || placeDetails.name || "";
      setNewLocation(prev => ({
        ...prev,
        address: finalAddress,
        placeId: prediction.placeId,
        lat,
        lng,
        premise: components.premise || "",
        route: components.route || "",
        neighborhood: components.neighborhood || "",
        sublocality: components.sublocality || "",
        city: components.city || "",
        state: components.state || "",
        pinCode: components.pinCode || ""
      }));
    } catch (error) {
      const mainText = prediction.structuredFormat?.mainText?.text || prediction.text?.text || '';
      const secondaryText = prediction.structuredFormat?.secondaryText?.text || '';
      const fallbackAddress = secondaryText ? `${mainText}, ${secondaryText}` : mainText;
      setNewLocation(prev => ({
        ...prev,
        address: fallbackAddress,
        placeId: prediction.placeId,
        premise: "",
        route: "",
        neighborhood: "",
        sublocality: "",
        city: "",
        state: "",
        pinCode: ""
      }));
    }
  };

  const handleGetCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setSearchErrorLocal("Geolocation is not supported by this browser.");
      return;
    }
    setIsGettingLocation(true);
    setSearchErrorLocal("");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const geocoder = new window.google.maps.Geocoder();
          const response = await new Promise((resolve, reject) => {
            geocoder.geocode(
              { location: { lat: latitude, lng: longitude } },
              (results, status) => {
                if (status === "OK") resolve(results);
                else reject(new Error(`Geocoding failed: ${status}`));
              }
            );
          });
          if (response && response[0]) {
            const placeDetails = {
              name: "",
              formatted_address: response[0].formatted_address,
              address_components: response[0].address_components,
              types: response[0].types,
              geometry: {
                location: {
                  lat: latitude,
                  lng: longitude
                }
              }
            };
            const formattedLocation = formatLocationAddress(placeDetails);
            const components = formattedLocation.components || {};
            const finalAddress = formattedLocation.address || placeDetails.formatted_address || placeDetails.name || "";
            setNewLocation(prev => ({
              ...prev,
              address: finalAddress,
              lat: latitude,
              lng: longitude,
              premise: components.premise || "",
              route: components.route || "",
              neighborhood: components.neighborhood || "",
              sublocality: components.sublocality || "",
              city: components.city || "",
              state: components.state || "",
              pinCode: components.pinCode || ""
            }));
            setIsAutofilledLocal(true);
          }
        } catch (error) {
          setSearchErrorLocal("Could not determine your location address.");
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        setSearchErrorLocal("Could not access your location. Please enable location services.");
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  const handleClearSearch = () => {
    setNewLocation(prev => ({ ...prev, address: "" }));
    setSearchResultsLocal([]);
    setShowResultsLocal(false);
    setSearchErrorLocal("");
    setHasSearchedLocal(false);
    setIsAutofilledLocal(false);
  };

  const handleAddLocation = async (e) => {
    e.preventDefault();
    if (!user?.uid) return;
    if (!newLocation.name.trim() || !newLocation.address.trim()) {
      setSearchErrorLocal("Please fill out both location name and address.");
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
      setSearchErrorLocal("");
      setTimeout(() => setLocationSuccessMessage(""), 5000);
    } catch (error) {
      console.error("Error saving location:", error);
      let errorMsg = "Could not save location. Please try again.";
      if (error && error.message) {
        errorMsg += `\n${error.message}`;
      }
      setSearchErrorLocal(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive"
      });
    }
  };

  if (!showAddLocationModal) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => {
        if (e.target === e.currentTarget) {
          setShowAddLocationModal(false);
          setEditingLocationId(null);
          setNewLocation({ name: "", address: "" });
          setLocationSuccessMessage("");
          setHasSearchedLocal(false);
          setIsAutofilledLocal(false);
          setSearchResultsLocal([]);
          setShowResultsLocal(false);
          setSearchErrorLocal("");
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
              onClick={() => {
                setShowAddLocationModal(false);
                setEditingLocationId(null);
                setNewLocation({ name: "", address: "" });
                setLocationSuccessMessage("");
                setHasSearchedLocal(false);
                setIsAutofilledLocal(false);
                setSearchResultsLocal([]);
                setShowResultsLocal(false);
                setSearchErrorLocal("");
              }}
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
                  onClick={handleGetCurrentLocation}
                  className="absolute left-2 top-1/2 -translate-y-1/2 !p-1 !w-5 !h-5"
                  style={{ minWidth: 28, minHeight: 28 }}
                />
                <input
                  type="text"
                  id="location-address"
                  value={newLocation.address}
                  onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                  placeholder="Enter address"
                  className={clsx(
                    "pl-14 pr-12 h-12 w-full border-2 focus:border-[#4F46E5] focus:ring-0 outline-none rounded-md",
                    searchError ? "border-red-500 bg-red-50" : "border-gray-300"
                  )}
                  ref={locationInputRef}
                  autoComplete="off"
                  onFocus={() => {
                    setIsLocationFocused(true);
                    setSearchErrorLocal("");
                  }}
                  onBlur={() => setIsLocationFocused(false)}
                  onKeyDown={e => {
                    if (
                      e.key === "Enter" &&
                      newLocation.address.trim() &&
                      !isSearching &&
                      newLocation.address.trim().length >= 3
                    ) {
                      e.preventDefault();
                      handleSearch();
                    }
                  }}
                  required
                />
                {newLocation.address.trim() && !isSearching && newLocation.address.trim().length >= 3 && (
                  <SearchButton
                    isLoading={false}
                    showClear={isAutofilled || showResults}
                    onClick={(isAutofilled || showResults) ? handleClearSearch : handleSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    aria-label={(isAutofilled || showResults) ? "Clear address" : "Search address"}
                    tabIndex={0}
                  />
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
                  onSelect={handlePlaceSelect}
                  inputRef={locationInputRef}
                />
              </div>
              {isLocationFocused && !searchError && (
                <p className="text-blue-600 text-sm mt-1">
                  Click on the location icon for automatic fetching or enter at least 3 characters to search.
                </p>
              )}
              {searchError && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {searchError}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddLocationModal(false);
                  setEditingLocationId(null);
                  setNewLocation({ name: "", address: "" });
                  setLocationSuccessMessage("");
                  setHasSearchedLocal(false);
                  setIsAutofilledLocal(false);
                  setSearchResultsLocal([]);
                  setShowResultsLocal(false);
                  setSearchErrorLocal("");
                }}
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
