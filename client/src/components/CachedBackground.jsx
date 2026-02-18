import React, { useState, useEffect } from 'react';
import { getCachedImage } from '../utils/imageCache';

/**
 * Component that renders a div with cached background image
 */
export default function CachedBackground({
  imageUrl,
  fallback = 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
  style = {},
  className = '',
  ...props
}) {
  const [backgroundImage, setBackgroundImage] = useState(fallback);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!imageUrl) {
      setBackgroundImage(fallback);
      return;
    }

    let isMounted = true;
    let blobUrl = null;

    // Load and cache image
    getCachedImage(imageUrl)
      .then((cachedUrl) => {
        if (isMounted) {
          blobUrl = cachedUrl;
          setBackgroundImage(`url(${cachedUrl}) center/cover`);
          setIsLoaded(true);
        }
      })
      .catch(() => {
        if (isMounted) {
          setBackgroundImage(fallback);
          setIsLoaded(true);
        }
      });

    return () => {
      isMounted = false;
      if (blobUrl && blobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [imageUrl, fallback]);

  return (
    <div
      className={className}
      style={{
        ...style,
        backgroundImage,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'opacity 0.3s ease-in-out',
        opacity: isLoaded ? 1 : 0.7,
      }}
      {...props}
    />
  );
}
