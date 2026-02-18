import React, { createContext, useContext, useState, useRef, useCallback } from 'react';

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
  const [queue, setQueue] = useState([]);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off', 'all', 'one'
  const [shuffle, setShuffle] = useState(false);
  const audioRef = useRef(null);

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
    if (audioRef.current && track?.audioUrl) {
      audioRef.current.src = track.audioUrl;
      audioRef.current.load();
      setProgress(0);
      setDuration(0);
      setCurrentTime(0);
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
