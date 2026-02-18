import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTabNavigation } from '../context/TabNavigationContext';
import ScreenLayout from '../components/ScreenLayout';
import SearchBar from '../components/SearchBar';
import GlassCard from '../components/GlassCard';
import GlassListRow from '../components/GlassListRow';

const MOCK_RESULTS = {
  songs: [
    { id: '1', title: 'Bismillah', artist: 'Maher Zain', duration: '3:45', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop' },
    { id: '2', title: 'Allahu', artist: 'Sami Yusuf', duration: '4:12', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop' },
  ],
  albums: [
    { id: '1', title: 'Thank You Allah', artist: 'Maher Zain', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop' },
    { id: '2', title: 'Salam', artist: 'Sami Yusuf', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop' },
  ],
  artists: [
    { id: '1', name: 'Maher Zain', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop' },
    { id: '2', name: 'Sami Yusuf', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop' },
  ],
};

const FILTERS = ['All', 'Songs', 'Albums', 'Artists'];

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const { push } = useTabNavigation();
  const query = searchParams.get('q') || '';
  const [activeFilter, setActiveFilter] = useState('All');
  const [results, setResults] = useState(null);

  useEffect(() => {
    if (query.trim()) {
      setResults(MOCK_RESULTS);
    } else {
      setResults(null);
    }
  }, [query]);

  const handleSearch = (searchQuery) => {
    if (searchQuery.trim()) {
      push(`/search/results?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const filteredResults = () => {
    if (!results) return null;
    if (activeFilter === 'All') return results;
    return {
      songs: activeFilter === 'Songs' ? results.songs : [],
      albums: activeFilter === 'Albums' ? results.albums : [],
      artists: activeFilter === 'Artists' ? results.artists : [],
    };
  };

  const displayResults = filteredResults();

  return (
    <ScreenLayout title={query || 'Search'}>
      <div style={{ paddingTop: 16 }}>
        <div style={{ marginBottom: 24 }}>
          <SearchBar onSearch={handleSearch} placeholder="Artists, songs, albums..." defaultValue={query} />
        </div>

        {displayResults && (
          <>
            <div className="glass-segmented-control" style={{ marginBottom: 24 }}>
              {FILTERS.map((filter) => (
                <div
                  key={filter}
                  className={`glass-segmented-control-item ${activeFilter === filter ? 'active' : ''}`}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </div>
              ))}
            </div>

            {displayResults.songs && displayResults.songs.length > 0 && (
              <section style={{ marginBottom: 32 }}>
                <h2 className="text-secondary" style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase' }}>
                  Songs
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {displayResults.songs.map((song) => (
                    <GlassListRow
                      key={song.id}
                      leftContent={
                        <img
                          src={song.image}
                          alt={song.title}
                          style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }}
                        />
                      }
                      rightContent={<span className="text-tertiary" style={{ fontSize: 12 }}>{song.duration}</span>}
                    >
                      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{song.title}</div>
                      <div className="text-tertiary" style={{ fontSize: 13 }}>{song.artist}</div>
                    </GlassListRow>
                  ))}
                </div>
              </section>
            )}

            {displayResults.albums && displayResults.albums.length > 0 && (
              <section style={{ marginBottom: 32 }}>
                <h2 className="text-secondary" style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase' }}>
                  Albums
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                  {displayResults.albums.map((album) => (
                    <GlassCard key={album.id} hoverable onClick={() => push(`/album/${album.id}`)}>
                      <div
                        style={{
                          width: '100%',
                          aspectRatio: '1',
                          borderRadius: 12,
                          background: `url(${album.image}) center/cover`,
                          marginBottom: 12,
                        }}
                      />
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{album.title}</div>
                      <div className="text-tertiary" style={{ fontSize: 12 }}>{album.artist}</div>
                    </GlassCard>
                  ))}
                </div>
              </section>
            )}

            {displayResults.artists && displayResults.artists.length > 0 && (
              <section>
                <h2 className="text-secondary" style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase' }}>
                  Artists
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                  {displayResults.artists.map((artist) => (
                    <GlassCard key={artist.id} hoverable onClick={() => push(`/artist/${artist.id}`)}>
                      <div
                        style={{
                          width: '100%',
                          aspectRatio: '1',
                          borderRadius: '50%',
                          background: `url(${artist.image}) center/cover`,
                          marginBottom: 12,
                        }}
                      />
                      <div style={{ fontWeight: 600, fontSize: 14, textAlign: 'center' }}>{artist.name}</div>
                    </GlassCard>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {!displayResults && query && (
          <div style={{ textAlign: 'center', padding: '64px 16px' }}>
            <p className="text-tertiary">No results found for "{query}"</p>
          </div>
        )}
      </div>
    </ScreenLayout>
  );
}
