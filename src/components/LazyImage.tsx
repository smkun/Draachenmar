import React from 'react';
import { useLazyLoading } from '../hooks/useLazyLoading';
import { ImagePlaceholder } from './ImagePlaceholder';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  category: 'people' | 'places' | 'items' | 'pantheons' | 'organizations' | 'adventures';
  name?: string;
  fallbackText?: string;
  showIcon?: boolean;
  rootMargin?: string;
  threshold?: number;
  priority?: 'low' | 'high'; // For above-fold images
}

/**
 * LazyImage component that combines lazy loading with our placeholder system
 * Optimizes performance while maintaining user experience
 */
export function LazyImage({
  src,
  alt,
  className = '',
  category,
  name,
  fallbackText,
  showIcon = true,
  rootMargin = '100px',
  threshold = 0.1,
  priority = 'low'
}: LazyImageProps) {
  const {
    imgRef,
    shouldLoad,
    isLoaded,
    hasError,
    handleLoad,
    handleError
  } = useLazyLoading({ rootMargin, threshold });

  // For high priority images (above the fold), load immediately
  const loadImmediately = priority === 'high';
  const finalShouldLoad = loadImmediately || shouldLoad;

  if (!finalShouldLoad || hasError) {
    return (
      <div ref={imgRef} className={`lazy-image-container ${className}`}>
        <ImagePlaceholder
          src={src}
          alt={alt}
          className={className}
          category={category}
          fallbackText={fallbackText || name || alt}
          showIcon={showIcon}
        />
      </div>
    );
  }

  return (
    <div ref={imgRef} className={`lazy-image-container ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0">
          <ImagePlaceholder
            src={src}
            alt={alt}
            className={className}
            category={category}
            fallbackText="Loading..."
            showIcon={showIcon}
          />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority === 'high' ? 'eager' : 'lazy'} // Native lazy loading as fallback
        decoding="async"
      />
    </div>
  );
}

/**
 * Card-specific lazy image component
 */
export function LazyCardImage({
  src,
  alt,
  category,
  name
}: {
  src: string;
  alt: string;
  category: LazyImageProps['category'];
  name: string;
}) {
  return (
    <LazyImage
      src={src}
      alt={alt}
      category={category}
      name={name}
      className="w-full h-32 object-cover rounded-lg border border-amber-200 dark:border-amber-700"
      rootMargin="200px" // Load a bit earlier for cards
      threshold={0.1}
      priority="low"
    />
  );
}

/**
 * Detail page lazy image component
 */
export function LazyDetailImage({
  src,
  alt,
  category,
  name,
  priority = 'high' // Detail images are usually above the fold
}: {
  src: string;
  alt: string;
  category: LazyImageProps['category'];
  name: string;
  priority?: 'low' | 'high';
}) {
  return (
    <LazyImage
      src={src}
      alt={alt}
      category={category}
      name={name}
      className="w-full h-auto object-contain rounded-lg shadow-lg"
      rootMargin="50px" // Smaller margin for main content
      threshold={0.1}
      priority={priority}
      fallbackText={`${name} Portrait`}
    />
  );
}

/**
 * Gallery lazy image component
 */
export function LazyGalleryImage({
  src,
  alt,
  caption
}: {
  src: string;
  alt: string;
  caption?: string;
}) {
  return (
    <div className="aspect-square relative">
      <LazyImage
        src={src}
        alt={alt}
        category="people" // Gallery images are usually character portraits
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        fallbackText={caption || alt}
        rootMargin="300px" // Load earlier for smooth scrolling
        threshold={0.1}
        priority="low"
      />
    </div>
  );
}