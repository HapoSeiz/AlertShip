import { useEffect, useRef, useCallback } from "react";

export default function useAutocomplete({
  isLoaded,
  inputRef,
  onPlaceSelected,
  sessionTokenRef,
  inputKey,
  manualTrigger = false
}) {
  const autocompleteInstanceRef = useRef(null);
  const serviceRef = useRef(null);

  const initializeService = useCallback(() => {
    if (!isLoaded || !window.google?.maps?.places) return;
    
    if (!serviceRef.current) {
      serviceRef.current = new window.google.maps.places.AutocompleteService();
      sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
    }
  }, [isLoaded, sessionTokenRef]);

  const searchPlaces = useCallback((query, callback) => {
    if (!serviceRef.current || !query || query.length < 3) {
      callback([]);
      return;
    }

    serviceRef.current.getPlacePredictions({
      input: query,
      types: ["geocode"],
      componentRestrictions: { country: "in" },
      sessionToken: sessionTokenRef.current
    }, (predictions, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
        callback(predictions);
      } else {
        callback([]);
      }
    });
  }, [sessionTokenRef]);

  const getPlaceDetails = useCallback((placeId, callback) => {
    if (!window.google?.maps?.places) return;
    
    const placesService = new window.google.maps.places.PlacesService(document.createElement('div'));
    placesService.getDetails({
      placeId: placeId,
      fields: ['address_components', 'name'],
      sessionToken: sessionTokenRef.current
    }, (place, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
        callback(place);
        // Create new session token for next search
        sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
      }
    });
  }, [sessionTokenRef]);

  useEffect(() => {
    if (!manualTrigger) {
      // Original autocomplete behavior for backward compatibility
      if (!isLoaded || !inputRef.current) return;
      const input = inputRef.current;
      if (!autocompleteInstanceRef.current) {
        sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
        const autocomplete = new window.google.maps.places.Autocomplete(input, {
          types: ["geocode"],
          componentRestrictions: { country: "in" },
          sessionToken: sessionTokenRef.current
        });
        autocompleteInstanceRef.current = autocomplete;
        input._autocomplete = autocomplete;
        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          onPlaceSelected(place);
          sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
          autocomplete.setOptions({ sessionToken: sessionTokenRef.current });
        });
        input.addEventListener("focus", () => {
          sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
          autocompleteInstanceRef.current.setOptions({ sessionToken: sessionTokenRef.current });
        });
        input.addEventListener("blur", () => {
          sessionTokenRef.current = null;
        });
      }
    } else {
      // Manual trigger mode - just initialize the service
      initializeService();
    }
    // eslint-disable-next-line
  }, [isLoaded, inputKey, manualTrigger]);

  return manualTrigger ? { searchPlaces, getPlaceDetails } : {};
}
