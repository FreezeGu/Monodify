import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [fullScreenOpen, setFullScreenOpen] = useState(false);
  const [liveLyricsOn, setLiveLyricsOn] = useState(false);
  const [liveLyricsText, setLiveLyricsText] = useState('');
  const [lyricsData, setLyricsData] = useState(null); // { original: [], translated: [] }
  const [lyricsLanguage, setLyricsLanguage] = useState('original'); // 'original' or 'translated'
  const [queue, setQueue] = useState([]);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off', 'all', 'one'
  const [shuffle, setShuffle] = useState(false);
  const audioRef = useRef(null);

  // Update favicon and app icon with current track artwork (iOS Dynamic Island / Live Activity style)
  // This makes the browser tab favicon and app icon show the currently playing nasheed artwork
  useEffect(() => {
    const updateFavicon = (imageUrl) => {
      if (!imageUrl) {
        // Reset to default favicon when no track
        const favicon = document.querySelector("link[rel='icon']");
        const appleIcon = document.querySelector("link[rel='apple-touch-icon']");
        if (favicon) favicon.href = '/favicon.ico';
        if (appleIcon) appleIcon.href = '/apple-touch-icon.png';
        return;
      }

      // Create a canvas to generate favicon from artwork
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          // Create canvas for favicon (32x32) - browser tab icon
          const faviconCanvas = document.createElement('canvas');
          faviconCanvas.width = 32;
          faviconCanvas.height = 32;
          const faviconCtx = faviconCanvas.getContext('2d');
          
          // Create canvas for apple-touch-icon (180x180) - iOS home screen icon
          const appleCanvas = document.createElement('canvas');
          appleCanvas.width = 180;
          appleCanvas.height = 180;
          const appleCtx = appleCanvas.getContext('2d');
          
          // Draw image centered and cropped to square with rounded corners for better iOS look
          const drawImage = (ctx, canvas, addRoundedCorners = false) => {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw rounded background (for iOS style)
            if (addRoundedCorners) {
              const radius = canvas.width * 0.2; // 20% radius
              ctx.beginPath();
              ctx.moveTo(radius, 0);
              ctx.lineTo(canvas.width - radius, 0);
              ctx.quadraticCurveTo(canvas.width, 0, canvas.width, radius);
              ctx.lineTo(canvas.width, canvas.height - radius);
              ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - radius, canvas.height);
              ctx.lineTo(radius, canvas.height);
              ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - radius);
              ctx.lineTo(0, radius);
              ctx.quadraticCurveTo(0, 0, radius, 0);
              ctx.closePath();
              ctx.clip();
            }
            
            // Calculate crop to square
            const size = Math.min(img.width, img.height);
            const x = (img.width - size) / 2;
            const y = (img.height - size) / 2;
            
            // Draw image
            ctx.drawImage(img, x, y, size, size, 0, 0, canvas.width, canvas.height);
          };
          
          drawImage(faviconCtx, faviconCanvas);
          drawImage(appleCtx, appleCanvas, true); // Add rounded corners for iOS icon
          
          // Update favicon (browser tab)
          const faviconDataUrl = faviconCanvas.toDataURL('image/png');
          let faviconLink = document.querySelector("link[rel='icon']");
          if (!faviconLink) {
            faviconLink = document.createElement('link');
            faviconLink.rel = 'icon';
            document.head.appendChild(faviconLink);
          }
          // Use a timestamp to force browser refresh
          faviconLink.href = faviconDataUrl + '?t=' + Date.now();
          
          // Update apple-touch-icon (iOS home screen when added to home screen)
          const appleDataUrl = appleCanvas.toDataURL('image/png');
          let appleIconLink = document.querySelector("link[rel='apple-touch-icon']");
          if (!appleIconLink) {
            appleIconLink = document.createElement('link');
            appleIconLink.rel = 'apple-touch-icon';
            appleIconLink.sizes = '180x180';
            document.head.appendChild(appleIconLink);
          }
          // Use a timestamp to force refresh
          appleIconLink.href = appleDataUrl + '?t=' + Date.now();
          
          // Also update any other apple-touch-icon sizes
          const allAppleIcons = document.querySelectorAll("link[rel='apple-touch-icon']");
          allAppleIcons.forEach(icon => {
            if (icon !== appleIconLink) {
              icon.href = appleDataUrl + '?t=' + Date.now();
            }
          });
        } catch (err) {
          console.warn('Error updating favicon:', err);
        }
      };
      
      img.onerror = () => {
        console.warn('Failed to load artwork for favicon');
        // Reset to default on error
        const favicon = document.querySelector("link[rel='icon']");
        const appleIcon = document.querySelector("link[rel='apple-touch-icon']");
        if (favicon) favicon.href = '/favicon.ico';
        if (appleIcon) appleIcon.href = '/apple-touch-icon.png';
      };
      
      img.src = imageUrl;
    };

    if (currentTrack && isPlaying) {
      const artwork = currentTrack.imageUrl || currentTrack.image || currentTrack.artworkUrl;
      if (artwork) {
        updateFavicon(artwork);
      } else {
        // No artwork, reset to default
        updateFavicon(null);
      }
    } else {
      // Reset to default when paused or no track
      updateFavicon(null);
    }
  }, [currentTrack, isPlaying]);

  // Media Session API for background playback and lock screen artwork
  useEffect(() => {
    if ('mediaSession' in navigator && currentTrack) {
      const artwork = currentTrack.imageUrl || currentTrack.image || currentTrack.artworkUrl;
      
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title || 'Unknown Title',
        artist: currentTrack.artist || 'Unknown Artist',
        album: currentTrack.album || 'Monodify',
        artwork: artwork ? [
          { src: artwork, sizes: '96x96', type: 'image/jpeg' },
          { src: artwork, sizes: '128x128', type: 'image/jpeg' },
          { src: artwork, sizes: '192x192', type: 'image/jpeg' },
          { src: artwork, sizes: '256x256', type: 'image/jpeg' },
          { src: artwork, sizes: '384x384', type: 'image/jpeg' },
          { src: artwork, sizes: '512x512', type: 'image/jpeg' },
        ] : [],
      });
    }
  }, [currentTrack]);

  // Update Media Session playback state
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }
  }, [isPlaying]);

  const play = useCallback((track) => {
    if (track) setCurrentTrack(track);
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play().catch(() => {});
    setIsPlaying((p) => !p);
  }, [isPlaying]);

  const seek = useCallback((time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  }, []);

  const openFullScreen = useCallback(() => setFullScreenOpen(true), []);
  const closeFullScreen = useCallback(() => setFullScreenOpen(false), []);

  const setTrack = useCallback((track) => {
    setCurrentTrack(track);
    
    // Load lyrics data if available
    if (track?.lyrics) {
      setLyricsData(track.lyrics);
    } else {
      setLyricsData(null);
    }
    
    if (audioRef.current && track?.audioUrl) {
      audioRef.current.src = track.audioUrl;
      audioRef.current.load();
      setProgress(0);
      setDuration(0);
      setCurrentTime(0);
      
      // Save to playback history
      if (track.id) {
        try {
          const history = JSON.parse(localStorage.getItem('monody-history') || '[]');
          const entry = {
            id: track.id,
            title: track.title,
            artist: track.artist,
            genre: track.genre,
            playedAt: new Date().toISOString(),
          };
          // Remove if already exists, then add to end
          const filtered = history.filter((h) => h.id !== track.id);
          filtered.push(entry);
          localStorage.setItem('monody-history', JSON.stringify(filtered.slice(-100))); // Keep last 100
        } catch (_) {}
      }
    }
  }, []);

  const addToQueue = useCallback((track) => {
    setQueue((q) => [...q, track]);
  }, []);

  const removeFromQueue = useCallback((index) => {
    setQueue((q) => q.filter((_, i) => i !== index));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  const nextTrack = useCallback(() => {
    if (queue.length > 0) {
      const next = queue[0];
      setQueue((q) => q.slice(1));
      setTrack(next);
      play(next);
    }
  }, [queue, setTrack, play]);

  const previousTrack = useCallback(() => {
    // For now, just restart current track
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setProgress(0);
      setCurrentTime(0);
    }
  }, []);

  // Media Session action handlers (must be after previousTrack and nextTrack are defined)
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => {
        if (audioRef.current) {
          audioRef.current.play().catch(() => {});
          setIsPlaying(true);
        }
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        if (audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
      });

      navigator.mediaSession.setActionHandler('previoustrack', () => {
        previousTrack();
      });

      navigator.mediaSession.setActionHandler('nexttrack', () => {
        nextTrack();
      });

      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        if (audioRef.current) {
          const skipTime = details.seekOffset || 10;
          audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - skipTime);
        }
      });

      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        if (audioRef.current) {
          const skipTime = details.seekOffset || 10;
          audioRef.current.currentTime = Math.min(
            audioRef.current.duration,
            audioRef.current.currentTime + skipTime
          );
        }
      });

      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (audioRef.current && details.seekTime !== undefined) {
          audioRef.current.currentTime = details.seekTime;
        }
      });
    }
  }, [previousTrack, nextTrack]);

  const value = {
    currentTrack,
    setCurrentTrack: setTrack,
    isPlaying,
    setIsPlaying,
    progress,
    setProgress,
    currentTime,
    duration,
    setDuration,
    fullScreenOpen,
    openFullScreen,
    closeFullScreen,
    play,
    pause,
    togglePlay,
    seek,
    audioRef,
    liveLyricsOn,
    setLiveLyricsOn,
    liveLyricsText,
    setLiveLyricsText,
    lyricsData,
    setLyricsData,
    lyricsLanguage,
    setLyricsLanguage,
    queue,
    addToQueue,
    removeFromQueue,
    clearQueue,
    nextTrack,
    previousTrack,
    repeatMode,
    setRepeatMode,
    shuffle,
    setShuffle,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        preload="metadata"
        crossOrigin="anonymous"
        onTimeUpdate={() => {
          if (audioRef.current) {
            const time = audioRef.current.currentTime;
            setProgress(time);
            setCurrentTime(time);
          }
        }}
        onDurationChange={() => audioRef.current && setDuration(audioRef.current.duration)}
        onEnded={() => {
          setIsPlaying(false);
          // Auto-play next track if queue has items
          if (queue.length > 0) {
            nextTrack();
          } else if (repeatMode === 'all' && currentTrack) {
            // Restart if repeat all
            setTrack(currentTrack);
            play(currentTrack);
          }
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used inside PlayerProvider');
  return ctx;
}
