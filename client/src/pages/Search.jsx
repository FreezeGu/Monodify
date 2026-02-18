import React, { useState, useEffect } from 'react';
import { useTabNavigation } from '../context/TabNavigationContext';
import ScreenLayout from '../components/ScreenLayout';
import SearchBar from '../components/SearchBar';
import GlassCard from '../components/GlassCard';

const CATEGORIES = [
  { id: 'nasheeds', name: 'Nasheeds', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop' },
  { id: 'quran', name: 'Quran Recitation', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop' },
  { id: 'duas', name: 'Duas', image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=400&fit=crop' },
  { id: 'dhikr', name: 'Dhikr', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop' },
];

const RECENT_SEARCHES_KEY = 'monody-recent-searches';

export default function Search() {
  const { push } = useTabNavigation();
  const [recentSearches, setRecentSearches] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (_) {}
    }
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      push(`/search/results?q=${encodeURIComponent(query)}`);
      const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    }
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  return (
    <ScreenLayout showBackButton={false}>
      <div style={{ paddingTop: 16 }}>
        <div style={{ marginBottom: 32 }}>
          <SearchBar onSearch={handleSearch} placeholder="What do you want to listen to?" />
        </div>

        {recentSearches.length > 0 && (
          <section style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 className="text-secondary" style={{ fontSize: 15, fontWeight: 600, textTransform: 'uppercase' }}>
                Recent Searches
              </h2>
              <button
                className="liquid-glass-btn"
                onClick={clearRecent}
                style={{ padding: '6px 12px', fontSize: 12 }}
              >
                Clear
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {recentSearches.map((search, i) => (
                <button
                  key={i}
                  className="liquid-glass-btn"
                  onClick={() => handleSearch(search)}
                  style={{ padding: '8px 16px', fontSize: 14 }}
                >
                  {search}
                </button>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-secondary" style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, textTransform: 'uppercase' }}>
            Browse All
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {CATEGORIES.map((category) => (
              <GlassCard key={category.id} hoverable onClick={() => push(`/browse?category=${category.id}`)}>
                <div
                  style={{
                    width: '100%',
                    aspectRatio: '1',
                    borderRadius: 12,
                    background: `url(${category.image}) center/cover`,
                    marginBottom: 12,
                  }}
                />
                <div style={{ fontWeight: 600, fontSize: 15 }}>{category.name}</div>
              </GlassCard>
            ))}
          </div>
        </section>
      </div>
    </ScreenLayout>
  );
}
