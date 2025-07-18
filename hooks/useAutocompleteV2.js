import { useCallback, useRef, useEffect } from "react";

/**
 * Modern React hook for Google Places Autocomplete using @googlemaps/places SDK
 * Replaces legacy window.google.maps.places.* APIs
 * 
 * @param {Object} params
 * @param {boolean} params.isLoaded - Google Maps API load status
 * @param {string} params.inputValue - Current input value for predictions
 * @param {Object} params.sessionTokenRef - React ref to hold session token
 * @returns {Object} { fetchPredictions, fetchPlaceDetails, isReady }
 */
export default function useAutocompleteV2({ isLoaded, inputValue, sessionTokenRef }) {
  const isInitialized = useRef(false);

  // Initialize the Places API when loaded
  useEffect(() => {
    const initializePlacesAPI = async () => {
      if (!isLoaded || isInitialized.current || !window.google?.maps) return;
      try {
        // Import the Places API library using the new dynamic import
        const { AutocompleteSessionToken } = await window.google.maps.importLibrary("places");
        // Initialize session token if not exists
        if (!sessionTokenRef.current) {
          sessionTokenRef.current = new AutocompleteSessionToken();
        }
        isInitialized.current = true;
        console.log("Places API initialized successfully (new API)");
      } catch (error) {
        console.error("Failed to initialize Places API:", error);
      }
    };
    initializePlacesAPI();
  }, [isLoaded, sessionTokenRef]);

  /**
   * Fetch autocomplete predictions using the Places AutocompleteService
   * @param {string} customInput - Optional custom input (defaults to inputValue)
   * @returns {Promise<Array>} Array of prediction objects
   */
  const fetchPredictions = useCallback(async (customInput = null) => {
    const query = customInput || inputValue;
    if (!isInitialized.current || !window.google?.maps?.places || !query || query.length < 3) {
      return [];
    }
    try {
      // Define location bias for India/Gurgaon area
      const locationBias = {
        west: 76.5,
        south: 28.0,
        east: 77.5,
        north: 28.8
      };
      const request = {
        input: query,
        sessionToken: sessionTokenRef.current,
        locationBias,
        // componentRestrictions is not supported in the new API
      };
      console.log("Fetching predictions (new API) for:", query, "with request:", request);
      const { suggestions } = await window.google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
      // Each suggestion has a placePrediction property
      return suggestions.map(s => s.placePrediction);
    } catch (error) {
      console.error("Error fetching predictions (new API):", error);
      return [];
    }
  }, [inputValue]);

  /**
   * Fetch detailed place information using place ID
   * @param {string} placeId - The place ID from prediction
   * @returns {Promise<Object|null>} Place details object or null
   */
  const fetchPlaceDetails = useCallback(async (placeId) => {
    if (!isInitialized.current || !window.google?.maps?.places || !placeId) {
      return null;
    }
    try {
      // The new API expects a PlacePrediction object, not just a placeId
      // So fetchPredictions should be called first, and the correct prediction passed in
      // But for compatibility, we can search predictions for the matching placeId
      // (In your app, you should pass the full prediction object instead of just placeId)
      // For now, we fetch predictions for the current input and find the matching one
      const { suggestions } = await window.google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input: inputValue,
        sessionToken: sessionTokenRef.current,
      });
      const prediction = suggestions.map(s => s.placePrediction).find(p => p.placeId === placeId);
      if (!prediction) return null;
      const place = prediction.toPlace();
      // Only request supported fields for the new API
      await place.fetchFields({ fields: ["id", "displayName", "formattedAddress", "addressComponents", "location"] });
      // Transform to match your existing format
      return {
        place_id: place.id,
        name: place.displayName || "",
        formatted_address: place.formattedAddress || "",
        address_components: place.addressComponents || [],
        geometry: {
          location: {
            lat: () => place.location?.lat || 0,
            lng: () => place.location?.lng || 0
          }
        }
      };
    } catch (error) {
      console.error("Error fetching place details (new API):", error);
      return null;
    }
  }, [sessionTokenRef, inputValue]);

  /**
   * Reset session token manually (useful for clearing search state)
   */
  const resetSessionToken = useCallback(() => {
    if (window.google?.maps?.places?.AutocompleteSessionToken) {
      sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
    }
  }, [sessionTokenRef]);

  return {
    fetchPredictions,
    fetchPlaceDetails,
    resetSessionToken,
    isReady: isInitialized.current
  };
}
