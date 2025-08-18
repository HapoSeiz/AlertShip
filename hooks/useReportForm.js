import { useState, useRef, useEffect, useCallback } from "react";
import { getAuth } from "firebase/auth";
import useFormValidation from "@/hooks/useFormValidation";
import { useGooglePlaces } from "@/hooks/useGooglePlaces";

export function useReportForm({ user, toast, router, isLoaded, descriptionValueRef }) {
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
  
  const localityInputRef = useRef(null);
  const { formErrors, setFormErrors, validate } = useFormValidation(formData);
  const abortControllerRef = useRef(null);

  // Use the consolidated Google Places hook
  const googlePlaces = useGooglePlaces({
    toast,
    onLocationUpdate: (locationData) => {
      console.log("=== REPORT FORM onLocationUpdate ===");
      console.log("locationData received:", locationData);
      
      setFormData((prev) => {
        console.log("Previous formData lat/lng:", prev.lat, prev.lng);
        
        // Save all address fields exactly like the dashboard does
        const bestLocality =
          locationData.locality ||
          locationData.premise ||
          locationData.neighborhood ||
          locationData.sublocality ||
          locationData.route ||
          locationData.city ||
          locationData.address ||
          "";
        
        const newLocationData = {
          ...prev.location,
          // Save all address components from the hook (same as dashboard)
          premise: locationData.premise || '',
          route: locationData.route || '',
          neighborhood: locationData.neighborhood || '',
          sublocality: locationData.sublocality || '',
          locality: bestLocality,
          city: locationData.city || prev.location.city,
          state: locationData.state || prev.location.state,
          pinCode: locationData.pinCode || prev.location.pinCode,
          placeId: locationData.placeId || '',
          address: locationData.address || '',
        };
        
        console.log("newLocationData being saved:", newLocationData);
        console.log("Coordinates being set - lat:", locationData.lat, "lng:", locationData.lng);
        
        const updatedFormData = {
          ...prev,
          location: newLocationData,
          lat: locationData.lat !== undefined ? locationData.lat : prev.lat,
          lng: locationData.lng !== undefined ? locationData.lng : prev.lng,
          locationSource: locationData.locationSource || prev.locationSource,
          ...(locationData.locationSource === 'browser' && {
            browserLat: locationData.lat,
            browserLng: locationData.lng
          })
        };
        
        console.log("Updated formData lat/lng:", updatedFormData.lat, updatedFormData.lng);
        return updatedFormData;
      });
    },
    onFocusNext: () => {
      // Focus description input after location selection
      setTimeout(() => {
        if (
          descriptionValueRef &&
          descriptionValueRef.current === ""
        ) {
          const descInput = document.querySelector('textarea[name="description"]');
          if (descInput) descInput.focus();
        }
      }, 0);
    }
  });

  // Wrapper functions that integrate with the useGooglePlaces hook
  const handleSearch = useCallback(async () => {
    const query = formData.location.locality.trim();
    await googlePlaces.handleSearch(query);
  }, [formData.location.locality, googlePlaces]);

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
    googlePlaces.handleClearSearch();
    if (formErrors.locality) {
      setFormErrors((prev) => ({ ...prev, locality: null }));
    }
  }, [formErrors.locality, setFormErrors, googlePlaces]);

  const handlePlaceSelect = useCallback(async (prediction, descriptionInputRef) => {
    // Use the same logic as dashboard - let the hook handle the place selection
    await googlePlaces.handlePlaceSelect(prediction);
    
    // Focus the description input after place selection
    setTimeout(() => {
      if (
        descriptionInputRef &&
        descriptionInputRef.current &&
        descriptionValueRef &&
        descriptionValueRef.current === ""
      ) {
        descriptionInputRef.current.focus();
      }
    }, 0);
  }, [googlePlaces, descriptionValueRef]);

  const handleGetCurrentLocation = useCallback((descriptionInputRef) => {
    googlePlaces.handleGetCurrentLocation({
      onLocationUpdate: (locationData) => {
        const { location, lat, lng } = locationData;
        
        // Always preserve browser coordinates
        setFormData((prev) => ({
          ...prev,
          location: {
            ...prev.location,
            ...location
          },
          lat: lat,
          lng: lng,
          browserLat: lat,
          browserLng: lng,
          locationSource: 'browser',
        }));

        // Focus description input if provided and empty  
        setTimeout(() => {
          if (
            descriptionInputRef &&
            descriptionInputRef.current &&
            descriptionValueRef &&
            descriptionValueRef.current === ""
          ) {
            descriptionInputRef.current.focus();
          }
        }, 0);
      }
    });
  }, [googlePlaces, descriptionValueRef]);

  // Remove photo
  const handleRemovePhoto = useCallback(() => {
    setFormData((prev) => ({ ...prev, user: { ...prev.user, photo: null } }));
  }, []);

  // Handlers
  const handleTypeChange = useCallback((type) => {
    setFormData((prev) => ({
      ...prev,
      issue: { ...prev.issue, type },
      // Explicitly preserve location, lat, lng, etc.
      location: { ...prev.location },
      lat: prev.lat,
      lng: prev.lng,
      locationSource: prev.locationSource,
      browserLat: prev.browserLat,
      browserLng: prev.browserLng,
    }));
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
    
    console.log("=== SUBMIT FORM DATA ===");
    console.log("formData.lat:", formData.lat);
    console.log("formData.lng:", formData.lng);
    console.log("formData.locationSource:", formData.locationSource);
    console.log("formData.browserLat:", formData.browserLat);
    console.log("formData.browserLng:", formData.browserLng);
    console.log("Full formData:", formData);
    
    // Prevent submission if lat/lng are missing
    if (!formData.lat || !formData.lng) {
      console.log("SUBMISSION BLOCKED: Missing coordinates");
      toast({
        title: "Location required",
        description: "Please select a valid location from the dropdown so we can accurately record the outage.",
        variant: "destructive"
      });
      return;
    }
    setIsSubmitting(true);
    abortControllerRef.current = new AbortController();
    try {
      // Always include all address fields in the payload
      const payload = {
        ...formData.issue,
        ...formData.location,
        premise: formData.location.premise || '',
        route: formData.location.route || '',
        neighborhood: formData.location.neighborhood || '',
        sublocality: formData.location.sublocality || '',
        locality: formData.location.locality || '',
        city: formData.location.city || '',
        state: formData.location.state || '',
        pinCode: formData.location.pinCode || '',
        placeId: formData.location.placeId || '',
        address: formData.location.address || '',
        lat: formData.lat,
        lng: formData.lng,
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


      // Always get the current user from Firebase Auth instance
      let idToken = null;
      try {
        const currentUser = getAuth().currentUser;
        if (currentUser) {
          idToken = await currentUser.getIdToken();
          console.log("[Report Submit] Got ID token:", idToken);
        } else {
          console.warn("[Report Submit] No currentUser found in Firebase Auth");
        }
      } catch (err) {
        console.error("[Report Submit] Error getting ID token:", err);
      }

      console.log("Final payload coordinates:", payload.lat, payload.lng);
      console.log("Location source:", formData.locationSource);
      console.log("Final payload being sent:", JSON.stringify(payload, null, 2));
      let res, result;
      const headers = idToken ? { "Content-Type": "application/json", "Authorization": `Bearer ${idToken}` } : { "Content-Type": "application/json" };
      if (formData.user.photo) {
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]) => fd.append(k, v));
        fd.append("photo", formData.user.photo);
        if (idToken) fd.append("idToken", idToken); // fallback for FormData
        res = await fetch("/api/outageReports", {
          method: "POST",
          body: fd,
          signal: abortControllerRef.current.signal,
          headers: idToken ? { "Authorization": `Bearer ${idToken}` } : undefined,
        });
      } else {
        res = await fetch("/api/outageReports", {
          method: "POST",
          headers,
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
        // Notify other parts of the app (homepage latest updates) to refresh
        try {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('reports:updated'));
          }
        } catch (e) {
          console.warn('Could not dispatch reports:updated event', e);
        }
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
    // Use the hook's state instead of local state
    isSearching: googlePlaces.isSearching,
    searchResults: googlePlaces.searchResults,
    showResults: googlePlaces.showResults,
    searchError: googlePlaces.searchError,
    isGettingLocation: googlePlaces.isGettingLocation,
    handleTypeChange,
    handleLocationChange,
    handleDescriptionChange,
    handleRemovePhoto,
    handleSubmitReport,
    handleSearch,
    handleClearSearch,
    // Wrap handlePlaceSelect to accept descriptionInputRef from the component
    handlePlaceSelect: (prediction, descriptionInputRef) => handlePlaceSelect(prediction, descriptionInputRef),
    // Wrap handleGetCurrentLocation to accept descriptionInputRef from the component
    handleGetCurrentLocation: (descriptionInputRef) => handleGetCurrentLocation(descriptionInputRef),
  };
}
