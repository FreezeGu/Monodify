import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTabNavigation } from '../context/TabNavigationContext';
import { usePlayer } from '../context/PlayerContext';
import LiquidGlassToggle from './LiquidGlassToggle';

const spring = { type: 'spring', damping: 28, stiffness: 300 };

export default function FullScreenPlayer() {
  const { push } = useTabNavigation();
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    progress,
    currentTime,
    duration,
    seek,
    closeFullScreen,
    audioRef,
    liveLyricsOn,
    setLiveLyricsOn,
    liveLyricsText,
    setLiveLyricsText,
    nextTrack,
    previousTrack,
    repeatMode,
    setRepeatMode,
    shuffle,
    setShuffle,
  } = usePlayer();
  const [isFavorite, setIsFavorite] = useState(false);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeFullScreen();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeFullScreen]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume, audioRef]);

  const toggleRepeat = () => {
    const modes = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    setRepeatMode(modes[(currentIndex + 1) % modes.length]);
  };

  const getRepeatIcon = () => {
    if (repeatMode === 'one') return 'repeat-one';
    return 'repeat';
  };

  if (!currentTrack) return null;

  const art = currentTrack.artworkUrl || currentTrack.albumArt || '';
  const title = currentTrack.title || 'Unknown';
  const artist = currentTrack.artist || 'Unknown Artist';
  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <motion.div
      className="player-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Backdrop — tap to close */}
      <motion.div
        aria-hidden
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 0 }}
        onClick={closeFullScreen}
      />
      {/* Backdrop with blur */}
      <motion.div
        className="app-background"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: art ? `url(${art})` : 'none',
          backgroundSize: 'cover',
          filter: 'brightness(0.35) blur(40px)',
          zIndex: 0,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        aria-hidden
      />

      {/* Drag handle — liquid glass pill */}
      <motion.div
        className="liquid-glass-slider-track"
        style={{
          width: 36,
          height: 5,
          margin: '8px auto 12px',
          flexShrink: 0,
          cursor: 'default',
        }}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
      />

      {/* Close button */}
      <motion.button
        type="button"
        className="liquid-glass-btn"
        style={{
          position: 'absolute',
          top: 'calc(var(--safe-top) + 8px)',
          right: 'calc(var(--safe-right) + 16px)',
          width: 36,
          height: 36,
          borderRadius: '50%',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
        }}
        onClick={closeFullScreen}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={spring}
        aria-label="Close player"
      >
        <i className="fas fa-chevron-down" style={{ fontSize: 14 }} />
      </motion.button>

      {/* Main content — liquid glass panel (Apple-style slide up from bottom) */}
      <motion.div
        className="liquid-glass-panel glass-distort"
        style={{
          position: 'relative',
          zIndex: 1,
          flex: 1,
          margin: '0 20px 20px',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: 0,
        }}
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={spring}
      >
        {/* Artwork */}
        <motion.div
          style={{
            width: 'min(280px, 75vw)',
            height: 'min(280px, 75vw)',
            borderRadius: 16,
            background: art ? `url(${art}) center/cover` : 'rgba(255,255,255,0.1)',
            marginBottom: 24,
            boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
          }}
          layout
        />

        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, textAlign: 'center' }}>{title}</h2>
        <p className="text-secondary" style={{ fontSize: 16, marginBottom: 24 }}>{artist}</p>

        {/* Action Row: Heart, Lyrics, Queue */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32, marginBottom: 24 }}>
          <button
            type="button"
            className="liquid-glass-btn glass-btn-icon"
            onClick={() => setIsFavorite(!isFavorite)}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
          <button
            type="button"
            className="liquid-glass-btn glass-btn-icon"
            onClick={() => push('/lyrics')}
            aria-label="Lyrics"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </button>
          <button
            type="button"
            className="liquid-glass-btn glass-btn-icon"
            onClick={() => push('/queue')}
            aria-label="Queue"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l2-2 2 2"></path>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </button>
        </div>

        {/* Liquid glass slider — progress */}
        <div style={{ width: '100%', marginBottom: 16 }}>
          <div
            className="liquid-glass-slider-track"
            role="slider"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={duration || 100}
            tabIndex={0}
            style={{ cursor: 'pointer' }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = (e.clientX - rect.left) / rect.width;
              seek(x * duration);
            }}
          >
            <motion.div className="liquid-glass-slider-fill" style={{ width: `${progressPercent}%` }} layout />
            <span
              className="liquid-glass-slider-thumb"
              style={{ left: `calc(${progressPercent}% - 9px)` }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--secondary-text)', marginTop: 6 }}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Playback controls — liquid glass buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            <button
              type="button"
              className="liquid-glass-btn glass-btn-icon"
              onClick={previousTrack}
              aria-label="Previous"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="19 20 9 12 19 4 19 20"></polygon>
                <line x1="5" y1="19" x2="5" y2="5"></line>
              </svg>
            </button>
            <motion.button
              type="button"
              className="btn-primary"
              style={{ width: 64, height: 64, borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={togglePlay}
              whileTap={{ scale: 0.92 }}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16"></rect>
                  <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              )}
            </motion.button>
            <button
              type="button"
              className="liquid-glass-btn glass-btn-icon"
              onClick={nextTrack}
              aria-label="Next"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5 4 15 12 5 20 5 4"></polygon>
                <line x1="19" y1="5" x2="19" y2="19"></line>
              </svg>
            </button>
          </div>
          {/* Repeat and Shuffle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <button
              type="button"
              className="liquid-glass-btn glass-btn-icon"
              onClick={toggleRepeat}
              aria-label={`Repeat: ${repeatMode}`}
              style={{ opacity: repeatMode !== 'off' ? 1 : 0.5 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="17 1 21 5 17 9"></polyline>
                <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                <polyline points="7 23 3 19 7 15"></polyline>
                <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                {repeatMode === 'one' && <path d="M9 9l6 6"></path>}
              </svg>
            </button>
            <button
              type="button"
              className="liquid-glass-btn glass-btn-icon"
              onClick={() => setShuffle(!shuffle)}
              aria-label={shuffle ? 'Shuffle on' : 'Shuffle off'}
              style={{ opacity: shuffle ? 1 : 0.5 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="16 3 21 3 21 8"></polyline>
                <line x1="4" y1="20" x2="21" y2="3"></line>
                <polyline points="21 16 21 21 16 21"></polyline>
                <line x1="15" y1="15" x2="21" y2="21"></line>
                <line x1="4" y1="4" x2="9" y2="9"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* Volume & Output */}
        <div style={{ width: '100%', marginTop: 'auto', paddingTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
            <div
              className="liquid-glass-slider-track"
              role="slider"
              aria-valuenow={volume * 100}
              aria-valuemin={0}
              aria-valuemax={100}
              tabIndex={0}
              style={{ flex: 1, cursor: 'pointer' }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                setVolume(Math.max(0, Math.min(1, x)));
              }}
            >
              <motion.div className="liquid-glass-slider-fill" style={{ width: `${volume * 100}%` }} layout />
              <span
                className="liquid-glass-slider-thumb"
                style={{ left: `calc(${volume * 100}% - 9px)` }}
              />
            </div>
          </div>
          <button className="liquid-glass-btn" style={{ width: '100%', padding: '8px 16px', fontSize: 14 }}>
            Output Device
          </button>
        </div>

        {/* Live subtitles — liquid glass toggle + panel */}
        <div style={{ width: '100%', marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: 14, color: 'var(--secondary-text)' }}>Live subtitles</span>
            <LiquidGlassToggle on={liveLyricsOn} onChange={setLiveLyricsOn} />
          </div>
          <AnimatePresence>
            {liveLyricsOn && (
              <motion.div
                className="liquid-glass-card"
                style={{
                  padding: 16,
                  minHeight: 80,
                  textAlign: 'center',
                  fontSize: 15,
                  lineHeight: 1.5,
                  color: 'var(--secondary-text)',
                }}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={spring}
              >
                {liveLyricsText || 'Live subtitles will appear here when available.'}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

function formatTime(sec) {
  if (!Number.isFinite(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
