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
      // Robust fallback for locality
      const bestLocality =
        locationData.locality ||
        locationData.premise ||
        locationData.neighborhood ||
        locationData.sublocality ||
        locationData.route ||
        locationData.city ||
        locationData.address ||
        "";
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          locality: bestLocality,
          city: locationData.city || prev.location.city,
          state: locationData.state || prev.location.state,
          pinCode: locationData.pinCode || prev.location.pinCode,
        },
        lat: locationData.lat || prev.lat,
        lng: locationData.lng || prev.lng,
        locationSource: locationData.locationSource || prev.locationSource,
        ...(locationData.locationSource === 'browser' && {
          browserLat: locationData.lat,
          browserLng: locationData.lng
        })
      }));
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
    // Let the hook handle the place selection and location formatting
    await googlePlaces.handlePlaceSelect(prediction, {
      onLocationUpdate: (locationData) => {
        // Robust fallback for locality
        const bestLocality =
          locationData.locality ||
          locationData.premise ||
          locationData.neighborhood ||
          locationData.sublocality ||
          locationData.route ||
          locationData.city ||
          locationData.address ||
          "";
        setFormData((prev) => {
          if (prev.locationSource === 'browser') {
            // If we already have browser location, preserve lat/lng
            return {
              ...prev,
              location: {
                ...prev.location,
                locality: bestLocality,
                city: locationData.city || prev.location.city,
                state: locationData.state || prev.location.state,
                pinCode: locationData.pinCode || "",
              },
              // Keep browser coordinates
            };
          } else {
            // Use search coordinates
            return {
              ...prev,
              location: {
                ...prev.location,
                locality: bestLocality,
                city: locationData.city || prev.location.city,
                state: locationData.state || prev.location.state,
                pinCode: locationData.pinCode || "",
              },
              lat: locationData.lat || prev.lat,
              lng: locationData.lng || prev.lng,
              locationSource: 'search',
            };
          }
        });
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
