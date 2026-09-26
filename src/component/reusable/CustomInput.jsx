import React from 'react';

const CustomInput = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  name, 
  error, 
  className = '', 
  icon, 
  ...props 
}) => {
  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      {label && <label className="text-xs font-semibold text-gray-700 ml-0.5">{label}</label>}
      <div className="relative w-full">
        {icon}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full px-3.5 py-2 text-sm rounded-[8px] border transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 placeholder:text-gray-400 text-gray-800 bg-white ${
            error ? 'border-red-500 bg-red-50/20' : 'border-gray-300 hover:border-gray-400'
          } ${icon ? 'pl-9' : ''}`}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-red-500 mt-0.5 ml-0.5">{error}</span>}
    </div>
  );
};

export default CustomInput;