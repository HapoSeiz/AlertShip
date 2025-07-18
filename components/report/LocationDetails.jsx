
import React, { useState, useEffect, useRef } from "react";
import { MapPin, Search, X, Loader2 } from "lucide-react";
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
  searchError
}) {


  // Track if search has been triggered
  const [hasSearched, setHasSearched] = useState(false);

  // Track focus for info message
  const [isLocalityFocused, setIsLocalityFocused] = useState(false);

  // Reset hasSearched if input is cleared
  useEffect(() => {
    if (!location.locality) setHasSearched(false);
  }, [location.locality]);

  const handleSearchClick = () => {
    setHasSearched(true);
    onSearch();
  };

  const handleClearClick = () => {
    setHasSearched(false);
    onClearSearch();
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
            <button
              type="button"
              onClick={onGetCurrentLocation}
              disabled={isGettingLocation}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-full p-1 flex items-center justify-center text-blue-600 hover:bg-blue-50 focus:bg-blue-100 focus:ring-2 focus:ring-blue-400 transition-all cursor-pointer disabled:opacity-50"
              aria-label="Get current location"
              title="Click to get your current location"
              style={{ minWidth: 28, minHeight: 28 }}
            >
              {isGettingLocation ? (
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              ) : (
                <MapPin className="w-5 h-5 text-blue-600" />
              )}
            </button>
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
            />
            {/* Search/X Icon Logic */}
            {location.locality.trim() && !isSearching && (showResults || searchResults.length > 0) ? (
              <button
                type="button"
                onClick={handleClearClick}
                onTouchEnd={e => { e.preventDefault(); handleClearClick(); }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Clear locality"
                style={{ zIndex: 10, cursor: 'pointer', background: 'transparent', border: 'none' }}
              >
                <X className="w-4 h-4" />
              </button>
            ) : location.locality.trim() && !isSearching && location.locality.trim().length >= 3 ? (
              <button
                type="button"
                onClick={handleSearchClick}
                onTouchEnd={e => { e.preventDefault(); handleSearchClick(); }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Search locality"
                tabIndex={0}
                style={{ zIndex: 10, cursor: 'pointer', background: 'transparent', border: 'none' }}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSearchClick(); } }}
              >
                <Search className="w-4 h-4 pointer-events-none" />
              </button>
            ) : null}
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
            
            {/* Search Results Dropdown */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                {searchResults.map((result, index) => {
                  // For new API: placeId, structuredFormat.mainText.text, structuredFormat.secondaryText.text, text.text
                  const key = result.placeId || result.place_id || index;
                  const mainText = result.structuredFormat?.mainText?.text || result.text?.text || '';
                  const secondaryText = result.structuredFormat?.secondaryText?.text || '';
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => onPlaceSelect(result)}
                      onTouchEnd={e => { e.preventDefault(); onPlaceSelect(result); }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {mainText}
                          </p>
                          {secondaryText && (
                            <p className="text-xs text-gray-500 truncate">
                              {secondaryText}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
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
