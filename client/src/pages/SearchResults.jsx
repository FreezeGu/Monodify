import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTabNavigation } from '../context/TabNavigationContext';
import { usePlayer } from '../context/PlayerContext';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import ScreenLayout from '../components/ScreenLayout';
import SearchBar from '../components/SearchBar';
import GlassCard from '../components/GlassCard';
import GlassListRow from '../components/GlassListRow';
import LazyImage from '../components/LazyImage';
import NasheedContextMenu from '../components/NasheedContextMenu';
import { AnimatePresence } from 'framer-motion';

const FILTERS = ['All', 'Songs', 'Albums', 'Artists'];

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const { push } = useTabNavigation();
  const { setCurrentTrack } = usePlayer();
  const queryParam = searchParams.get('q') || '';
  const browseParam = searchParams.get('browse') || ''; // 'nasheeds' | 'poems'
  const [activeFilter, setActiveFilter] = useState('All');
  const [results, setResults] = useState({ songs: [], albums: [], artists: [] });
  const [loading, setLoading] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);

  useEffect(() => {
    if (browseParam === 'nasheeds' || browseParam === 'poems') {
      performBrowse(browseParam);
    } else if (queryParam.trim()) {
      performSearch(queryParam);
    }
  }, [queryParam, browseParam]);

  const performBrowse = async (browse) => {
    setLoading(true);
    try {
      let allNasheeds = [];
      try {
        const nasheedsQuery = query(
          collection(db, 'nasheeds'),
          where('status', '==', 'approved'),
          limit(300)
        );
        const nasheedsSnapshot = await getDocs(nasheedsQuery);
        allNasheeds = nasheedsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        const nasheedsSnapshot = await getDocs(query(collection(db, 'nasheeds'), limit(300)));
        allNasheeds = nasheedsSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter(n => n.status === 'approved');
      }
      const isPoem = (n) => n.isPoem === true;
      const filteredNasheeds = browse === 'poems'
        ? allNasheeds.filter((n) => n.isPoem === true)
        : allNasheeds.filter((n) => n.isPoem !== true);
      const artists = Array.from(
        new Set(filteredNasheeds.map((n) => n.artist).filter(Boolean))
      ).map((artistName) => {
        const artistNasheeds = filteredNasheeds.filter((n) => n.artist === artistName);
        return {
          id: artistName.toLowerCase().replace(/\s+/g, '-'),
          name: artistName,
          image: artistNasheeds[0]?.imageUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
          nasheedCount: artistNasheeds.length,
        };
      });
      setResults({ songs: filteredNasheeds, albums: [], artists });
    } catch (err) {
      console.error('Browse error:', err);
    }
    setLoading(false);
  };

  const performSearch = async (searchQuery) => {
    setLoading(true);
    try {
      // Load all approved nasheeds
      let allNasheeds = [];
      try {
        const nasheedsQuery = query(
          collection(db, 'nasheeds'),
          where('status', '==', 'approved'),
          limit(100) // Increased limit for better genre filtering
        );
        const nasheedsSnapshot = await getDocs(nasheedsQuery);
        allNasheeds = nasheedsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        // Fallback: load all and filter
        console.warn('Query failed, using fallback:', err);
        const nasheedsSnapshot = await getDocs(query(collection(db, 'nasheeds'), limit(100)));
        allNasheeds = nasheedsSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter(n => n.status === 'approved');
      }
      
      // Filter by search query (case-insensitive)
      const queryLower = searchQuery.toLowerCase();
      const filteredNasheeds = allNasheeds.filter(
        (n) =>
          n.title?.toLowerCase().includes(queryLower) ||
          n.artist?.toLowerCase().includes(queryLower) ||
          n.genre?.toLowerCase() === queryLower || // Exact genre match
          n.genre?.toLowerCase().includes(queryLower) // Partial genre match
      );

      // Group results
      const songs = filteredNasheeds;
      const albums = []; // Could group by album if we add album field
      const artists = Array.from(
        new Set(filteredNasheeds.map((n) => n.artist).filter(Boolean))
      ).map((artistName) => {
        const artistNasheeds = filteredNasheeds.filter((n) => n.artist === artistName);
        return {
          id: artistName.toLowerCase().replace(/\s+/g, '-'),
          name: artistName,
          image: artistNasheeds[0]?.imageUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
          nasheedCount: artistNasheeds.length,
        };
      });

      setResults({ songs, albums, artists });
    } catch (err) {
      console.error('Search error:', err);
    }
    setLoading(false);
  };

  const handleSearch = (searchQuery) => {
    if (searchQuery.trim()) {
      push(`/search/results?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const filteredResults = () => {
    if (activeFilter === 'All') return results;
    return {
      songs: activeFilter === 'Songs' ? results.songs : [],
      albums: activeFilter === 'Albums' ? results.albums : [],
      artists: activeFilter === 'Artists' ? results.artists : [],
    };
  };

  const displayResults = filteredResults();

  const pageTitle = browseParam === 'nasheeds' ? 'All Nasheeds' : browseParam === 'poems' ? 'All Poems' : (queryParam || 'Search');

  return (
    <ScreenLayout title={pageTitle}>
      <div style={{ paddingTop: 16 }}>
        <div style={{ marginBottom: 24 }}>
          <SearchBar onSearch={handleSearch} placeholder="Artists, songs, albums..." defaultValue={browseParam ? '' : queryParam} />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '64px 16px' }}>
            <p className="text-tertiary">Searching...</p>
          </div>
        ) : (
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
                <h2 className="text-secondary" style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase' }}>
                  Songs
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {displayResults.songs.map((song) => (
                    <GlassListRow
                      key={song.id}
                      leftContent={
                        <LazyImage
                          src={song.imageUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop'}
                          alt={song.title}
                          style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover' }}
                        />
                      }
                      onClick={() => {
                        setCurrentTrack({
                          id: song.id,
                          title: song.title,
                          artist: song.artist,
                          artworkUrl: song.imageUrl,
                          audioUrl: song.audioUrl,
                          lyrics: song.lyrics, // Include lyrics data
                        });
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setContextMenu({ nasheed: song, position: { x: e.clientX, y: e.clientY } });
                      }}
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
                <h2 className="text-secondary" style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase' }}>
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
                      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{album.title}</div>
                      <div className="text-tertiary" style={{ fontSize: 13 }}>{album.artist}</div>
                    </GlassCard>
                  ))}
                </div>
              </section>
            )}

            {displayResults.artists && displayResults.artists.length > 0 && (
              <section>
                <h2 className="text-secondary" style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase' }}>
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
                      <div style={{ fontWeight: 600, fontSize: 15, textAlign: 'center' }}>{artist.name}</div>
                    </GlassCard>
                  ))}
                </div>
              </section>
            )}

            {!loading && displayResults.songs.length === 0 && displayResults.albums.length === 0 && displayResults.artists.length === 0 && queryParam && (
              <div style={{ textAlign: 'center', padding: '64px 16px' }}>
                <p className="text-tertiary">No results found for "{queryParam}"</p>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Context Menu Overlay */}
      {contextMenu && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9999,
              background: 'transparent',
            }}
            onClick={() => setContextMenu(null)}
          />
          <NasheedContextMenu
            nasheed={contextMenu.nasheed}
            position={contextMenu.position}
            onClose={() => setContextMenu(null)}
          />
        </>
      )}
    </ScreenLayout>
  );
}
