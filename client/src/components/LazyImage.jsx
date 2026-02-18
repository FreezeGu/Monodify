import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { getCachedImage } from '../utils/imageCache';

/**
 * Lazy-loaded image component with caching and smooth fade-in
 */
export default function LazyImage({
  src,
  alt = '',
  className = '',
  style = {},
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PC9zdmc+',
  ...props
}) {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (!src) return;

    // Intersection Observer for lazy loading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before image enters viewport
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src]);

  useEffect(() => {
    if (!isInView || !src) return;

    let isMounted = true;
    let blobUrl = null;

    // Load and cache image
    getCachedImage(src)
      .then((cachedUrl) => {
        if (isMounted) {
          blobUrl = cachedUrl;
          setImageSrc(cachedUrl);
        }
      })
      .catch(() => {
        if (isMounted) {
          setImageSrc(src); // Fallback to direct URL
        }
      });

    return () => {
      isMounted = false;
      // Clean up blob URL if it was created
      if (blobUrl && blobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [isInView, src]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    // Fallback to placeholder or a default image
    setImageSrc(placeholder);
    setIsLoaded(true);
  };

  return (
    <motion.img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={className}
      style={{
        ...style,
        transition: 'opacity 0.3s ease-in-out',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoaded ? 1 : 0 }}
      onLoad={handleLoad}
      onError={handleError}
      loading="lazy"
      {...props}
    />
  );
}
