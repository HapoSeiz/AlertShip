"use client"

import React, { createContext, useContext, useRef, useState, useEffect, useCallback } from "react";
import { useJsApiLoader } from "@react-google-maps/api";

const GooglePlacesContext = createContext();

// Move libraries array outside the provider to avoid re-creation and performance warning
const GOOGLE_MAPS_LIBRARIES = ["places"];

export function GooglePlacesProvider({ children }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const sessionTokenRef = useRef(null);
  const isInitialized = useRef(false);

  // Load Google Maps JS API
  const { isLoaded: mapsLoaded, loadError: mapsError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  // Initialize Places API session token
  useEffect(() => {
    if (!mapsLoaded || isInitialized.current || !window.google?.maps) return;
    try {
      const { AutocompleteSessionToken } = window.google.maps.places || {};
      if (AutocompleteSessionToken && !sessionTokenRef.current) {
        sessionTokenRef.current = new AutocompleteSessionToken();
      }
      isInitialized.current = true;
      setIsLoaded(true);
    } catch (error) {
      setLoadError(error);
    }
  }, [mapsLoaded]);

  // Utility: Reset session token
  const resetSessionToken = useCallback(() => {
    if (window.google?.maps?.places?.AutocompleteSessionToken) {
      sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
    }
  }, []);

  // Utility: Autocomplete predictions
  const fetchPredictions = useCallback(async (input) => {
    console.log('[GooglePlacesContext] fetchPredictions called:', { input, isLoaded, google: !!window.google, maps: !!window.google?.maps, places: !!window.google?.maps?.places });
    if (!isLoaded) {
      console.warn('[GooglePlacesContext] fetchPredictions: isLoaded is false');
      return [];
    }
    if (!window.google?.maps?.places) {
      console.error('[GooglePlacesContext] fetchPredictions: window.google.maps.places is not available');
      return [];
    }
    if (!input || input.length < 3) {
      console.warn('[GooglePlacesContext] fetchPredictions: input too short or empty');
      return [];
    }
    try {
      if (!window.google.maps.places.AutocompleteSuggestion) {
        console.error('[GooglePlacesContext] fetchPredictions: AutocompleteSuggestion API is not available');
        return [];
      }
      // Use a bounding box for India as locationRestriction (west, south, east, north)
      const request = {
        input,
        sessionToken: sessionTokenRef.current,
        locationRestriction: {
          west: 68.1097,
          south: 6.4627,
          east: 97.3954,
          north: 35.5133
        }
      };
      console.log('[GooglePlacesContext] fetchPredictions: Making request', request);
      const { suggestions } = await window.google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
      console.log('[GooglePlacesContext] fetchPredictions: Suggestions received', suggestions);
      return suggestions.map(s => s.placePrediction);
    } catch (error) {
      console.error('[GooglePlacesContext] fetchPredictions: Error occurred', error);
      return [];
    }
  }, [isLoaded]);

  // Utility: Place details
  // Accepts a placePrediction object (from suggestions), not just placeId
  const fetchPlaceDetails = useCallback(async (placePrediction) => {
    console.log('[GooglePlacesContext] fetchPlaceDetails called:', { placePrediction, isLoaded, google: !!window.google, maps: !!window.google?.maps, places: !!window.google?.maps?.places });
    if (!isLoaded) {
      console.warn('[GooglePlacesContext] fetchPlaceDetails: isLoaded is false');
      return null;
    }
    if (!window.google?.maps?.places) {
      console.error('[GooglePlacesContext] fetchPlaceDetails: window.google.maps.places is not available');
      return null;
    }
    if (!placePrediction) {
      console.warn('[GooglePlacesContext] fetchPlaceDetails: placePrediction is missing');
      return null;
    }
    try {
      const place = placePrediction.toPlace();
      await place.fetchFields({ fields: ["id", "displayName", "formattedAddress", "addressComponents", "location"] });
      console.log('[GooglePlacesContext] fetchPlaceDetails: Place details fetched', place);
      console.log('[GooglePlacesContext] place.location:', place.location);
      console.log('[GooglePlacesContext] place.location?.lat:', place.location?.lat);
      console.log('[GooglePlacesContext] place.location?.lng:', place.location?.lng);
      
      // Handle both property and function-based location access
      const getLatLng = (location) => {
        if (!location) return { lat: null, lng: null };
        
        // Try direct property access first (new API)
        if (typeof location.lat === 'number' && typeof location.lng === 'number') {
          return { lat: location.lat, lng: location.lng };
        }
        
        // Try function access (legacy API)
        if (typeof location.lat === 'function' && typeof location.lng === 'function') {
          return { lat: location.lat(), lng: location.lng() };
        }
        
        return { lat: null, lng: null };
      };
      
      const { lat: locationLat, lng: locationLng } = getLatLng(place.location);
      
      const placeData = {
        place_id: place.id,
        name: place.displayName || "",
        formatted_address: place.formattedAddress || "",
        address_components: place.addressComponents || [],
        geometry: {
          location: {
            lat: () => locationLat,
            lng: () => locationLng
          }
        }
      };
      
      console.log('[GooglePlacesContext] Returning place data:', placeData);
      return placeData;
    } catch (error) {
      console.error('[GooglePlacesContext] fetchPlaceDetails: Error occurred', error);
      return null;
    }
  }, [isLoaded]);

  // Utility: Geocode (address to lat/lng)
  const geocode = useCallback(async (address) => {
    if (!isLoaded || !window.google?.maps?.Geocoder) return null;
    return new Promise((resolve, reject) => {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === "OK" && results && results[0]) resolve(results[0]);
        else reject(status);
      });
    });
  }, [isLoaded]);

  // Utility: Reverse geocode (lat/lng to address)
  const reverseGeocode = useCallback(async (lat, lng) => {
    if (!isLoaded || !window.google?.maps?.Geocoder) return null;
    return new Promise((resolve, reject) => {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results && results[0]) resolve(results[0]);
        else reject(status);
      });
    });
  }, [isLoaded]);

  return (
    <GooglePlacesContext.Provider value={{
      isLoaded,
      loadError,
      fetchPredictions,
      fetchPlaceDetails,
      geocode,
      reverseGeocode,
      resetSessionToken,
      sessionTokenRef
    }}>
      {children}
    </GooglePlacesContext.Provider>
  );
}

export function useGooglePlaces() {
  return useContext(GooglePlacesContext);
}
