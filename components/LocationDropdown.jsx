import React, { useRef, useEffect, useState } from "react";
import clsx from "clsx";

/**
 * LocationDropdown - a reusable dropdown for location search results
 * Props:
 *   results: Array<{ key: string|number, mainText: string, secondaryText?: string, raw?: any }>
 *   show: boolean (whether to show the dropdown)
 *   onSelect: function(item) (called with the selected item)
 *   inputRef: ref to the input element (for positioning/focus)
 */
export default function LocationDropdown({ results = [], show, onSelect, inputRef }) {
  const [activeIdx, setActiveIdx] = useState(-1);
  const dropdownRef = useRef(null);

  // Reset active index when results or show changes
  useEffect(() => {
    setActiveIdx(results.length > 0 ? 0 : -1);
  }, [results, show]);

  // Keyboard navigation
  useEffect(() => {
    if (!show) return;
    function handleKeyDown(e) {
      if (!results.length) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((idx) => (idx + 1) % results.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((idx) => (idx - 1 + results.length) % results.length);
      } else if (e.key === "Enter") {
        if (activeIdx >= 0 && activeIdx < results.length) {
          e.preventDefault();
          onSelect(results[activeIdx]);
        }
      } else if (e.key === "Escape") {
        setActiveIdx(-1);
        if (inputRef && inputRef.current) inputRef.current.blur();
      }
    }
    const input = inputRef?.current;
    if (input) input.addEventListener("keydown", handleKeyDown);
    return () => {
      if (input) input.removeEventListener("keydown", handleKeyDown);
    };
  }, [show, results, activeIdx, onSelect, inputRef]);

  // Scroll active item into view
  useEffect(() => {
    if (!show || activeIdx < 0) return;
    const el = dropdownRef.current?.querySelector(
      `[data-idx='${activeIdx}']`
    );
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [activeIdx, show]);

  if (!show) return null;

  if (show && results.length === 0) {
    return (
      <div
        ref={dropdownRef}
        className="absolute left-0 right-0 z-30 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-auto flex items-center justify-center min-h-[48px]"
        style={{ minWidth: 200 }}
        role="listbox"
      >
        <div className="w-full text-center text-gray-500 py-3 text-sm">
          No locations found. Try a different search.
        </div>
      </div>
    );
  }

  return (
    <div
      ref={dropdownRef}
      className="absolute left-0 right-0 z-30 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-auto"
      style={{ minWidth: 200 }}
      role="listbox"
    >
      {results.map((item, idx) => {
        // Ensure mainText and secondaryText are always strings
        let mainText = item.mainText;
        if (typeof mainText !== "string") {
          if (mainText && typeof mainText.text === "string") mainText = mainText.text;
          else mainText = mainText ? JSON.stringify(mainText) : "";
        }
        let secondaryText = item.secondaryText;
        if (typeof secondaryText !== "string") {
          if (secondaryText && typeof secondaryText.text === "string") secondaryText = secondaryText.text;
          else secondaryText = secondaryText ? JSON.stringify(secondaryText) : "";
        }
        return (
          <button
            key={item.key || idx}
            type="button"
            data-idx={idx}
            className={clsx(
              "w-full text-left px-4 py-2 cursor-pointer focus:outline-none transition-colors",
              idx === activeIdx
                ? "bg-[#4F46E5]/10 text-[#4F46E5] font-semibold"
                : "hover:bg-gray-100"
            )}
            onMouseEnter={() => setActiveIdx(idx)}
            onClick={() => onSelect(item)}
            tabIndex={-1}
            role="option"
            aria-selected={idx === activeIdx}
          >
            <div className="text-base truncate">{mainText}</div>
            {secondaryText && (
              <div className="text-xs text-gray-500 truncate">{secondaryText}</div>
            )}
          </button>
        );
      })}
    </div>
  );
}
