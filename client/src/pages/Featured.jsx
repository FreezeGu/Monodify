import React, { useState, useEffect } from 'react';
import { useTabNavigation } from '../context/TabNavigationContext';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getRecommendations, getMadeForYouPlaylists } from '../utils/recommendations';
import ScreenLayout from '../components/ScreenLayout';
import SearchBar from '../components/SearchBar';
import GlassCard from '../components/GlassCard';
import GlassListRow from '../components/GlassListRow';
import NasheedContextMenu from '../components/NasheedContextMenu';
import LazyImage from '../components/LazyImage';
import CachedBackground from '../components/CachedBackground';
import { preloadImages } from '../utils/imageCache';

const RECENT_SEARCHES_KEY = 'monody-recent-searches';

// Removed placeholder data - now using real data from Firestore

const GENRES = [
  { id: '1', name: 'Nasheeds', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop' },
  { id: '2', name: 'Poems', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop' },
];

// Genre display names and images
const GENRE_DISPLAY = {
  'Happy': { name: 'Happy Nasheeds', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop' },
  'War': { name: 'War Nasheeds', image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=400&fit=crop' },
  'Sad': { name: 'Sad Nasheeds', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop' },
  'Peaceful': { name: 'Peaceful Nasheeds', image: 'https://images.unsplash.com/photo-1544885936-231e6b91da48?w=400&h=400&fit=crop' },
  'Motivational': { name: 'Motivational Nasheeds', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop' },
  'Religious': { name: 'Religious Nasheeds', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop' },
  'Spiritual': { name: 'Spiritual Nasheeds', image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=400&fit=crop' },
  'Other': { name: 'Other Nasheeds', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop' },
};

export default function Featured() {
  const { push } = useTabNavigation();
  const { setCurrentTrack } = usePlayer();
  const { userProfile } = useAuth();
  const [recentSearches, setRecentSearches] = useState([]);
  const [nasheeds, setNasheeds] = useState([]);
  const [madeForYou, setMadeForYou] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [genreSections, setGenreSections] = useState({});
  const [loading, setLoading] = useState(true);
  const [sectionsLoading, setSectionsLoading] = useState({
    madeForYou: true,
    newReleases: true,
    recentlyPlayed: true,
    genres: true,
  });
  const [contextMenu, setContextMenu] = useState(null); // { nasheed, position: { x, y } }

  // Cache key for nasheeds data
  const NASHEEDS_CACHE_KEY = 'monodify-nasheeds-cache';
  const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes (increased for better caching)

  useEffect(() => {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (_) {}
    }
    loadNasheeds();
    
    // Refresh nasheeds when page becomes visible (user returns to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Refresh if cache is older than 1 minute when user returns
        const cached = localStorage.getItem(NASHEEDS_CACHE_KEY);
        if (cached) {
          const { timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp > 60000) { // 1 minute
            loadNasheeds(true);
          }
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const loadNasheeds = async (forceRefresh = false) => {
    setLoading(true);
    try {
      // Check cache first (unless forcing refresh)
      if (!forceRefresh) {
        const cached = localStorage.getItem(NASHEEDS_CACHE_KEY);
        if (cached) {
          try {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_DURATION) {
              setNasheeds(data);
              setLoading(false);
              
              // Preload images from cache
              const imageUrls = data
                .map(n => n.imageUrl)
                .filter(Boolean)
                .slice(0, 20);
              preloadImages(imageUrls).catch(() => {});
              
              // Process cached data in background without blocking
              setTimeout(() => processNasheedsData(data), 0);
              return;
            }
          } catch (_) {
            // Invalid cache, continue with fresh fetch
          }
        }
      }

      // Load approved nasheeds - increased limit to show more nasheeds
      let loadedNasheeds = [];
      try {
        const q = query(
          collection(db, 'nasheeds'),
          where('status', '==', 'approved'),
          orderBy('uploadedAt', 'desc'),
          limit(50) // Increased to show more nasheeds
        );
        const snapshot = await getDocs(q);
        loadedNasheeds = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        // Fallback: load all and filter/sort in memory
        console.warn('Compound query failed, using fallback:', err);
        const q = query(collection(db, 'nasheeds'), where('status', '==', 'approved'), limit(50));
        const snapshot = await getDocs(q);
        loadedNasheeds = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0));
      }
      
      // Cache the data
      localStorage.setItem(NASHEEDS_CACHE_KEY, JSON.stringify({
        data: loadedNasheeds,
        timestamp: Date.now(),
      }));

      setNasheeds(loadedNasheeds);
      setLoading(false);

      // Preload images in background for faster display
      const imageUrls = loadedNasheeds
        .map(n => n.imageUrl)
        .filter(Boolean)
        .slice(0, 20); // Preload first 20 images
      preloadImages(imageUrls).catch(() => {}); // Don't block on preload errors

      // Process data asynchronously to avoid blocking UI
      setTimeout(() => processNasheedsData(loadedNasheeds), 0);
    } catch (err) {
      console.error('Error loading nasheeds:', err);
      setLoading(false);
    }
  };

  const processNasheedsData = async (loadedNasheeds) => {
    // Read history once
    const userHistory = JSON.parse(localStorage.getItem('monody-history') || '[]');
    
      // Process sections in parallel using Promise.all
      await Promise.all([
        // Made for You playlists
        (async () => {
          setSectionsLoading(prev => ({ ...prev, madeForYou: true }));
          try {
            const playlists = getMadeForYouPlaylists(userProfile, loadedNasheeds, userHistory);
            setMadeForYou(playlists);
          } catch (err) {
            console.error('Error loading Made for You:', err);
          }
          setSectionsLoading(prev => ({ ...prev, madeForYou: false }));
        })(),
        
        // New releases
        (async () => {
          setSectionsLoading(prev => ({ ...prev, newReleases: true }));
          try {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            const newReleasesList = loadedNasheeds.filter(
              (n) => n.uploadedAt && new Date(n.uploadedAt) > weekAgo
            ).slice(0, 10);
            setNewReleases(newReleasesList);
          } catch (err) {
            console.error('Error loading new releases:', err);
          }
          setSectionsLoading(prev => ({ ...prev, newReleases: false }));
        })(),
        
        // Recently played
        (async () => {
          setSectionsLoading(prev => ({ ...prev, recentlyPlayed: true }));
          try {
            const recentIds = [...new Set(userHistory.slice(-10).map((h) => h.id))];
            const recentList = loadedNasheeds.filter((n) => recentIds.includes(n.id));
            setRecentlyPlayed(recentList.slice(0, 10));
          } catch (err) {
            console.error('Error loading recently played:', err);
          }
          setSectionsLoading(prev => ({ ...prev, recentlyPlayed: false }));
        })(),
        
        // Genre sections - lazy load after other sections
        (async () => {
          // Delay genre processing to prioritize other sections
          await new Promise(resolve => setTimeout(resolve, 100));
          setSectionsLoading(prev => ({ ...prev, genres: true }));
          try {
            // Group nasheeds by genre
            const grouped = loadedNasheeds.reduce((acc, nasheed) => {
              const genre = nasheed.genre || 'Other';
              if (!acc[genre]) {
                acc[genre] = [];
              }
              acc[genre].push(nasheed);
              return acc;
            }, {});
            
            // Sort each genre group by upload date (newest first) and limit to 8 for performance
            const sortedGroups = {};
            Object.keys(grouped).forEach((genre) => {
              sortedGroups[genre] = grouped[genre]
                .sort((a, b) => new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0))
                .slice(0, 8);
            });
            
            setGenreSections(sortedGroups);
          } catch (err) {
            console.error('Error loading genre sections:', err);
          }
          setSectionsLoading(prev => ({ ...prev, genres: false }));
        })(),
      ]);
  };

  const handleSearch = (query) => {
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

  if (loading) {
    return (
      <ScreenLayout showBackButton={false}>
        <div style={{ textAlign: 'center', padding: '64px 16px' }}>
          <p className="text-tertiary">Loading...</p>
        </div>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout showBackButton={false}>
      <div style={{ paddingTop: 8 }}>
        {/* Search Bar - Spotify style */}
        <div style={{ marginBottom: 24, display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <SearchBar 
              onSearch={handleSearch} 
              placeholder="What do you want to listen to?"
            />
          </div>
          <button
            className="liquid-glass-btn glass-btn-icon"
            onClick={() => loadNasheeds(true)}
            style={{ padding: 10 }}
            aria-label="Refresh"
            title="Refresh content"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
        </div>

        {/* Quick Access - Only show if we have real playlists */}
        {(madeForYou.length > 0 || recentlyPlayed.length > 0) && (
          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Good evening</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {madeForYou.length > 0 && (
                <GlassCard
                  hoverable
                  onClick={() => push('/playlists')}
                  style={{ 
                    padding: 16,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                    minHeight: 80,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 8,
                      background: madeForYou[0]?.image ? `url(${madeForYou[0].image}) center/cover` : 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ fontWeight: 600, fontSize: 16 }}>Made for You</div>
                </GlassCard>
              )}
              {recentlyPlayed.length > 0 && (
                <GlassCard
                  hoverable
                  onClick={() => push('/playlists')}
                  style={{ 
                    padding: 16,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                    minHeight: 80,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 8,
                      background: recentlyPlayed[0]?.imageUrl ? `url(${recentlyPlayed[0].imageUrl}) center/cover` : 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ fontWeight: 600, fontSize: 16 }}>Recently Played</div>
                </GlassCard>
              )}
            </div>
          </section>
        )}

            {/* Made for You - Spotify style */}
            <section style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700 }}>Made for You</h2>
                {madeForYou.length > 0 && (
                  <button
                    className="liquid-glass-btn"
                    onClick={() => push('/playlists')}
                    style={{ padding: '6px 12px', fontSize: 13, fontWeight: 600 }}
                  >
                    Show all
                  </button>
                )}
              </div>
              {sectionsLoading.madeForYou ? (
                <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }}>
                  {[1, 2, 3].map((i) => (
                    <div key={i} style={{ flexShrink: 0, width: 180, padding: 16 }}>
                      <div className="liquid-glass-card" style={{ aspectRatio: '1', borderRadius: 8, marginBottom: 12, background: 'rgba(255,255,255,0.05)' }} />
                      <div style={{ height: 16, borderRadius: 4, background: 'rgba(255,255,255,0.05)', marginBottom: 8 }} />
                      <div style={{ height: 12, borderRadius: 4, background: 'rgba(255,255,255,0.03)', width: '60%' }} />
                    </div>
                  ))}
                </div>
              ) : madeForYou.length > 0 ? (
                <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8, marginRight: -16, WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
                  {madeForYou.map((p) => (
                    <GlassCard
                      key={p.id}
                      hoverable
                      onClick={() => push(`/playlist/${p.id}`)}
                      style={{ flexShrink: 0, width: 180, padding: 16 }}
                    >
                      <div
                        style={{
                          width: '100%',
                          aspectRatio: '1',
                          borderRadius: 8,
                          background: `url(${p.image}) center/cover`,
                          marginBottom: 12,
                          boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                        }}
                      />
                      <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{p.title}</div>
                      <div className="text-tertiary" style={{ fontSize: 14 }}>{p.subtitle}</div>
                    </GlassCard>
                  ))}
                </div>
              ) : null}
            </section>

            {/* Recently Played - Spotify style */}
            {recentlyPlayed.length > 0 && (
              <section style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 700 }}>Recently played</h2>
                  <button
                    className="liquid-glass-btn"
                    style={{ padding: '6px 12px', fontSize: 13, fontWeight: 600 }}
                  >
                    Show all
                  </button>
                </div>
                {sectionsLoading.recentlyPlayed ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="liquid-glass-card" style={{ padding: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div style={{ width: 56, height: 56, borderRadius: 8, background: 'rgba(255,255,255,0.05)' }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ height: 16, borderRadius: 4, background: 'rgba(255,255,255,0.05)', marginBottom: 8, width: '60%' }} />
                          <div style={{ height: 12, borderRadius: 4, background: 'rgba(255,255,255,0.03)', width: '40%' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {recentlyPlayed.map((nasheed) => (
                      <GlassListRow
                        key={nasheed.id}
                        leftContent={
                          <LazyImage
                            src={nasheed.imageUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop'}
                            alt={nasheed.title}
                            style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover' }}
                          />
                        }
                        onClick={() => {
                        setCurrentTrack({
                          id: nasheed.id,
                          title: nasheed.title,
                          artist: nasheed.artist,
                          artworkUrl: nasheed.imageUrl,
                          audioUrl: nasheed.audioUrl,
                          lyrics: nasheed.lyrics, // Include lyrics data
                        });
                          // Save to history
                          const history = JSON.parse(localStorage.getItem('monody-history') || '[]');
                          history.push({
                            id: nasheed.id,
                            title: nasheed.title,
                            artist: nasheed.artist,
                            genre: nasheed.genre,
                            playedAt: new Date().toISOString(),
                          });
                          localStorage.setItem('monody-history', JSON.stringify(history.slice(-100))); // Keep last 100
                        }}
                      >
                        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{nasheed.title}</div>
                        <div className="text-tertiary" style={{ fontSize: 13 }}>{nasheed.artist}</div>
                      </GlassListRow>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Popular Artists - Only show if we have real artist data */}
            {/* Note: Artist pages are not yet implemented, so this section is hidden until we have real artist data */}

            {/* New Releases - Spotify style */}
            {newReleases.length > 0 && (
              <section style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>New releases</h2>
                {sectionsLoading.newReleases ? (
                  <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }}>
                    {[1, 2, 3].map((i) => (
                      <div key={i} style={{ flexShrink: 0, width: 180, padding: 16 }}>
                        <div className="liquid-glass-card" style={{ aspectRatio: '1', borderRadius: 8, marginBottom: 12, background: 'rgba(255,255,255,0.05)' }} />
                        <div style={{ height: 16, borderRadius: 4, background: 'rgba(255,255,255,0.05)', marginBottom: 8 }} />
                        <div style={{ height: 12, borderRadius: 4, background: 'rgba(255,255,255,0.03)', width: '60%' }} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8, marginRight: -16, WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
                    {newReleases.map((nasheed) => (
                      <GlassCard
                        key={nasheed.id}
                        hoverable
                        onClick={() => {
                        setCurrentTrack({
                          id: nasheed.id,
                          title: nasheed.title,
                          artist: nasheed.artist,
                          artworkUrl: nasheed.imageUrl,
                          audioUrl: nasheed.audioUrl,
                          lyrics: nasheed.lyrics, // Include lyrics data
                        });
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          setContextMenu({ nasheed, position: { x: e.clientX, y: e.clientY } });
                        }}
                        style={{ flexShrink: 0, width: 180, padding: 16, position: 'relative' }}
                      >
                        <CachedBackground
                          imageUrl={nasheed.imageUrl}
                          style={{
                            width: '100%',
                            aspectRatio: '1',
                            borderRadius: 8,
                            marginBottom: 12,
                            boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                          }}
                        />
                        <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{nasheed.title}</div>
                        <div className="text-tertiary" style={{ fontSize: 14 }}>{nasheed.artist}</div>
                      </GlassCard>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Genre Sections - Happy, War, Sad, etc. */}
            {Object.keys(genreSections).length > 0 && (
              <>
                {Object.entries(genreSections)
                  .filter(([genre]) => genre && genre !== 'Other') // Filter out empty genres and "Other"
                  .sort(([a], [b]) => {
                    // Sort: Happy, War, Sad, Peaceful, Motivational, Religious, Spiritual
                    const order = ['Happy', 'War', 'Sad', 'Peaceful', 'Motivational', 'Religious', 'Spiritual'];
                    const aIndex = order.indexOf(a);
                    const bIndex = order.indexOf(b);
                    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
                    if (aIndex === -1) return 1;
                    if (bIndex === -1) return -1;
                    return aIndex - bIndex;
                  })
                  .map(([genre, nasheeds]) => {
                    const display = GENRE_DISPLAY[genre] || { name: `${genre} Nasheeds`, image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop' };
                    return (
                      <section key={genre} style={{ marginBottom: 32 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                          <h2 style={{ fontSize: 22, fontWeight: 700 }}>{display.name}</h2>
                          <button
                            className="liquid-glass-btn"
                            onClick={() => push(`/search/results?q=${encodeURIComponent(genre)}`)}
                            style={{ padding: '6px 12px', fontSize: 13, fontWeight: 600 }}
                          >
                            Show all
                          </button>
                        </div>
                        {sectionsLoading.genres ? (
                          <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }}>
                            {[1, 2, 3].map((i) => (
                              <div key={i} style={{ flexShrink: 0, width: 180, padding: 16 }}>
                                <div className="liquid-glass-card" style={{ aspectRatio: '1', borderRadius: 8, marginBottom: 12, background: 'rgba(255,255,255,0.05)' }} />
                                <div style={{ height: 16, borderRadius: 4, background: 'rgba(255,255,255,0.05)', marginBottom: 8 }} />
                                <div style={{ height: 12, borderRadius: 4, background: 'rgba(255,255,255,0.03)', width: '60%' }} />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8, marginRight: -16, WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
                            {nasheeds.map((nasheed) => (
                              <GlassCard
                                key={nasheed.id}
                                hoverable
                                onClick={() => {
                        setCurrentTrack({
                          id: nasheed.id,
                          title: nasheed.title,
                          artist: nasheed.artist,
                          artworkUrl: nasheed.imageUrl,
                          audioUrl: nasheed.audioUrl,
                          lyrics: nasheed.lyrics, // Include lyrics data
                        });
                                  // Save to history
                                  const history = JSON.parse(localStorage.getItem('monody-history') || '[]');
                                  history.push({
                                    id: nasheed.id,
                                    title: nasheed.title,
                                    artist: nasheed.artist,
                                    genre: nasheed.genre,
                                    playedAt: new Date().toISOString(),
                                  });
                                  localStorage.setItem('monody-history', JSON.stringify(history.slice(-100)));
                                }}
                                onContextMenu={(e) => {
                                  e.preventDefault();
                                  setContextMenu({ nasheed, position: { x: e.clientX, y: e.clientY } });
                                }}
                                style={{ flexShrink: 0, width: 180, padding: 16, position: 'relative' }}
                              >
                                <div
                                  style={{
                                    width: '100%',
                                    aspectRatio: '1',
                                    borderRadius: 8,
                                    background: nasheed.imageUrl ? `url(${nasheed.imageUrl}) center/cover` : 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                                    marginBottom: 12,
                                    boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                                  }}
                                />
                                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{nasheed.title}</div>
                                <div className="text-tertiary" style={{ fontSize: 14 }}>{nasheed.artist}</div>
                              </GlassCard>
                            ))}
                          </div>
                        )}
                      </section>
                    );
                  })}
              </>
            )}

            {/* Browse by Genre - Spotify style */}
            <section>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Browse all</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {GENRES.map((genre) => (
                  <GlassCard
                    key={genre.id}
                    hoverable
                    onClick={() => push(`/search/results?q=${encodeURIComponent(genre.name)}`)}
                    style={{
                      padding: 20,
                      minHeight: 120,
                      background: `linear-gradient(135deg, rgba(0,0,0,0.3), rgba(0,0,0,0.1)), url(${genre.image}) center/cover`,
                      display: 'flex',
                      alignItems: 'flex-end',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 20 }}>{genre.name}</div>
                  </GlassCard>
                ))}
              </div>
            </section>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <section style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 className="text-secondary" style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase' }}>
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
