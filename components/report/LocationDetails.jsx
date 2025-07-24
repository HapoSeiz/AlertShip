
import React, { useState, useEffect, useRef } from "react";
import { MapPin, X, Loader2 } from "lucide-react";
import LocationDropdown from "@/components/LocationDropdown";
import LocationButton from "@/components/ui/LocationButton";
import SearchButton from "@/components/ui/SearchButton";
import clsx from "clsx";

function LocationDetails({
  location,
  onChange,
  onSearch,
  onClearSearch,
  onPlaceSelect,
  onGetCurrentLocation,
  isGettingLocation,
  formErrors,
  setFormErrors,
  localityInputRef,
  localityInputKey,
  isSearching,
  searchResults,
  showResults,
  searchError,
  descriptionInputRef
}) {


  // Track if search has been triggered
  const [hasSearched, setHasSearched] = useState(false);
  // Track if autofill has occurred
  const [isAutofilled, setIsAutofilled] = useState(false);

  // Track focus for info message
  const [isLocalityFocused, setIsLocalityFocused] = useState(false);

  // Reset hasSearched and autofill if input is cleared
  useEffect(() => {
    if (!location.locality) {
      setHasSearched(false);
      setIsAutofilled(false);
    }
  }, [location.locality]);

  const handleSearchClick = () => {
    setHasSearched(true);
    setIsAutofilled(false);
    onSearch();
  };

  const handleClearClick = () => {
    setHasSearched(false);
    setIsAutofilled(false);
    onClearSearch();
  };

  // Wrap onPlaceSelect to set autofill state
  const handlePlaceSelect = (result, ref) => {
    setIsAutofilled(true);
    if (onPlaceSelect) onPlaceSelect(result, ref);
  };

  return (
    <div className="border-t border-gray-200 pt-6">
      <h3 className="text-lg font-medium text-[#1F2937] mb-4">Location Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Locality with Search */}
        <div className="relative">
          <label htmlFor="locality" className="block text-sm font-medium text-[#1F2937] mb-2">
            Locality <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <LocationButton
              isLoading={isGettingLocation}
              onClick={onGetCurrentLocation}
              className="absolute left-2 top-1/2 -translate-y-1/2 !p-1 !w-5 !h-5"
              style={{ minWidth: 28, minHeight: 28 }}
            />
            <input
              key={localityInputKey}
              type="text"
              id="locality"
              name="locality"
              value={location.locality}
              onChange={onChange}
              placeholder="Enter your locality"
              className={clsx(
                "pl-14 pr-12 h-12 w-full border-2 focus:border-[#4F46E5] focus:ring-0 outline-none rounded-md align-middle",
                formErrors.locality || searchError ? "border-red-500 bg-red-50" : "border-gray-300"
              )}
              ref={localityInputRef}
              autoComplete="off"
              onFocus={() => {
                setIsLocalityFocused(true);
                if (formErrors.locality && setFormErrors) setFormErrors((prev) => ({ ...prev, locality: null }));
              }}
              onBlur={() => setIsLocalityFocused(false)}
              onKeyDown={e => {
                if (
                  e.key === "Enter" &&
                  location.locality.trim() &&
                  !isSearching &&
                  location.locality.trim().length >= 3
                ) {
                  e.preventDefault();
                  handleSearchClick();
                }
              }}
            />
            {/* SearchButton - shows X after autofill, search otherwise */}
            {location.locality.trim() && !isSearching && location.locality.trim().length >= 3 && (
              <SearchButton
                isLoading={false}
                showClear={isAutofilled}
                onClick={handleSearchClick}
                onClear={handleClearClick}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                aria-label={isAutofilled ? "Clear locality" : "Search locality"}
                tabIndex={0}
              />
            )}
            {/* Loader2 for loading state */}
            {location.locality.trim() && isSearching && (
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Loading"
                style={{ zIndex: 10, cursor: 'pointer', background: 'transparent', border: 'none' }}
                disabled
              >
                <Loader2 className="w-4 h-4 animate-spin" />
              </button>
            )}
            {/* Reusable LocationDropdown */}
            <LocationDropdown
              results={searchResults}
              show={showResults}
              onSelect={handlePlaceSelect}
              inputRef={descriptionInputRef}
            />
          </div>
          
          {/* Info or Error Messages */}
          {isLocalityFocused && !formErrors.locality && !searchError && (
            <p className="text-blue-600 text-sm mt-1">
              Click on the location icon for automatic fetching or enter at least 3 characters to search.
            </p>
          )}
          {(formErrors.locality || searchError) && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {formErrors.locality || searchError}
            </p>
          )}
        </div>
        {/* City */}
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-[#1F2937] mb-2">
            City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={location.city}
            onChange={onChange}
            placeholder="Enter your city"
            className={clsx(
              "h-12 w-full border-2 focus:border-[#4F46E5] focus:ring-0 outline-none rounded-md px-3",
              formErrors.city ? "border-red-500 bg-red-50" : "border-gray-300"
            )}
          />
          {formErrors.city && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {formErrors.city}
            </p>
          )}
        </div>
        {/* State */}
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-[#1F2937] mb-2">
            State <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="state"
            name="state"
            value={location.state}
            onChange={onChange}
            placeholder="Enter state name"
            className={clsx(
              "h-12 w-full border-2 focus:border-[#4F46E5] focus:ring-0 outline-none rounded-md px-3",
              formErrors.state ? "border-red-500 bg-red-50" : "border-gray-300"
            )}
          />
          {formErrors.state && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {formErrors.state}
            </p>
          )}
        </div>
        {/* Pin Code */}
        <div>
          <label htmlFor="pinCode" className="block text-sm font-medium text-[#1F2937] mb-2">
            Pin Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="pinCode"
            name="pinCode"
            value={location.pinCode}
            onChange={onChange}
            placeholder="Enter 6-digit pin code"
            maxLength={6}
            pattern="[0-9]*"
            className={clsx(
              "h-12 w-full border-2 focus:border-[#4F46E5] focus:ring-0 outline-none rounded-md px-3",
              formErrors.pinCode ? "border-red-500 bg-red-50" : "border-gray-300"
            )}
          />
          {formErrors.pinCode && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {formErrors.pinCode}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default LocationDetails;
//
