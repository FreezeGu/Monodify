import React, { useState, useEffect, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';
import ScreenLayout from '../components/ScreenLayout';

const MOCK_LYRICS = [
  { time: 0, text: 'Bismillah, Bismillah' },
  { time: 5, text: 'In the name of Allah' },
  { time: 10, text: 'The Most Gracious, The Most Merciful' },
  { time: 15, text: 'Bismillah, Bismillah' },
  { time: 20, text: 'In the name of Allah' },
  { time: 25, text: 'We begin, we begin' },
];

export default function Lyrics() {
  const { currentTrack, currentTime } = usePlayer();
  const [fontSize, setFontSize] = useState(18);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const lineRefs = useRef([]);

  useEffect(() => {
    const index = MOCK_LYRICS.findIndex((line, i) => {
      const nextLine = MOCK_LYRICS[i + 1];
      return currentTime >= line.time && (!nextLine || currentTime < nextLine.time);
    });
    if (index !== -1 && index !== currentLineIndex) {
      setCurrentLineIndex(index);
      if (lineRefs.current[index]) {
        lineRefs.current[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentTime, currentLineIndex]);

  if (!currentTrack) {
    return (
      <ScreenLayout title="Lyrics">
        <div style={{ textAlign: 'center', padding: '64px 16px' }}>
          <p className="text-tertiary">No track playing</p>
        </div>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout
      title="Lyrics"
      rightAction={
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="liquid-glass-btn glass-btn-icon"
            onClick={() => setFontSize(Math.max(14, fontSize - 2))}
            aria-label="Decrease font size"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          </button>
          <button
            className="liquid-glass-btn glass-btn-icon"
            onClick={() => setFontSize(Math.min(24, fontSize + 2))}
            aria-label="Increase font size"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          </button>
        </div>
      }
    >
      <div style={{ paddingTop: 16 }}>
        <section style={{ minHeight: '60vh', padding: '32px 16px' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 8 }}>{currentTrack.title}</div>
            <div className="text-tertiary" style={{ fontSize: 15 }}>{currentTrack.artist}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center' }}>
            {MOCK_LYRICS.map((line, index) => (
              <div
                key={index}
                ref={(el) => (lineRefs.current[index] = el)}
                style={{
                  fontSize: `${fontSize}px`,
                  fontWeight: index === currentLineIndex ? 600 : 400,
                  color: index === currentLineIndex ? 'var(--primary-text)' : 'var(--secondary-text)',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  padding: '12px 20px',
                  borderRadius: 12,
                  background: index === currentLineIndex ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                }}
              >
                {line.text}
              </div>
            ))}
          </div>
        </section>
      </div>
    </ScreenLayout>
  );
}
