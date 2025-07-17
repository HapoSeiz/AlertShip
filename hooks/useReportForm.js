import { useState, useRef, useEffect, useCallback } from "react";
import useFormValidation from "@/components/report/useFormValidation";
import useAutocompleteV2 from "@/hooks/useAutocompleteV2";

export function useReportForm({ user, toast, router, isLoaded }) {
  const [formData, setFormData] = useState({
    issue: { type: "electricity", description: "" },
    location: { locality: "", city: "", state: "", pinCode: "" },
    lat: null,
    lng: null,
    user: { photo: null },
    locationSource: null, // 'browser' or 'search'
    browserLat: null, // preserve browser lat/lng if set
    browserLng: null,
  });
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localityInputKey, setLocalityInputKey] = useState(Date.now());
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const localityInputRef = useRef(null);
  const autocompleteSessionTokenRef = useRef(null);
  const { formErrors, setFormErrors, validate } = useFormValidation(formData);
  const abortControllerRef = useRef(null);

  // Google Places Autocomplete V2 (modern SDK)
  const { fetchPredictions, fetchPlaceDetails, isReady } = useAutocompleteV2({
    isLoaded,
    inputValue: formData.location.locality,
    sessionTokenRef: autocompleteSessionTokenRef
  });

  // Handle search functionality with modern Places API
  const handleSearch = useCallback(async () => {
    console.log("handleSearch called!");
    console.log("formData.location.locality:", formData.location.locality);
    console.log("fetchPredictions:", fetchPredictions);
    console.log("isReady:", isReady);
    
    const query = formData.location.locality.trim();
    
    if (query.length < 3) {
      console.log("Query too short:", query);
      setSearchError("Please enter at least 3 characters to search");
      setShowResults(false);
      return;
    }

    if (!isReady) {
      console.log("Places API not ready yet");
      setSearchError("Places API is not ready. Please try again.");
      setShowResults(false);
      return;
    }

    setSearchError("");
    setIsSearching(true);
    setShowResults(false);

    try {
      console.log("Calling fetchPredictions with query:", query);
      const predictions = await fetchPredictions(query);
      console.log("Received predictions:", predictions);
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
  }, [formData.location.locality, fetchPredictions, isReady]);

  // Handle clearing search
  const handleClearSearch = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      location: { ...prev.location, locality: "" },
      lat: null,
      lng: null,
      locationSource: null,
      browserLat: null,
      browserLng: null,
    }));
    setSearchResults([]);
    setShowResults(false);
    setSearchError("");
    if (formErrors.locality) {
      setFormErrors((prev) => ({ ...prev, locality: null }));
    }
  }, [formErrors.locality, setFormErrors]);

  // Handle place selection from results with modern Places API
  const handlePlaceSelect = useCallback(async (prediction) => {
    if (!fetchPlaceDetails) return;

    try {
      const place = await fetchPlaceDetails(prediction.place_id);
      
      if (!place?.address_components) return;

      const getComponent = (type) => {
        const comp = place.address_components.find((c) => c.types.includes(type));
        return comp ? comp.long_name : "";
      };
      
      const getAllComponents = (type) => {
        return place.address_components
          ? place.address_components.filter((c) => c.types.includes(type)).map((c) => c.long_name)
          : [];
      };
      

      // Priority: premise > neighborhood > others
      const premise = getComponent("premise");
      const neighborhood = getComponent("neighborhood");
      const allSublocalities = [
        ...getAllComponents("sublocality"),
        ...getAllComponents("sublocality_level_1"),
        ...getAllComponents("sublocality_level_2"),
        ...getAllComponents("sublocality_level_3"),
        ...getAllComponents("sublocality_level_4"),
      ];
      let sector = allSublocalities.find((part) => /^Sector\s*\d+/i.test(part));
      let subCity = allSublocalities.find((part) => part && !/^Sector\s*\d+/i.test(part));
      let route = getComponent("route");
      let fallback = place.name || "";

      let locality = "";
      if (premise) {
        locality = premise;
      } else if (neighborhood) {
        locality = neighborhood;
      } else if (sector && subCity) {
        locality = `${sector}, ${subCity}`;
      } else if (sector) {
        locality = sector;
      } else if (subCity) {
        locality = subCity;
      } else if (route) {
        locality = route;
      } else {
        locality = fallback;
      }
      
      let city = getComponent("locality");
      if (!city) city = getComponent("administrative_area_level_2");
      if (!city) city = getComponent("administrative_area_level_1");
      
      const pinCode = getComponent("postal_code");
      
      // Get coordinates from the place details
      const lat = place.geometry?.location?.lat ? place.geometry.location.lat() : null;
      const lng = place.geometry?.location?.lng ? place.geometry.location.lng() : null;
      
      setFormData((prev) => {
        // Only update lat/lng if not in browser geolocation mode
        if (prev.locationSource === 'browser') {
          return {
            ...prev,
            location: {
              ...prev.location,
              locality,
              city: city || prev.location.city,
              state: getComponent("administrative_area_level_1") || prev.location.state,
              pinCode: pinCode || "",
            },
            // lat/lng remain as browser values
          };
        } else {
          return {
            ...prev,
            location: {
              ...prev.location,
              locality,
              city: city || prev.location.city,
              state: getComponent("administrative_area_level_1") || prev.location.state,
              pinCode: pinCode || "",
            },
            lat: lat || prev.lat,
            lng: lng || prev.lng,
            locationSource: 'search',
          };
        }
      });
      
      setShowResults(false);
      setSearchResults([]);
    } catch (error) {
      console.error("Error selecting place:", error);
      toast({
        title: "Error",
        description: "Failed to get place details. Please try again.",
        variant: "destructive",
      });
    }
  }, [fetchPlaceDetails, toast]);

  // Get current location using geolocation API
  const handleGetCurrentLocation = useCallback(() => {
    toast({ title: "Getting your location...", description: "Attempting to fetch your current location.", variant: "default" });
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive",
      });
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // Always preserve browser coordinates
        setFormData((prev) => ({
          ...prev,
          lat: latitude,
          lng: longitude,
          browserLat: latitude,
          browserLng: longitude,
          locationSource: 'browser',
        }));

        // Use reverse geocoding to get address components, but DO NOT overwrite lat/lng
        if (window.google && window.google.maps && window.google.maps.Geocoder) {
          try {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode(
              { location: { lat: latitude, lng: longitude } },
              (results, status) => {
                setIsGettingLocation(false);
                if (status === "OK" && results && results.length > 0) {
                  const place = results[0];
                  const getComponent = (type) => {
                    const comp = place.address_components.find((c) => c.types.includes(type));
                    return comp ? comp.long_name : "";
                  };
                  const getAllComponents = (type) => {
                    return place.address_components
                      ? place.address_components.filter((c) => c.types.includes(type)).map((c) => c.long_name)
                      : [];
                  };
                  // Robust priority: premise > street_number+route > neighborhood > sector+subCity > sector > subCity > route > sublocality > neighborhood
                  // If multiple premises, pick the closest (first in address_components)
                  const allPremises = getAllComponents("premise");
                  const premise = allPremises.length > 0 ? allPremises[0] : "";
                  const streetNumber = getComponent("street_number");
                  const route = getComponent("route");
                  const neighborhood = getComponent("neighborhood");
                  const allSublocalities = [
                    ...getAllComponents("sublocality"),
                    ...getAllComponents("sublocality_level_1"),
                    ...getAllComponents("sublocality_level_2"),
                    ...getAllComponents("sublocality_level_3"),
                    ...getAllComponents("sublocality_level_4"),
                  ];
                  let sector = allSublocalities.find((part) => /^Sector\s*\d+/i.test(part));
                  let subCity = allSublocalities.find((part) => part && !/^Sector\s*\d+/i.test(part));
                  let locality = "";
                  if (premise) {
                    locality = premise;
                  } else if (streetNumber && route) {
                    locality = `${streetNumber} ${route}`;
                  } else if (neighborhood) {
                    locality = neighborhood;
                  } else if (sector && subCity) {
                    locality = `${sector}, ${subCity}`;
                  } else if (sector) {
                    locality = sector;
                  } else if (subCity) {
                    locality = subCity;
                  } else if (route) {
                    locality = route;
                  } else {
                    locality = getComponent("sublocality") || getComponent("neighborhood") || "";
                  }
                  let city = getComponent("locality");
                  if (!city) city = getComponent("administrative_area_level_2");
                  if (!city) city = getComponent("administrative_area_level_1");
                  const pinCode = getComponent("postal_code");
                  const state = getComponent("administrative_area_level_1");
                  setFormData((prev) => ({
                    ...prev,
                    // DO NOT overwrite lat/lng here
                    location: {
                      ...prev.location,
                      locality: locality || prev.location.locality,
                      city: city || prev.location.city,
                      state: state || prev.location.state,
                      pinCode: pinCode || prev.location.pinCode,
                    },
                  }));
                  toast({
                    title: "Location found!",
                    description: "Your location has been automatically filled in.",
                    variant: "success",
                  });
                } else {
                  console.error("Geocoder failed or returned no results", status, results);
                  toast({
                    title: "Address not found",
                    description: `Could not get address details for your location. Status: ${status}`,
                    variant: "destructive",
                  });
                }
              }
            );
          } catch (err) {
            setIsGettingLocation(false);
            console.error("Error using Google Maps Geocoder", err);
            toast({
              title: "Geocoder error",
              description: "An error occurred while using Google Maps Geocoder.",
              variant: "destructive",
            });
          }
        } else {
          setIsGettingLocation(false);
          console.error("Google Maps API or Geocoder not loaded", window.google);
          toast({
            title: "Location saved",
            description: "Your coordinates have been saved, but Google Maps is not loaded for address lookup.",
            variant: "default",
          });
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
        console.error("Geolocation error", error);
        toast({
          title: "Location error",
          description: errorMessage,
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  }, [toast]);

  // Google Places Autocomplete (remove old implementation)
  // useAutocomplete({...}) - removed

  // Remove photo
  const handleRemovePhoto = useCallback(() => {
    setFormData((prev) => ({ ...prev, user: { ...prev.user, photo: null } }));
  }, []);

  // Handlers
  const handleTypeChange = useCallback((type) => {
    setFormData((prev) => ({ ...prev, issue: { ...prev.issue, type } }));
  }, []);

  const handleLocationChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      location: { ...prev.location, [name]: value },
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  }, [formErrors, setFormErrors]);

  const handleDescriptionChange = useCallback((e) => {
    setFormData((prev) => ({
      ...prev,
      issue: { ...prev.issue, description: e.target.value },
    }));
    if (formErrors.description) {
      setFormErrors((prev) => ({ ...prev, description: null }));
    }
  }, [formErrors, setFormErrors]);

  // Submit handler with AbortController
  const handleSubmitReport = useCallback(async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    abortControllerRef.current = new AbortController();
    try {
      const payload = {
        ...formData.issue,
        ...formData.location,
        uid: user?.uid,
        email: user?.email,
      };
      
      // Always use browser coordinates if locationSource is 'browser'
      if (formData.locationSource === 'browser' && formData.browserLat && formData.browserLng) {
        console.log("Using browser coordinates for submission:", formData.browserLat, formData.browserLng);
        payload.lat = formData.browserLat;
        payload.lng = formData.browserLng;
      } else if (formData.lat && formData.lng) {
        console.log("Using search coordinates for submission:", formData.lat, formData.lng);
        payload.lat = formData.lat;
        payload.lng = formData.lng;
      }
      
      console.log("Final payload coordinates:", payload.lat, payload.lng);
      console.log("Location source:", formData.locationSource);
      let res, result;
      if (formData.user.photo) {
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]) => fd.append(k, v));
        fd.append("photo", formData.user.photo);
        res = await fetch("/api/outageReports", {
          method: "POST",
          body: fd,
          signal: abortControllerRef.current.signal,
        });
      } else {
        res = await fetch("/api/outageReports", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: abortControllerRef.current.signal,
        });
      }
      result = await res.json();
      if (result.success) {
        setSubmitSuccess(true);
        setFormData({
          issue: { type: "electricity", description: "" },
          location: { locality: "", city: "", state: "", pinCode: "" },
          lat: null,
          lng: null,
          user: { photo: null },
          locationSource: null,
          browserLat: null,
          browserLng: null,
        });
        setFormErrors({});
        setLocalityInputKey(Date.now());
        toast({ title: "Report submitted!", description: "Thank you for reporting the issue.", variant: "success" });
      } else {
        toast({ title: "Submission failed", description: result.error || "Failed to submit report.", variant: "destructive" });
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        toast({ title: "Submission failed", description: "Failed to submit report. Please try again.", variant: "destructive" });
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, user, validate, toast, setFormErrors]);

  // Abort API requests on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Post-login redirect logic
  useEffect(() => {
    if (typeof window !== "undefined" && user) {
      const postLoginAction = sessionStorage.getItem("postLoginAction");
      if (postLoginAction === "report") {
        sessionStorage.removeItem("postLoginAction");
        router.replace("/report");
      }
    }
  }, [user, router]);

  return {
    formData,
    setFormData,
    formErrors,
    setFormErrors,
    validate,
    submitSuccess,
    setSubmitSuccess,
    isSubmitting,
    setIsSubmitting,
    localityInputKey,
    setLocalityInputKey,
    localityInputRef,
    isSearching,
    searchResults,
    showResults,
    searchError,
    isGettingLocation,
    handleTypeChange,
    handleLocationChange,
    handleDescriptionChange,
    handleRemovePhoto,
    handleSubmitReport,
    handleSearch,
    handleClearSearch,
    handlePlaceSelect,
    handleGetCurrentLocation,
  };
}
