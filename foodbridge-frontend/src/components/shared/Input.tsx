import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  required = false,
  disabled = false,
  className = '',
  id,
  type = 'text',
  ...props
}) => {
  const baseStyles = 'w-full px-4 py-2 text-base border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

  const stateStyles = error
    ? 'border-danger-500 bg-danger-50 text-gray-900 placeholder-gray-500 focus:ring-danger-500 focus:border-danger-500'
    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 hover:border-gray-400 focus:ring-primary-500 focus:border-primary-500';

  const disabledStyles = disabled
    ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200'
    : '';

  const combinedClassName = `${baseStyles} ${stateStyles} ${disabledStyles} ${className}`;

  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-danger-600 ml-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        className={combinedClassName}
        disabled={disabled}
        required={required}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-sm text-danger-600" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${inputId}-helper`} className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Input;
