import React, { useState, useEffect } from 'react';

export interface ImageUploadPreviewProps {
  onFileSelect: (file: File | null) => void;
  file?: File | null;
  label?: string;
  error?: string;
  required?: boolean;
  accept?: string;
  maxSize?: number; // in bytes
}

const ImageUploadPreview: React.FC<ImageUploadPreviewProps> = ({
  onFileSelect,
  file = null,
  label = 'Upload Image',
  error,
  required = false,
  accept = 'image/jpeg,image/png',
  maxSize = 5 * 1024 * 1024, // 5MB default
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputId = `image-upload-${Math.random().toString(36).substr(2, 9)}`;

  useEffect(() => {
    if (file) {
      // Validate file
      const validationErr = validateFile(file, maxSize);
      if (validationErr) {
        setValidationError(validationErr);
        setPreview(null);
        onFileSelect(null);
        return;
      }

      setValidationError(null);

      // Generate preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
      setValidationError(null);
    }
  }, [file, maxSize, onFileSelect]);

  const validateFile = (selectedFile: File, maxSizeBytes: number): string | null => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(selectedFile.type)) {
      return 'Only JPEG and PNG images are allowed';
    }

    // Check file size
    if (selectedFile.size > maxSizeBytes) {
      const maxSizeMB = (maxSizeBytes / (1024 * 1024)).toFixed(1);
      return `File size must be less than ${maxSizeMB}MB`;
    }

    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    onFileSelect(selectedFile);
  };

  const handleRemove = () => {
    setPreview(null);
    setValidationError(null);
    onFileSelect(null);
    // Reset input
    const input = document.getElementById(inputId) as HTMLInputElement;
    if (input) {
      input.value = '';
    }
  };

  const displayError = error || validationError;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-danger-600 ml-1">*</span>}
        </label>
      )}

      <div
        className={`relative w-full h-48 bg-gray-50 rounded-lg border-2 border-dashed transition-colors ${
          displayError
            ? 'border-danger-300 bg-danger-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 bg-danger-600 hover:bg-danger-700 text-white rounded-full p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-danger-500"
              aria-label="Remove image"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </>
        ) : (
          <label
            htmlFor={inputId}
            className="flex flex-col items-center justify-center h-full cursor-pointer"
          >
            <svg
              className="h-12 w-12 text-gray-400 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm text-gray-600 text-center px-4">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500 mt-1">PNG or JPEG (max 5MB)</p>
          </label>
        )}

        <input
          id={inputId}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          aria-invalid={displayError ? 'true' : 'false'}
          aria-describedby={displayError ? `${inputId}-error` : undefined}
        />
      </div>

      {displayError && (
        <p
          id={`${inputId}-error`}
          className="mt-2 text-sm text-danger-600"
          role="alert"
        >
          {displayError}
        </p>
      )}
    </div>
  );
};

export default ImageUploadPreview;
