import React, { useState } from 'react';
import { useTabNavigation } from '../context/TabNavigationContext';
import ScreenLayout from '../components/ScreenLayout';
import GlassCard from '../components/GlassCard';

const CATEGORIES = ['All', 'Nasheeds', 'Quran', 'Duas', 'Dhikr'];
const GENRES = [
  { id: '1', name: 'Nasheeds', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop' },
  { id: '2', name: 'Quran Recitation', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop' },
  { id: '3', name: 'Duas', image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=400&fit=crop' },
  { id: '4', name: 'Dhikr', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop' },
];

const NEW_RELEASES = [
  { id: '1', title: 'New Album', artist: 'Artist Name', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop' },
  { id: '2', title: 'Latest Single', artist: 'Another Artist', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop' },
  { id: '3', title: 'Featured', artist: 'Featured Artist', image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=400&fit=crop' },
  { id: '4', title: 'Popular Now', artist: 'Popular Artist', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop' },
];

export default function Browse() {
  const { push } = useTabNavigation();
  const [selectedCategory, setSelectedCategory] = useState('All');

  return (
    <ScreenLayout showBackButton={false} title="Browse">
      <div style={{ paddingTop: 16 }}>
        <div className="glass-tabs" style={{ marginBottom: 24 }}>
          {CATEGORIES.map((cat) => (
            <div
              key={cat}
              className={`glass-tab ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </div>
          ))}
        </div>

        <section style={{ marginBottom: 32 }}>
          <h2 className="text-secondary" style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, textTransform: 'uppercase' }}>
            Featured
          </h2>
          <GlassCard hoverable onClick={() => push('/album/1')}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div
                style={{
                  width: 140,
                  height: 140,
                  borderRadius: 16,
                  background: 'url(https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop) center/cover',
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Featured Collection</h3>
                <p className="text-tertiary" style={{ fontSize: 15 }}>Discover the best nasheeds</p>
              </div>
            </div>
          </GlassCard>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 className="text-secondary" style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, textTransform: 'uppercase' }}>
            New & Notable
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {NEW_RELEASES.map((release) => (
              <GlassCard key={release.id} hoverable onClick={() => push(`/album/${release.id}`)}>
                <div
                  style={{
                    width: '100%',
                    aspectRatio: '1',
                    borderRadius: 12,
                    background: `url(${release.image}) center/cover`,
                    marginBottom: 12,
                  }}
                />
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{release.title}</div>
                <div className="text-tertiary" style={{ fontSize: 13 }}>{release.artist}</div>
              </GlassCard>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-secondary" style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, textTransform: 'uppercase' }}>
            Genres
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {GENRES.map((genre) => (
              <GlassCard key={genre.id} hoverable onClick={() => push(`/browse?category=${genre.id}`)}>
                <div
                  style={{
                    width: '100%',
                    aspectRatio: '1',
                    borderRadius: 12,
                    background: `url(${genre.image}) center/cover`,
                    marginBottom: 12,
                  }}
                />
                <div style={{ fontWeight: 600, fontSize: 15 }}>{genre.name}</div>
              </GlassCard>
            ))}
          </div>
        </section>
      </div>
    </ScreenLayout>
  );
}
