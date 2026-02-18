import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import ScreenLayout from '../components/ScreenLayout';
import GlassListRow from '../components/GlassListRow';

export default function Queue() {
  const { currentTrack, queue, clearQueue } = usePlayer();
  const displayQueue = queue || [];

  return (
    <ScreenLayout title="Queue">
      <div style={{ paddingTop: 16 }}>
        <section style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 className="text-secondary" style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase' }}>
              Now Playing
            </h2>
            <button className="liquid-glass-btn" onClick={clearQueue} style={{ padding: '6px 12px', fontSize: 12 }}>
              Clear Queue
            </button>
          </div>
          {currentTrack && (
            <GlassListRow
              leftContent={
                <img
                  src={currentTrack.artworkUrl || currentTrack.albumArt || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop'}
                  alt={currentTrack.title}
                  style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover' }}
                />
              }
              style={{ background: 'rgba(255, 255, 255, 0.1)' }}
            >
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{currentTrack.title}</div>
              <div className="text-tertiary" style={{ fontSize: 13 }}>{currentTrack.artist}</div>
            </GlassListRow>
          )}
        </section>

        {displayQueue.length > 0 ? (
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 className="text-secondary" style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase' }}>
                Next
              </h2>
              <button className="liquid-glass-btn" style={{ padding: '6px 12px', fontSize: 12 }}>
                Shuffle
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {displayQueue.map((track, index) => (
                <GlassListRow
                  key={track.id || index}
                  leftContent={
                    <img
                      src={track.image || track.artworkUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop'}
                      alt={track.title}
                      style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover' }}
                    />
                  }
                  rightContent={<span className="text-tertiary" style={{ fontSize: 13 }}>{track.duration || '0:00'}</span>}
                >
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{track.title}</div>
                  <div className="text-tertiary" style={{ fontSize: 13 }}>{track.artist}</div>
                </GlassListRow>
              ))}
            </div>
          </section>
        ) : (
          <section>
            <div style={{ textAlign: 'center', padding: '64px 16px' }}>
              <p className="text-tertiary">Your queue is empty. Add songs to start listening.</p>
            </div>
          </section>
        )}
      </div>
    </ScreenLayout>
  );
}
