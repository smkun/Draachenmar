import { useEffect, useRef, useState } from 'react';

interface UseLazyLoadingOptions {
  rootMargin?: string;
  threshold?: number;
  fallback?: string;
}

interface LazyLoadingState {
  isIntersecting: boolean;
  isLoaded: boolean;
  hasError: boolean;
}

/**
 * Custom hook for implementing lazy loading of images
 * Uses Intersection Observer API for efficient performance
 */
export function useLazyLoading(options: UseLazyLoadingOptions = {}) {
  const {
    rootMargin = '50px',
    threshold = 0.1,
    fallback = undefined
  } = options;

  const [state, setState] = useState<LazyLoadingState>({
    isIntersecting: false,
    isLoaded: false,
    hasError: false
  });

  const imgRef = useRef<HTMLImageElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const imgElement = imgRef.current;
    if (!imgElement) return;

    // Check if Intersection Observer is supported
    if (!('IntersectionObserver' in window)) {
      // Fallback for older browsers - load immediately
      setState(prev => ({ ...prev, isIntersecting: true }));
      return;
    }

    // Create intersection observer
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState(prev => ({ ...prev, isIntersecting: true }));

          // Stop observing once image enters viewport
          if (observerRef.current) {
            observerRef.current.unobserve(imgElement);
          }
        }
      },
      {
        rootMargin,
        threshold
      }
    );

    // Start observing
    observerRef.current.observe(imgElement);

    // Cleanup
    return () => {
      if (observerRef.current && imgElement) {
        observerRef.current.unobserve(imgElement);
      }
    };
  }, [rootMargin, threshold]);

  const handleLoad = () => {
    setState(prev => ({ ...prev, isLoaded: true, hasError: false }));
  };

  const handleError = () => {
    setState(prev => ({ ...prev, hasError: true, isLoaded: false }));
  };

  return {
    imgRef,
    shouldLoad: state.isIntersecting,
    isLoaded: state.isLoaded,
    hasError: state.hasError,
    handleLoad,
    handleError
  };
}

/**
 * Hook for lazy loading multiple images in a container
 * Useful for image galleries and lists
 */
export function useLazyLoadingContainer(
  containerSelector?: string,
  options: UseLazyLoadingOptions = {}
) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const container = containerSelector
      ? document.querySelector(containerSelector) as HTMLElement
      : containerRef.current;

    if (!container || !('IntersectionObserver' in window)) return;

    const images = container.querySelectorAll('img[data-lazy]');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.dataset.lazy;

            if (src) {
              img.src = src;
              img.removeAttribute('data-lazy');
              setLoadedImages(prev => new Set(prev).add(src));
              observer.unobserve(img);
            }
          }
        });
      },
      {
        rootMargin: options.rootMargin || '50px',
        threshold: options.threshold || 0.1
      }
    );

    images.forEach(img => observer.observe(img));

    return () => observer.disconnect();
  }, [containerSelector, options.rootMargin, options.threshold]);

  return {
    containerRef,
    loadedImages
  };
}