import React from "react";
import clsx from "clsx";

export default function PhotoUpload({ photo, onChange, onRemove }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-[#1F2937] mb-3">Upload Photo <span className="text-gray-500 text-base">(optional)</span></h3>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input
          type="file"
          id="photo"
          name="photo"
          accept="image/*"
          onChange={onChange}
          className="hidden"
        />
        <label htmlFor="photo" className="cursor-pointer w-full h-full block">
          <div className="flex flex-col items-center justify-center h-32">
            {photo ? (
              <div className="mb-3 flex flex-col items-center justify-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <p className="mt-2 text-sm text-gray-600">{photo.name}</p>
                <button
                  type="button"
                  onClick={onRemove}
                  className="text-xs text-red-600 hover:text-red-800 mt-1"
                >
                  Remove
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center h-16">
                  <svg
                    className="w-10 h-10 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                <p className="text-sm text-gray-600 mt-2">Click or drag a photo of the issue (PNG, JPG, GIF up to 10MB)</p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
              </>
            )}
          </div>
        </label>
      </div>
    </div>
  );
}
