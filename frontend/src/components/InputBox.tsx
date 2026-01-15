"use client"
import React from "react";

interface InputBoxProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  icon?: React.ReactNode; 
  disabled?: boolean;
}

const InputBox: React.FC<InputBoxProps> = ({ label, value, onChange, placeholder, icon, disabled }) => {
  return (
    <div
      className="
        w-full 
        rounded-lg sm:rounded-xl 
        border border-gray-300 
        p-2 sm:p-3 relative
        hover:border-green-500 hover:shadow-sm
        focus-within:border-green-500 focus-within:shadow-md focus-within:shadow-green-200
        transition
      "
    >
      {/* Label */}
      <div className="text-xs sm:text-sm font-medium text-green-600 mb-1">
        {label}
      </div>

      {/* Icon */}
      {icon && (
        <div className="absolute top-1/2 -translate-y-1/2 right-2 sm:right-3">
          {icon}
        </div>
      )}

      {/* Input */}
      <input
        type="text"
        className="
          w-full border-0 focus:ring-0 
          text-sm sm:text-base
          p-0 text-black placeholder-gray-400 outline-none 
          pr-6 sm:pr-8
        "
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
};

export default InputBox;
