import React from "react";
import clsx from "clsx";

export default function OutageTypeSelector({ value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1F2937] mb-2">Outage Type</label>
      <div className="grid grid-cols-2 gap-4">
        <div
          className={clsx(
            "border-2 rounded-lg p-4 cursor-pointer transition-colors",
            value === "electricity"
              ? "border-[#F59E0B] bg-[#F59E0B]/10"
              : "border-gray-200 hover:border-gray-300"
          )}
          onClick={() => onChange("electricity")}
        >
          <div className="flex items-center">
            <div
              className={clsx(
                "w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center",
                value === "electricity" ? "border-[#F59E0B]" : "border-gray-400"
              )}
            >
              {value === "electricity" && <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />}
            </div>
            <div>
              <p className="font-medium">Electricity</p>
              <p className="text-xs text-gray-500">Power outage or issues</p>
            </div>
          </div>
        </div>
        <div
          className={clsx(
            "border-2 rounded-lg p-4 cursor-pointer transition-colors",
            value === "water"
              ? "border-[#4F46E5] bg-[#4F46E5]/10"
              : "border-gray-200 hover:border-gray-300"
          )}
          onClick={() => onChange("water")}
        >
          <div className="flex items-center">
            <div
              className={clsx(
                "w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center",
                value === "water" ? "border-[#4F46E5]" : "border-gray-400"
              )}
            >
              {value === "water" && <div className="w-3 h-3 rounded-full bg-[#4F46E5]" />}
            </div>
            <div>
              <p className="font-medium">Water</p>
              <p className="text-xs text-gray-500">Water supply issues</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
