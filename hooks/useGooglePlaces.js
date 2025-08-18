import { useState, useCallback } from "react";
import { useGooglePlaces as useGooglePlacesContext } from "@/contexts/GooglePlacesContext";
import { formatLocationAddress } from "@/lib/formatLocationAddress";

/**
 * Custom hook that provides all Google Places and location-related functionality
 * Consolidates logic from AddLocationModal and useReportForm for better reusability
 */
export function useGooglePlaces({ toast, onLocationUpdate, onFocusNext } = {}) {
  // State for search functionality
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [isAutofilled, setIsAutofilled] = useState(false);

  // State for geolocation functionality
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Get context methods
  const {
    isLoaded,
    fetchPredictions,
    fetchPlaceDetails,
  } = useGooglePlacesContext();

  const isReady = isLoaded;

  // Search for places using Google Places API
  const handleSearch = useCallback(async (query) => {
    if (!query || query.trim().length < 3) {
      setSearchError("Please enter at least 3 characters to search");
      setShowResults(false);
      return;
    }

    if (!isReady) {
      setSearchError("Places API is not ready. Please try again.");
      setShowResults(false);
      return;
    }

    setSearchError("");
    setIsSearching(true);
    setShowResults(false);
    setHasSearched(true);

    try {
      const predictions = await fetchPredictions(query.trim());
      setSearchResults(predictions);
      setShowResults(true);
    } catch (error) {
      console.error("Search error:", error);
      setSearchError("Failed to search places. Please try again.");
      setSearchResults([]);
      setShowResults(false);
    } finally {
      setIsSearching(false);
    }
  }, [fetchPredictions, isReady]);

  // Handle place selection from search results
  const handlePlaceSelect = useCallback(async (prediction, options = {}) => {
    const { preserveBrowserCoords = false, focusNextRef } = options;
    setIsAutofilled(true);
    setShowResults(false);

    try {
      const placeDetails = await fetchPlaceDetails(prediction);
      if (!placeDetails) throw new Error("No place details received");

      // Extract coordinates
      let lat = null, lng = null;
      if (placeDetails.geometry?.location) {
        lat = typeof placeDetails.geometry.location.lat === 'function'
          ? placeDetails.geometry.location.lat()
          : placeDetails.geometry.location.lat;
        lng = typeof placeDetails.geometry.location.lng === 'function'
          ? placeDetails.geometry.location.lng()
          : placeDetails.geometry.location.lng;
        
        // Ensure coordinates are valid numbers
        lat = typeof lat === 'number' && !isNaN(lat) ? lat : null;
        lng = typeof lng === 'number' && !isNaN(lng) ? lng : null;
        
        console.log("Extracted coordinates from place details:", { lat, lng });
      }

      // Use only formatLocationAddress for all address fields
      const formattedLocation = formatLocationAddress(placeDetails);
      const components = formattedLocation.components || {};
      const finalAddress = formattedLocation.address || placeDetails.formatted_address || placeDetails.name || "";

      // Prepare location data using only components
      const locationData = {
        address: finalAddress,
        placeId: prediction.placeId,
        lat: preserveBrowserCoords ? undefined : lat,
        lng: preserveBrowserCoords ? undefined : lng,
        premise: components.premise || "",
        route: components.route || "",
        neighborhood: components.neighborhood || "",
        sublocality: components.sublocality || "",
        city: components.city || "",
        state: components.state || "",
        pinCode: components.pinCode || "",
        locality: components.locality || "",
        locationSource: preserveBrowserCoords ? undefined : 'search'
      };

      console.log("Location data being passed to onLocationUpdate:", locationData);

      // Call update callback if provided
      if (onLocationUpdate) {
        onLocationUpdate(locationData, { preserveBrowserCoords });
      }

      // Focus next field if provided
      if (focusNextRef && onFocusNext) {
        setTimeout(() => onFocusNext(focusNextRef), 0);
      }

      return locationData;
    } catch (error) {
      console.error("Error selecting place:", error);

      // Fallback with basic data
      const mainText = prediction.structuredFormat?.mainText?.text || prediction.text?.text || '';
      const secondaryText = prediction.structuredFormat?.secondaryText?.text || '';
      const fallbackAddress = secondaryText ? `${mainText}, ${secondaryText}` : mainText;

      console.log("Using fallback data with coordinates:", { lat, lng });

      const fallbackData = {
        address: fallbackAddress,
        placeId: prediction.placeId,
        lat: preserveBrowserCoords ? undefined : lat,
        lng: preserveBrowserCoords ? undefined : lng,
        premise: "",
        route: "",
        neighborhood: "",
        sublocality: "",
        city: "",
        state: "",
        pinCode: "",
        locality: fallbackAddress,
        locationSource: preserveBrowserCoords ? undefined : 'search'
      };

      if (onLocationUpdate) {
        onLocationUpdate(fallbackData, { preserveBrowserCoords });
      }

      if (toast) {
        toast({
          title: "Error",
          description: "Failed to get place details. Please try again.",
          variant: "destructive",
        });
      }

      return fallbackData;
    }
  }, [fetchPlaceDetails, formatLocationAddress, onLocationUpdate, onFocusNext, toast]);

  // Get current location using browser geolocation
  const handleGetCurrentLocation = useCallback((options = {}) => {
    const { focusNextRef, preserveCoordinates = true } = options;

    if (toast) {
      toast({ 
        title: "Getting your location...", 
        description: "Attempting to fetch your current location.", 
        variant: "default" 
      });
    }

    if (!navigator.geolocation) {
      const errorMsg = "Geolocation is not supported by this browser.";
      setSearchError(errorMsg);
      if (toast) {
        toast({
          title: "Geolocation not supported",
          description: "Your browser doesn't support geolocation.",
          variant: "destructive",
        });
      }
      return;
    }

    setIsGettingLocation(true);
    setSearchError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Use Google Maps Geocoder for reverse geocoding
          if (window.google && window.google.maps && window.google.maps.Geocoder) {
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
              const place = response[0];
              // Create place details object
              const placeDetails = {
                name: "",
                formatted_address: place.formatted_address,
                address_components: place.address_components,
                types: place.types,
                geometry: {
                  location: {
                    lat: latitude,
                    lng: longitude
                  }
                }
              };

              // Use only formatLocationAddress for all address fields
              const formattedLocation = formatLocationAddress(placeDetails);
              const components = formattedLocation.components || {};
              const finalAddress = formattedLocation.address || place.formatted_address || "";

              // Prepare location data using only components
              const locationData = {
                address: finalAddress,
                lat: preserveCoordinates ? latitude : undefined,
                lng: preserveCoordinates ? longitude : undefined,
                premise: components.premise || "",
                route: components.route || "",
                neighborhood: components.neighborhood || "",
                sublocality: components.sublocality || "",
                city: components.city || "",
                state: components.state || "",
                pinCode: components.pinCode || "",
                // For report form compatibility
                locality: components.locality || components.premise || finalAddress,
                locationSource: 'browser',
                browserLat: latitude,
                browserLng: longitude
              };

              setIsAutofilled(true);

              // Call update callback if provided
              if (onLocationUpdate) {
                onLocationUpdate(locationData, { fromGeolocation: true });
              }

              // Focus next field if provided
              if (focusNextRef && onFocusNext) {
                setTimeout(() => onFocusNext(focusNextRef), 0);
              }

              if (toast) {
                toast({
                  title: "Location found!",
                  description: "Your location has been automatically filled in.",
                  variant: "success",
                });
              }

              return locationData;
            }
          } else {
            // Fallback when Google Maps API is not loaded
            const locationData = {
              lat: preserveCoordinates ? latitude : undefined,
              lng: preserveCoordinates ? longitude : undefined,
              locationSource: 'browser',
              browserLat: latitude,
              browserLng: longitude
            };

            if (onLocationUpdate) {
              onLocationUpdate(locationData, { fromGeolocation: true });
            }

            if (toast) {
              toast({
                title: "Location saved",
                description: "Your coordinates have been saved, but Google Maps is not loaded for address lookup.",
                variant: "default",
              });
            }

            return locationData;
          }
        } catch (error) {
          console.error("Geocoding error:", error);
          setSearchError("Could not determine your location address.");
          if (toast) {
            toast({
              title: "Address not found",
              description: "Could not get address details for your location.",
              variant: "destructive",
            });
          }
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        setIsGettingLocation(false);
        let errorMessage = "Could not get your location.";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location permissions.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }

        setSearchError(errorMessage);
        console.error("Geolocation error", error);
        
        if (toast) {
          toast({
            title: "Location error",
            description: errorMessage,
            variant: "destructive",
          });
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  }, [formatLocationAddress, onLocationUpdate, onFocusNext, toast]);

  // Clear search results and reset state
  const handleClearSearch = useCallback(() => {
    setSearchResults([]);
    setShowResults(false);
    setSearchError("");
    setHasSearched(false);
    setIsAutofilled(false);
  }, []);

  // Reset all state (useful for form resets)
  const resetState = useCallback(() => {
    setIsSearching(false);
    setSearchResults([]);
    setShowResults(false);
    setSearchError("");
    setHasSearched(false);
    setIsAutofilled(false);
    setIsGettingLocation(false);
  }, []);

  return {
    // State
    isLoaded,
    isReady,
    isSearching,
    searchResults,
    showResults,
    searchError,
    hasSearched,
    isAutofilled,
    isGettingLocation,

    // Methods
    handleSearch,
    handlePlaceSelect,
    handleGetCurrentLocation,
    handleClearSearch,
    resetState,

    // Context methods (for backward compatibility)
    fetchPredictions,
    fetchPlaceDetails,
    formatLocationAddress: useCallback((placeDetails) => {
      return formatLocationAddress(placeDetails);
    }, []),
  };
}
