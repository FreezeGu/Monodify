import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, collection, query, where, getDocs, limit, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import ScreenLayout from '../components/ScreenLayout';
import GlassListRow from '../components/GlassListRow';
import GlassButton from '../components/GlassButton';
import SwipeablePlaylistRow from '../components/SwipeablePlaylistRow';
import LazyImage from '../components/LazyImage';

export default function PlaylistPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { setCurrentTrack, clearQueue, addToQueue, play } = usePlayer();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadPlaylist();
    }
  }, [id]);

  const loadPlaylist = async () => {
    try {
      // Check if this is a "Made for You" playlist (public genre-based playlist)
      if (id && id.startsWith('made-for-you-')) {
        // Extract genre from ID (format: made-for-you-{genre})
        // Examples: made-for-you-happy, made-for-you-war, made-for-you-peaceful
        const genreFromId = id.replace('made-for-you-', '').replace(/-/g, ' ');
        
        // Normalize genre: convert "happy" or "happy mix" to "Happy"
        const normalizeGenre = (genreStr) => {
          return genreStr
            .split(' ')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(' ')
            .trim();
        };
        
        const genreNormalized = normalizeGenre(genreFromId);
        
        // Function to match genres (case-insensitive, handles variations)
        const matchesGenre = (nasheedGenre) => {
          if (!nasheedGenre) return false;
          const normalized = normalizeGenre(nasheedGenre.trim());
          const lowerNasheed = normalized.toLowerCase();
          const lowerTarget = genreNormalized.toLowerCase();
          const lowerId = genreFromId.toLowerCase();
          
          return lowerNasheed === lowerTarget || 
                 lowerNasheed === lowerId ||
                 lowerNasheed.includes(lowerTarget) ||
                 lowerTarget.includes(lowerNasheed);
        };
        
        // Try to get from localStorage cache first
        const cached = localStorage.getItem('monodify-nasheeds-cache');
        if (cached) {
          try {
            const { data } = JSON.parse(cached);
            const genreNasheeds = data.filter(n => {
              if (n.status !== 'approved') return false;
              return matchesGenre(n.genre);
            });
            
            if (genreNasheeds.length > 0) {
              // Sort by popularity
              const sorted = [...genreNasheeds].sort((a, b) => {
                const scoreA = (a.views || 0) + (a.likes || 0) * 10;
                const scoreB = (b.views || 0) + (b.likes || 0) * 10;
                return scoreB - scoreA;
              });
              
              setPlaylist({
                id: id,
                title: `${genreNormalized} Mix`,
                description: `Public playlist • ${sorted.length} nasheeds`,
                imageUrl: sorted[0]?.imageUrl,
                songs: sorted.map(n => ({
                  id: n.id,
                  title: n.title,
                  artist: n.artist,
                  imageUrl: n.imageUrl,
                  audioUrl: n.audioUrl,
                  lyrics: n.lyrics,
                })),
                userId: 'system',
              });
              setLoading(false);
              return;
            }
          } catch (err) {
            console.warn('Error parsing cache:', err);
          }
        }
        
        // Load from Firestore - try multiple approaches
        let genreNasheeds = [];
        
        // Approach 1: Try exact match
        try {
          const exactQuery = query(
            collection(db, 'nasheeds'),
            where('status', '==', 'approved'),
            where('genre', '==', genreNormalized),
            limit(100)
          );
          const exactSnapshot = await getDocs(exactQuery);
          genreNasheeds = exactSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (err) {
          console.warn('Exact genre query failed:', err);
        }
        
        // Approach 2: If no results, load all approved and filter client-side
        if (genreNasheeds.length === 0) {
          try {
            const allQuery = query(
              collection(db, 'nasheeds'),
              where('status', '==', 'approved'),
              limit(500) // Increased limit to get more nasheeds
            );
            const allSnapshot = await getDocs(allQuery);
            const allNasheeds = allSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            genreNasheeds = allNasheeds.filter(n => matchesGenre(n.genre));
          } catch (err) {
            console.warn('Error loading all nasheeds:', err);
          }
        }
        
        if (genreNasheeds.length > 0) {
          // Sort by popularity
          const sorted = [...genreNasheeds].sort((a, b) => {
            const scoreA = (a.views || 0) + (a.likes || 0) * 10;
            const scoreB = (b.views || 0) + (b.likes || 0) * 10;
            return scoreB - scoreA;
          });
          
          setPlaylist({
            id: id,
            title: `${genreNormalized} Mix`,
            description: `Public playlist • ${sorted.length} nasheeds`,
            imageUrl: sorted[0]?.imageUrl,
            songs: sorted.map(n => ({
              id: n.id,
              title: n.title,
              artist: n.artist,
              imageUrl: n.imageUrl,
              audioUrl: n.audioUrl,
              lyrics: n.lyrics,
            })),
            userId: 'system',
          });
          setLoading(false);
          return;
        } else {
          // Even if no nasheeds found, show empty playlist instead of "not found"
          setPlaylist({
            id: id,
            title: `${genreNormalized} Mix`,
            description: 'Public playlist',
            imageUrl: null,
            songs: [],
            userId: 'system',
          });
          setLoading(false);
          return;
        }
      }
      
      // Regular playlist from Firestore
      const docRef = doc(db, 'playlists', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setPlaylist({ id: docSnap.id, ...docSnap.data() });
      } else {
        setPlaylist(null);
      }
    } catch (error) {
      console.error('Error loading playlist:', error);
      setPlaylist(null);
    } finally {
      setLoading(false);
    }
  };

  const normalizeTrack = (song) => ({
    ...song,
    audioUrl: song.audioUrl,
    lyrics: song.lyrics,
    artworkUrl: song.imageUrl || song.image || song.artworkUrl,
    imageUrl: song.imageUrl || song.image || song.artworkUrl,
  });

  const handlePlay = () => {
    if (playlist?.songs && playlist.songs.length > 0) {
      const tracks = playlist.songs.map(normalizeTrack);
      clearQueue();
      tracks.slice(1).forEach(track => addToQueue(track));
      const firstTrack = tracks[0];
      setCurrentTrack(firstTrack);
      play(firstTrack);
    }
  };

  const handleShuffle = () => {
    if (playlist?.songs && playlist.songs.length > 0) {
      const tracks = [...playlist.songs].sort(() => Math.random() - 0.5).map(normalizeTrack);
      clearQueue();
      tracks.slice(1).forEach(track => addToQueue(track));
      const firstTrack = tracks[0];
      setCurrentTrack(firstTrack);
      play(firstTrack);
    }
  };

  if (loading) {
    return (
      <ScreenLayout>
        <div style={{ textAlign: 'center', padding: '64px 16px' }}>
          <p className="text-tertiary">Loading...</p>
        </div>
      </ScreenLayout>
    );
  }

  if (!playlist) {
    return (
      <ScreenLayout>
        <div style={{ textAlign: 'center', padding: '64px 16px' }}>
          <p className="text-tertiary">Playlist not found</p>
        </div>
      </ScreenLayout>
    );
  }

  const tracks = playlist.songs || [];
  const isUserPlaylist = playlist && user && playlist.userId === user.uid && !id?.startsWith('made-for-you-');

  const handleRemoveFromPlaylist = async (trackToRemove) => {
    if (!playlist?.id || !user || playlist.userId !== user.uid) return;
    const newSongs = (playlist.songs || []).filter((s) => s.id !== trackToRemove.id);
    try {
      await updateDoc(doc(db, 'playlists', playlist.id), { songs: newSongs });
      setPlaylist((prev) => (prev ? { ...prev, songs: newSongs } : null));
    } catch (err) {
      console.error('Error removing from playlist:', err);
      alert('Failed to remove from playlist');
    }
  };

  return (
    <ScreenLayout>
      <div style={{ paddingTop: 16 }}>
        <section style={{ marginBottom: 32, textAlign: 'center' }}>
          <div
            style={{
              width: 'min(280px, 75vw)',
              aspectRatio: '1',
              borderRadius: 16,
              background: playlist.imageUrl ? `url(${playlist.imageUrl}) center/cover` : 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
              margin: '0 auto 24px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
            }}
          />
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{playlist.title}</h1>
          {playlist.description && (
            <p className="text-tertiary" style={{ fontSize: 14, marginBottom: 8 }}>{playlist.description}</p>
          )}
          <div className="text-secondary" style={{ fontSize: 13, marginBottom: 20 }}>
            {playlist.userId} • {tracks.length} songs
          </div>
          {tracks.length > 0 && (
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <GlassButton onClick={handlePlay}>Play</GlassButton>
              <GlassButton variant="secondary" onClick={handleShuffle}>Shuffle</GlassButton>
            </div>
          )}
        </section>

        {tracks.length > 0 ? (
          <section>
            <h2 className="text-secondary" style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase' }}>
              Tracklist
            </h2>
            {isUserPlaylist ? (
              <p className="text-tertiary" style={{ fontSize: 12, marginBottom: 12 }}>
                Swipe left on a track to remove it from this playlist
              </p>
            ) : null}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {tracks.map((track, index) =>
                isUserPlaylist ? (
                  <SwipeablePlaylistRow
                    key={track.id || index}
                    leftContent={
                      <LazyImage
                        src={track.imageUrl || track.image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop'}
                        alt={track.title}
                        style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover' }}
                      />
                    }
                    rightContent={<span className="text-tertiary" style={{ fontSize: 13 }}>{track.duration || '0:00'}</span>}
                    onClick={() => {
                      setCurrentTrack(normalizeTrack({ ...track, lyrics: track.lyrics }));
                    }}
                    onRemove={() => handleRemoveFromPlaylist(track)}
                  >
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{track.title}</div>
                    <div className="text-tertiary" style={{ fontSize: 13 }}>{track.artist}</div>
                  </SwipeablePlaylistRow>
                ) : (
                  <GlassListRow
                    key={track.id || index}
                    leftContent={
                      <LazyImage
                        src={track.imageUrl || track.image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop'}
                        alt={track.title}
                        style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover' }}
                      />
                    }
                    rightContent={<span className="text-tertiary" style={{ fontSize: 13 }}>{track.duration || '0:00'}</span>}
                    onClick={() => {
                      setCurrentTrack(normalizeTrack({ ...track, lyrics: track.lyrics }));
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{track.title}</div>
                    <div className="text-tertiary" style={{ fontSize: 13 }}>{track.artist}</div>
                  </GlassListRow>
                )
              )}
            </div>
          </section>
        ) : (
          <section>
            <div style={{ textAlign: 'center', padding: '64px 16px' }}>
              <p className="text-tertiary">This playlist is empty</p>
            </div>
          </section>
        )}
      </div>
    </ScreenLayout>
  );
}
