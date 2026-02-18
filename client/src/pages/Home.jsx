import React from 'react';
import { motion } from 'framer-motion';
import { useTabNavigation } from '../context/TabNavigationContext';
import { useBackground } from '../context/BackgroundContext';
import { usePlayer } from '../context/PlayerContext';
import ScreenLayout from '../components/ScreenLayout';
import GlassCard from '../components/GlassCard';

const FEATURED_ARTISTS = [
  { id: '1', name: 'Maher Zain', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop' },
  { id: '2', name: 'Sami Yusuf', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop' },
  { id: '3', name: 'Mesut Kurtis', image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=400&fit=crop' },
];

const FEATURED_PLAYLISTS = [
  { id: 'p1', title: 'Peaceful Morning', subtitle: 'Soft nasheeds to start the day', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop' },
  { id: 'p2', title: 'Spirit of Ramadan', subtitle: 'Blessed nights', image: 'https://images.unsplash.com/photo-1544885936-231e6b91da48?w=400&h=400&fit=crop' },
];

export default function Home() {
  const { push } = useTabNavigation();
  const { setCurrentTrack } = usePlayer();

  const playDemo = () => {
    setCurrentTrack({
      title: 'Upload to play',
      artist: 'Go to Upload and pick an audio file',
      artworkUrl: FEATURED_PLAYLISTS[0].image,
    });
  };

  return (
    <ScreenLayout showBackButton={false} title="Home">
      <div style={{ paddingTop: 16 }}>
        <section style={{ marginBottom: 32 }}>
          <h2 className="text-secondary" style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Featured Artists
          </h2>
          <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8, marginRight: -16, WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
            {FEATURED_ARTISTS.map((a) => (
              <GlassCard
                key={a.id}
                hoverable
                onClick={() => push(`/artist/${a.id}`)}
                style={{ flexShrink: 0, width: 160, padding: 16, textAlign: 'center' }}
              >
                <div
                  style={{
                    width: 128,
                    height: 128,
                    borderRadius: '50%',
                    background: `url(${a.image}) center/cover`,
                    margin: '0 auto 12px',
                  }}
                />
                <div style={{ fontWeight: 600, fontSize: 15 }}>{a.name}</div>
              </GlassCard>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 className="text-secondary" style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Made for You
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FEATURED_PLAYLISTS.map((p) => (
              <GlassCard
                key={p.id}
                hoverable
                onClick={() => push(`/playlist/${p.id}`)}
                style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16 }}
              >
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 12,
                    background: `url(${p.image}) center/cover`,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 4 }}>{p.title}</div>
                  <div className="text-tertiary" style={{ fontSize: 14 }}>{p.subtitle}</div>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>
      </div>
    </ScreenLayout>
  );
}
