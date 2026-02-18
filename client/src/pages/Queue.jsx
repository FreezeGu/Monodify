import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import ScreenLayout from '../components/ScreenLayout';
import GlassListRow from '../components/GlassListRow';

const mockQueue = [
  { id: '1', title: 'Bismillah', artist: 'Maher Zain', duration: '3:45', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop' },
  { id: '2', title: 'Allahu', artist: 'Sami Yusuf', duration: '4:12', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop' },
  { id: '3', title: 'Salam', artist: 'Mesut Kurtis', duration: '3:30', image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=400&fit=crop' },
];

export default function Queue() {
  const { currentTrack, queue, clearQueue } = usePlayer();
  const displayQueue = queue && queue.length > 0 ? queue : mockQueue;

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
      </div>
    </ScreenLayout>
  );
}
