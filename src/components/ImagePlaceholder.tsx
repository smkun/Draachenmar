import React, { useState } from 'react';
import { User, MapPin, Sword, Crown, Zap, Shield, Scroll } from 'lucide-react';

interface ImagePlaceholderProps {
  src: string;
  alt: string;
  className?: string;
  category: 'people' | 'places' | 'items' | 'pantheons' | 'organizations' | 'adventures';
  fallbackText?: string;
  showIcon?: boolean;
}

export function ImagePlaceholder({
  src,
  alt,
  className = '',
  category,
  fallbackText,
  showIcon = true
}: ImagePlaceholderProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const getPlaceholderConfig = () => {
    switch (category) {
      case 'people':
        return {
          icon: User,
          gradient: 'from-blue-400 to-blue-600',
          text: fallbackText || 'Character Portrait',
          iconSize: 'w-12 h-12'
        };
      case 'places':
        return {
          icon: MapPin,
          gradient: 'from-green-400 to-green-600',
          text: fallbackText || 'Location View',
          iconSize: 'w-12 h-12'
        };
      case 'items':
        return {
          icon: Sword,
          gradient: 'from-purple-400 to-purple-600',
          text: fallbackText || 'Item Image',
          iconSize: 'w-12 h-12'
        };
      case 'pantheons':
        return {
          icon: Zap,
          gradient: 'from-yellow-400 to-yellow-600',
          text: fallbackText || 'Divine Symbol',
          iconSize: 'w-12 h-12'
        };
      case 'organizations':
        return {
          icon: Shield,
          gradient: 'from-red-400 to-red-600',
          text: fallbackText || 'Organization Emblem',
          iconSize: 'w-12 h-12'
        };
      case 'adventures':
        return {
          icon: Scroll,
          gradient: 'from-orange-400 to-orange-600',
          text: fallbackText || 'Adventure Map',
          iconSize: 'w-12 h-12'
        };
      default:
        return {
          icon: User,
          gradient: 'from-gray-400 to-gray-600',
          text: fallbackText || 'Image',
          iconSize: 'w-12 h-12'
        };
    }
  };

  const config = getPlaceholderConfig();
  const IconComponent = config.icon;

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  // Show placeholder if image failed to load or is still loading
  if (imageError || imageLoading) {
    return (
      <div className={`relative ${className}`}>
        {/* Loading/Error Placeholder */}
        <div className={`
          w-full h-full min-h-[200px]
          bg-gradient-to-br ${config.gradient}
          rounded-lg border-2 border-amber-200 dark:border-amber-700
          flex flex-col items-center justify-center
          text-white shadow-lg
          transition-all duration-300 hover:shadow-xl
        `}>
          {showIcon && (
            <IconComponent className={`${config.iconSize} mb-3 opacity-90`} />
          )}
          <span className="text-sm font-serif opacity-90 text-center px-4">
            {config.text}
          </span>
          {imageLoading && (
            <div className="mt-2 text-xs opacity-75">
              Loading...
            </div>
          )}
          {imageError && (
            <div className="mt-2 text-xs opacity-75">
              Image not available
            </div>
          )}
        </div>

        {/* Hidden actual image for loading detection */}
        <img
          src={src}
          alt={alt}
          className="hidden"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      </div>
    );
  }

  // Show actual image if loaded successfully
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={handleImageError}
    />
  );
}

// Utility component for card-sized images
export function CardImagePlaceholder({
  src,
  alt,
  category,
  name
}: {
  src: string;
  alt: string;
  category: ImagePlaceholderProps['category'];
  name: string;
}) {
  return (
    <ImagePlaceholder
      src={src}
      alt={alt}
      category={category}
      className="w-full h-32 object-cover rounded-lg border border-amber-200 dark:border-amber-700"
      fallbackText={`${name}`}
      showIcon={true}
    />
  );
}

// Utility component for detail page images
export function DetailImagePlaceholder({
  src,
  alt,
  category,
  name
}: {
  src: string;
  alt: string;
  category: ImagePlaceholderProps['category'];
  name: string;
}) {
  return (
    <ImagePlaceholder
      src={src}
      alt={alt}
      category={category}
      className="w-full h-auto object-contain rounded-lg shadow-lg"
      fallbackText={`${name} Portrait`}
      showIcon={true}
    />
  );
}