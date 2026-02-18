/**
 * Image caching utility using Cache API
 * Provides fast image loading with offline support
 */

const CACHE_NAME = 'monodify-images-v1';
let cacheInitialized = false;

async function initCache() {
  if (cacheInitialized || typeof caches === 'undefined') return;
  
  try {
    await caches.open(CACHE_NAME);
    cacheInitialized = true;
  } catch (err) {
    console.warn('Cache API not available:', err);
  }
}

/**
 * Get cached image URL or fetch and cache it
 */
export async function getCachedImage(imageUrl) {
  if (!imageUrl || imageUrl.startsWith('blob:') || imageUrl.startsWith('data:')) {
    return imageUrl;
  }

  await initCache();
  
  if (typeof caches === 'undefined') {
    return imageUrl;
  }

  try {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(imageUrl);
    
    if (cachedResponse) {
      const blob = await cachedResponse.blob();
      return URL.createObjectURL(blob);
    }

    const response = await fetch(imageUrl, {
      mode: 'cors',
      cache: 'default',
    });

    if (response.ok) {
      cache.put(imageUrl, response.clone());
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    }
  } catch (err) {
    console.warn('Image cache error:', err);
  }

  return imageUrl;
}

/**
 * Preload multiple images
 */
export async function preloadImages(imageUrls) {
  if (typeof caches === 'undefined') return;
  
  await initCache();
  const cache = await caches.open(CACHE_NAME);
  
  const batchSize = 5;
  for (let i = 0; i < imageUrls.length; i += batchSize) {
    const batch = imageUrls.slice(i, i + batchSize);
    await Promise.allSettled(
      batch.map(async (url) => {
        if (!url || url.startsWith('blob:') || url.startsWith('data:')) return;
        
        try {
          const cached = await cache.match(url);
          if (!cached) {
            const response = await fetch(url, { mode: 'cors', cache: 'default' });
            if (response.ok) {
              await cache.put(url, response);
            }
          }
        } catch (err) {
          // Silently fail for preloading
        }
      })
    );
  }
}

/**
 * Clear old cache entries
 */
export async function clearOldCache() {
  if (typeof caches === 'undefined') return;
  
  try {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    
    if (keys.length > 200) {
      const toDelete = keys.slice(0, keys.length - 200);
      await Promise.all(toDelete.map(key => cache.delete(key)));
    }
  } catch (err) {
    console.warn('Cache cleanup error:', err);
  }
}

if (typeof window !== 'undefined') {
  initCache();
  setInterval(clearOldCache, 60 * 60 * 1000);
}
