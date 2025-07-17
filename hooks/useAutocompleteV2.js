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
  const placesLibRef = useRef(null);
  const isInitialized = useRef(false);

  // Initialize the Places API when loaded
  useEffect(() => {
    const initializePlacesAPI = async () => {
      if (!isLoaded || isInitialized.current || !window.google?.maps) return;
      
      try {
        // Import the Places API library using the new dynamic import
        const { AutocompleteService, PlacesService, AutocompleteSessionToken } = await window.google.maps.importLibrary("places");
        
        placesLibRef.current = { AutocompleteService, PlacesService, AutocompleteSessionToken };
        
        // Initialize session token if not exists
        if (!sessionTokenRef.current) {
          sessionTokenRef.current = new AutocompleteSessionToken();
        }
        
        isInitialized.current = true;
        console.log("Places API initialized successfully");
      } catch (error) {
        console.error("Failed to initialize Places API:", error);
        placesLibRef.current = null;
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
    
    if (!placesLibRef.current || !query || query.length < 3) {
      return [];
    }

    const { AutocompleteService } = placesLibRef.current;

    try {
      // Define location bias for India/Gurgaon area
      const locationBias = new window.google.maps.LatLngBounds(
        new window.google.maps.LatLng(28.0, 76.5), // Southwest corner (Gurgaon area)
        new window.google.maps.LatLng(28.8, 77.5)  // Northeast corner
      );

      // Create autocomplete service
      const autocompleteService = new AutocompleteService();

      // Fetch autocomplete suggestions using the service
      const request = {
        input: query,
        // types removed for broader results (apartments, addresses, etc)
        componentRestrictions: { country: "IN" }, // Restrict to India
        bounds: locationBias,
        sessionToken: sessionTokenRef.current
      };

      console.log("Fetching predictions for:", query, "with request:", request);
      
      return new Promise((resolve) => {
        autocompleteService.getPlacePredictions(request, (predictions, status) => {
          console.log("AutocompleteService status:", status);
          console.log("Got predictions:", predictions);
          
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            resolve(predictions);
          } else {
            console.error("Error fetching predictions:", status);
            resolve([]);
          }
        });
      });
    } catch (error) {
      console.error("Error fetching predictions:", error);
      return [];
    }
  }, [inputValue]);

  /**
   * Fetch detailed place information using place ID
   * @param {string} placeId - The place ID from prediction
   * @returns {Promise<Object|null>} Place details object or null
   */
  const fetchPlaceDetails = useCallback(async (placeId) => {
    if (!placesLibRef.current || !placeId) {
      return null;
    }

    const { PlacesService, AutocompleteSessionToken } = placesLibRef.current;

    try {
      // Create a dummy element for PlacesService (required but not used)
      const dummyElement = document.createElement('div');
      
      // Create a PlacesService instance
      const placesService = new PlacesService(dummyElement);

      // Fetch place details with required fields
      const request = {
        placeId: placeId,
        fields: [
          'place_id',
          'name',
          'formatted_address',
          'address_components',
          'geometry'
        ],
        sessionToken: sessionTokenRef.current
      };

      return new Promise((resolve) => {
        placesService.getDetails(request, (place, status) => {
          // Create new session token for next search (billing optimization)
          if (placesLibRef.current?.AutocompleteSessionToken) {
            sessionTokenRef.current = new placesLibRef.current.AutocompleteSessionToken();
          }

          if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
            // Transform to match your existing format
            const transformedPlace = {
              place_id: place.place_id,
              name: place.name || "",
              formatted_address: place.formatted_address || "",
              address_components: place.address_components || [],
              geometry: {
                location: {
                  lat: () => place.geometry?.location?.lat() || 0,
                  lng: () => place.geometry?.location?.lng() || 0
                }
              }
            };

            resolve(transformedPlace);
          } else {
            console.error("Error fetching place details:", status);
            resolve(null);
          }
        });
      });
    } catch (error) {
      console.error("Error fetching place details:", error);
      
      // Create new session token even on error to avoid billing issues
      if (placesLibRef.current?.AutocompleteSessionToken) {
        sessionTokenRef.current = new placesLibRef.current.AutocompleteSessionToken();
      }
      
      return null;
    }
  }, [sessionTokenRef]);

  /**
   * Reset session token manually (useful for clearing search state)
   */
  const resetSessionToken = useCallback(() => {
    if (placesLibRef.current?.AutocompleteSessionToken) {
      sessionTokenRef.current = new placesLibRef.current.AutocompleteSessionToken();
    }
  }, [sessionTokenRef]);

  return {
    fetchPredictions,
    fetchPlaceDetails,
    resetSessionToken,
    isReady: isInitialized.current && !!placesLibRef.current
  };
}
