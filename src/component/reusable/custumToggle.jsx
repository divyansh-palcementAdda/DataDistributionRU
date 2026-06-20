import React from "react";

const Toggle = ({
    checked = false,
    onChange,
    label = "",
    disabled = false,
}) => {
    return (
        <label
            className={`inline-flex items-center cursor-pointer ${disabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
        >
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange?.(e.target.checked)}
                disabled={disabled}
                className="sr-only peer"
            />

            <div
                className="
          relative w-9 h-5 rounded-full
          bg-neutral-300
          peer-focus:outline-none
          peer-focus:ring-4
          peer-focus:ring-blue-200
          dark:peer-focus:ring-blue-800
          peer-checked:bg-blue-600
          after:content-['']
          after:absolute
          after:top-[2px]
          after:left-[2px]
          after:bg-white
          after:border
          after:border-gray-300
          after:rounded-full
          after:h-4
          after:w-4
          after:transition-all
          peer-checked:after:translate-x-4
        "
            />

            {label && (
                <span className="ml-3 text-sm font-medium text-gray-900">
                    {label}
                </span>
            )}
        </label>
    );
};

export default Toggle;