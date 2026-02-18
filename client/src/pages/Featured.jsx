import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTabNavigation } from '../context/TabNavigationContext';
import { usePlayer } from '../context/PlayerContext';
import ScreenLayout from '../components/ScreenLayout';
import SearchBar from '../components/SearchBar';
import GlassCard from '../components/GlassCard';

const CATEGORIES = ['All', 'Nasheeds', 'Quran', 'Duas', 'Dhikr'];

const FEATURED_ARTISTS = [
  { id: '1', name: 'Maher Zain', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop' },
  { id: '2', name: 'Sami Yusuf', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop' },
  { id: '3', name: 'Mesut Kurtis', image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=400&fit=crop' },
  { id: '4', name: 'Humood', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop' },
];

const FEATURED_PLAYLISTS = [
  { id: 'p1', title: 'Peaceful Morning', subtitle: 'Soft nasheeds to start the day', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop' },
  { id: 'p2', title: 'Spirit of Ramadan', subtitle: 'Blessed nights', image: 'https://images.unsplash.com/photo-1544885936-231e6b91da48?w=400&h=400&fit=crop' },
  { id: 'p3', title: 'Daily Remembrance', subtitle: 'Dhikr and duas for peace', image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=400&fit=crop' },
];

const NEW_RELEASES = [
  { id: '1', title: 'New Album', artist: 'Maher Zain', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop' },
  { id: '2', title: 'Latest Single', artist: 'Sami Yusuf', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop' },
  { id: '3', title: 'Featured', artist: 'Mesut Kurtis', image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=400&fit=crop' },
  { id: '4', title: 'Popular Now', artist: 'Humood', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop' },
];

const GENRES = [
  { id: 'nasheeds', name: 'Nasheeds', color: 'rgba(30, 120, 90, 0.6)', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop' },
  { id: 'quran', name: 'Quran Recitation', color: 'rgba(80, 55, 150, 0.6)', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop' },
  { id: 'duas', name: 'Duas', color: 'rgba(140, 60, 60, 0.6)', image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=400&fit=crop' },
  { id: 'dhikr', name: 'Dhikr', color: 'rgba(40, 80, 140, 0.6)', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop' },
];

const RECENT_SEARCHES_KEY = 'monody-recent-searches';

export default function Featured() {
  const { push } = useTabNavigation();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (saved) {
      try { setRecentSearches(JSON.parse(saved)); } catch (_) {}
    }
  }, []);

  const handleSearch = (query) => {
    if (query.trim()) {
      push(`/search/results?q=${encodeURIComponent(query)}`);
      const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    }
  };

  return (
    <ScreenLayout showBackButton={false}>
      <div style={{ paddingTop: 8 }}>
        {/* Greeting */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
            Good {getGreeting()}
          </h1>
        </div>

        {/* Search bar */}
        <div style={{ marginBottom: 20 }}>
          <SearchBar onSearch={handleSearch} placeholder="What do you want to listen to?" />
        </div>

        {/* Category filter chips */}
        <div className="glass-filter-chips" style={{ marginBottom: 28 }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`glass-filter-chip ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <section style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>Recent Searches</h2>
              <button
                className="glass-filter-chip"
                onClick={() => {
                  setRecentSearches([]);
                  localStorage.removeItem(RECENT_SEARCHES_KEY);
                }}
                style={{ fontSize: 12, padding: '4px 12px' }}
              >
                Clear
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {recentSearches.map((search, i) => (
                <button
                  key={i}
                  className="glass-filter-chip"
                  onClick={() => handleSearch(search)}
                >
                  {search}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Featured hero banner */}
        <section style={{ marginBottom: 28 }}>
          <GlassCard hoverable onClick={() => push('/album/1')} style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  width: '100%',
                  height: 180,
                  background: 'url(https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&h=400&fit=crop) center/cover',
                }}
              />
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '40px 20px 16px',
                background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>
                  Featured Collection
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#fff' }}>
                  Discover the Best Nasheeds
                </h3>
              </div>
            </div>
          </GlassCard>
        </section>

        {/* Featured Artists - horizontal scroll */}
        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
            Popular Artists
          </h2>
          <div style={{
            display: 'flex',
            gap: 16,
            overflowX: 'auto',
            paddingBottom: 8,
            marginRight: -16,
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
          }}>
            {FEATURED_ARTISTS.map((a) => (
              <div
                key={a.id}
                onClick={() => push(`/artist/${a.id}`)}
                style={{ flexShrink: 0, width: 120, textAlign: 'center', cursor: 'pointer' }}
              >
                <div style={{
                  width: 110,
                  height: 110,
                  borderRadius: '50%',
                  background: `url(${a.image}) center/cover`,
                  margin: '0 auto 10px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                }} />
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--primary-text)' }}>{a.name}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Made for You - Spotify-style horizontal cards */}
        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
            Made for You
          </h2>
          <div style={{
            display: 'flex',
            gap: 12,
            overflowX: 'auto',
            paddingBottom: 8,
            marginRight: -16,
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
          }}>
            {FEATURED_PLAYLISTS.map((p) => (
              <GlassCard
                key={p.id}
                hoverable
                onClick={() => push(`/playlist/${p.id}`)}
                style={{ flexShrink: 0, width: 160, padding: 12 }}
              >
                <div style={{
                  width: '100%',
                  aspectRatio: '1',
                  borderRadius: 8,
                  background: `url(${p.image}) center/cover`,
                  marginBottom: 10,
                }} />
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, lineHeight: 1.3 }}>{p.title}</div>
                <div className="text-tertiary" style={{ fontSize: 12, lineHeight: 1.3 }}>{p.subtitle}</div>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* New & Notable - 2-column grid */}
        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
            New & Notable
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {NEW_RELEASES.map((release) => (
              <GlassCard key={release.id} hoverable onClick={() => push(`/album/${release.id}`)} style={{ padding: 12 }}>
                <div style={{
                  width: '100%',
                  aspectRatio: '1',
                  borderRadius: 8,
                  background: `url(${release.image}) center/cover`,
                  marginBottom: 10,
                }} />
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{release.title}</div>
                <div className="text-tertiary" style={{ fontSize: 12 }}>{release.artist}</div>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* Browse by Genre - colored cards like Spotify */}
        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
            Browse All
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {GENRES.map((genre) => (
              <div
                key={genre.id}
                className="glass-genre-card"
                onClick={() => push(`/search/results?q=${encodeURIComponent(genre.name)}`)}
                style={{
                  position: 'relative',
                  height: 100,
                  borderRadius: 12,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  background: genre.color,
                }}
              >
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  backdropFilter: 'blur(20px) saturate(1.2)',
                  WebkitBackdropFilter: 'blur(20px) saturate(1.2)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }} />
                <div style={{
                  position: 'relative',
                  zIndex: 1,
                  padding: 16,
                  fontWeight: 700,
                  fontSize: 16,
                  color: '#fff',
                }}>
                  {genre.name}
                </div>
                <img
                  src={genre.image}
                  alt=""
                  style={{
                    position: 'absolute',
                    bottom: -8,
                    right: -12,
                    width: 72,
                    height: 72,
                    borderRadius: 6,
                    objectFit: 'cover',
                    transform: 'rotate(25deg)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  }}
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </ScreenLayout>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}
