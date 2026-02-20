import React from 'react';
import { motion } from 'framer-motion';
import { usePlayer } from '../context/PlayerContext';
import LiquidGlassSlider from './LiquidGlassSlider';

export default function MiniPlayer() {
  const { currentTrack, isPlaying, togglePlay, openFullScreen, nextTrack, previousTrack, progress, duration, seek, audioRef } = usePlayer();
  if (!currentTrack) return null;

  const art = currentTrack.artworkUrl || currentTrack.albumArt || '';
  const title = currentTrack.title || 'Unknown';
  const artist = currentTrack.artist || 'Unknown Artist';
  // Get duration from audio element, fallback to state
  const audioDuration = audioRef?.current?.duration;
  const actualDuration = (duration > 0 && isFinite(duration)) 
    ? duration 
    : (audioDuration && isFinite(audioDuration) && audioDuration > 0 ? audioDuration : 0);
  const progressValue = actualDuration > 0 ? Math.min(1, progress / actualDuration) : 0;

  return (
    <motion.div
      className="mini-player-container"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: 'spring', damping: 24, stiffness: 300 }}
      onClick={openFullScreen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && openFullScreen()}
      aria-label="Open player"
    >
      <div className="glass-container glass-container--inline glass-container--mini">
        <div className="glass-filter"></div>
        <div className="glass-overlay"></div>
        <div className="glass-specular"></div>
        <div className="glass-content glass-content--inline">
          <div className="player">
            <div className="player__thumb">
              <img className="player__img" src={art || 'https://images.unsplash.com/photo-1619983081593-e2ba5b543168?w=400&h=400&fit=crop'} alt={title} />
              <div className="player__legend">
                <h3 className="player__legend__title">{title}</h3>
                <span className="player__legend__sub-title">{artist}</span>
              </div>
            </div>

            {/* Apple liquid glass progress bar — scrubbable on iPhone */}
            <div
              className="mini-player-progress-wrap"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              style={{ width: '100%', padding: '0 12px', marginBottom: 8 }}
            >
              <LiquidGlassSlider
                value={progressValue}
                onChange={(v) => {
                  // Get duration from audio element, fallback to state
                  const audioDuration = audioRef?.current?.duration;
                  const actualDuration = (duration > 0 && isFinite(duration)) 
                    ? duration 
                    : (audioDuration && isFinite(audioDuration) && audioDuration > 0 ? audioDuration : 0);
                  
                  if (actualDuration > 0 && isFinite(actualDuration)) {
                    const seekTime = v * actualDuration;
                    if (seekTime >= 0 && isFinite(seekTime)) {
                      seek(seekTime);
                    }
                  }
                }}
              />
            </div>

            <div className="player__controls">
              <div
                className="player__controls__skip player__controls__skip--back"
                onClick={(e) => {
                  e.stopPropagation();
                  previousTrack();
                }}
                role="button"
                tabIndex={0}
                aria-label="Previous"
              >
                <svg viewBox="0 0 448 512" width="20" title="skip-back">
                  <path fill="white" d="M64 468V44c0-6.6 5.4-12 12-12h48c6.6 0 12 5.4 12 12v176.4l195.5-181C355.1 22.3 384 29.1 409.2 54.3c25.2 25.2 32 54.1 26.6 85.7L410.5 207l22.1 22.1c9.4 9.4 9.4 24.6 0 33.9L410.5 285 435.8 372c5.4 31.6-1.4 60.5-26.6 85.7-25.2 25.2-54.1 32-85.7 26.6L148 404.4V468c0 6.6-5.4 12-12 12H76c-6.6 0-12-5.4-12-12z" />
                </svg>
              </div>

              <div
                className="player__controls__play"
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    togglePlay();
                  }
                }}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <svg viewBox="0 0 448 512" width="24" title="pause">
                    <path fill="white" d="M144 479H48c-26.5 0-48-21.5-48-48V79c0-26.5 21.5-48 48-48h96c26.5 0 48 21.5 48 48v352c0 26.5-21.5 48-48 48zm304-48V79c0-26.5-21.5-48-48-48h-96c-26.5 0-48 21.5-48 48v352c0 26.5 21.5 48 48 48h96c26.5 0 48-21.5 48-48z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 448 512" width="24" title="play">
                    <path fill="white" d="M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z" />
                  </svg>
                )}
              </div>

              <div
                className="player__controls__skip player__controls__skip--forward"
                onClick={(e) => {
                  e.stopPropagation();
                  nextTrack();
                }}
                role="button"
                tabIndex={0}
                aria-label="Next"
              >
                <svg viewBox="0 0 448 512" width="20" title="skip-forward">
                  <path fill="white" d="M384 44v424c0 6.6-5.4 12-12 12h-48c-6.6 0-12-5.4-12-12V291.6l-195.5 181C95.9 489.7 67 482.9 41.8 457.7c-25.2-25.2-32-54.1-26.6-85.7l25.3-145.4L10.6 202.2c-9.4-9.4-9.4-24.6 0-33.9L37.5 141.3 12.2 55.7C6.8 24.1 14.6-4.8 39.8-30c25.2-25.2 54.1-32 85.7-26.6L300 107.6V44c0-6.6 5.4-12 12-12h48c6.6 0 12 5.4 12 12z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
