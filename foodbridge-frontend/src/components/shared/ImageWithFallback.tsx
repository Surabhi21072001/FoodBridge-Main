import React, { useState, useEffect, useRef } from 'react';

export interface ImageWithFallbackProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  placeholderClassName?: string;
  fallbackClassName?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  fallbackSrc,
  className = '',
  placeholderClassName = 'w-full h-full bg-gray-200 animate-pulse',
  fallbackClassName = 'w-full h-full bg-gray-100 flex items-center justify-center',
  onLoad,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [fallbackLoaded, setFallbackLoaded] = useState(false);
  const [fallbackError, setFallbackError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleImageLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleImageError = () => {
    setHasError(true);
    onError?.();
  };

  const handleFallbackLoad = () => {
    setFallbackLoaded(true);
  };

  const handleFallbackError = () => {
    setFallbackError(true);
  };

  return (
    <div ref={imgRef} className={className}>
      {!isLoaded && !hasError && !fallbackLoaded && (
        <div className={placeholderClassName} aria-hidden="true" />
      )}
      {isInView && !hasError && (
        <img
          src={src}
          alt={alt}
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
      {hasError && fallbackSrc && !fallbackError && (
        <img
          src={fallbackSrc}
          alt={`${alt} (fallback)`}
          onLoad={handleFallbackLoad}
          onError={handleFallbackError}
          className={`transition-opacity duration-300 ${
            fallbackLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
      {(hasError && !fallbackSrc) || (hasError && fallbackError) ? (
        <div className={fallbackClassName}>
          <div className="text-center">
            <svg
              className="h-12 w-12 text-gray-400 mx-auto mb-2"
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
            <span className="text-gray-400 text-sm">{alt}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ImageWithFallback;
