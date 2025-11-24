"use client";

import { useState } from "react";
import { Blurhash } from "react-blurhash";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface BlurhashImageProps {
  src: string;
  alt: string;
  blurhash?: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  // Image variant URLs for responsive loading
  thumbnailUrl?: string;
  mediumUrl?: string;
  largeUrl?: string;
  // Sizes attribute for responsive images
  sizes?: string;
}

/**
 * BlurhashImage Component
 *
 * A progressive image loading component that displays a blurhash
 * placeholder while the actual image loads.
 *
 * Features:
 * - Shows blurhash placeholder during image load
 * - Smooth fade-in transition when image loads
 * - Responsive image loading with srcset support
 * - Fallback to solid color if no blurhash provided
 * - Supports all Next.js Image props
 */
export function BlurhashImage({
  src,
  alt,
  blurhash,
  width,
  height,
  className,
  fill = false,
  priority = false,
  objectFit = "cover",
  thumbnailUrl,
  mediumUrl,
  largeUrl,
  sizes,
}: BlurhashImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Determine which image source to use based on available variants
  // Priority: largeUrl > mediumUrl > thumbnailUrl > original src
  const imageSrc = largeUrl || mediumUrl || thumbnailUrl || src;

  // Build srcset for responsive images if variants are available
  const srcSet = [
    thumbnailUrl && `${thumbnailUrl} 400w`,
    mediumUrl && `${mediumUrl} 800w`,
    largeUrl && `${largeUrl} 1200w`,
  ]
    .filter(Boolean)
    .join(", ");

  // Default sizes if not provided
  // This tells the browser which image size to use based on viewport width
  const imageSizes =
    sizes ||
    (srcSet
      ? "(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px"
      : undefined);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Blurhash Placeholder */}
      {blurhash && !isLoaded && !imageError && (
        <Blurhash
          hash={blurhash}
          width="100%"
          height="100%"
          resolutionX={32}
          resolutionY={32}
          punch={1}
          className="absolute inset-0"
        />
      )}

      {/* Fallback background if no blurhash */}
      {!blurhash && !isLoaded && !imageError && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}

      {/* Actual Image */}
      {!imageError && (
        <Image
          src={imageSrc}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          priority={priority}
          sizes={imageSizes}
          className={cn(
            "transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0",
            fill && "object-cover"
          )}
          style={!fill ? { objectFit } : undefined}
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setImageError(true);
            console.error(`Failed to load image: ${imageSrc}`);
          }}
        />
      )}

      {/* Error State */}
      {imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-center text-muted-foreground text-sm">
            <svg
              className="w-12 h-12 mx-auto mb-2 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p>Image failed to load</p>
          </div>
        </div>
      )}
    </div>
  );
}
