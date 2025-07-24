import React from "react";
import { MapPin } from "lucide-react";

/**
 * Reusable dropdown for location search suggestions.
 * Props:
 * - results: array of prediction objects
 * - show: boolean, whether to show the dropdown
 * - onSelect: function(result, ref) called when a suggestion is clicked
 * - inputRef: ref to pass to onSelect (optional)
 */
function LocationDropdown({ results, show, onSelect, inputRef }) {
  if (!show || !results || results.length === 0) return null;
  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
      {results.map((result, index) => {
        const key = result.placeId || result.place_id || index;
        const mainText = result.structuredFormat?.mainText?.text || result.text?.text || '';
        const secondaryText = result.structuredFormat?.secondaryText?.text || '';
        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(result, inputRef)}
            onTouchEnd={e => { e.preventDefault(); onSelect(result, inputRef); }}
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
  );
}

export default LocationDropdown;
