import React, { useState, useEffect } from 'react';
import { useTabNavigation } from '../context/TabNavigationContext';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../config/firebase';
import ScreenLayout from '../components/ScreenLayout';
import GlassCard from '../components/GlassCard';
import GlassListRow from '../components/GlassListRow';
import GlassButton from '../components/GlassButton';

const FAVORITES_KEY = 'monody-favorites';

export default function Playlists() {
  const { push } = useTabNavigation();
  const { setCurrentTrack } = usePlayer();
  const { user } = useAuth();
  const [activeView, setActiveView] = useState('playlists'); // 'playlists' or 'favorites'
  const [playlists, setPlaylists] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  useEffect(() => {
    if (user) {
      loadPlaylists();
      loadFavorites();
    }
  }, [user]);

  const loadPlaylists = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(collection(db, 'playlists'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      const loadedPlaylists = snapshot.docs.map((doc) => ({ 
        id: doc.id, 
        ...doc.data(),
        songCount: doc.data().songs?.length || 0,
      }));
      setPlaylists(loadedPlaylists);
    } catch (err) {
      console.error('Error loading playlists:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const saved = localStorage.getItem(FAVORITES_KEY);
      if (saved) {
        const favs = JSON.parse(saved);
        // Load full nasheed data from Firestore for favorites
        const favoriteIds = favs.map(f => f.id);
        if (favoriteIds.length > 0) {
          const nasheedsRef = collection(db, 'nasheeds');
          const nasheedsSnapshot = await getDocs(nasheedsRef);
          const allNasheeds = nasheedsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          const favoriteNasheeds = allNasheeds.filter(n => favoriteIds.includes(n.id));
          setFavorites(favoriteNasheeds);
        } else {
          setFavorites([]);
        }
      } else {
        setFavorites([]);
      }
    } catch (err) {
      console.error('Error loading favorites:', err);
      setFavorites([]);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!user || !newPlaylistName.trim()) return;
    
    try {
      const newPlaylist = {
        title: newPlaylistName.trim(),
        userId: user.uid,
        songs: [],
        public: false,
        createdAt: new Date().toISOString(),
        imageUrl: null, // Will be set from first song's image
      };
      
      const docRef = await addDoc(collection(db, 'playlists'), newPlaylist);
      setPlaylists([...playlists, { id: docRef.id, ...newPlaylist, songCount: 0 }]);
      setNewPlaylistName('');
      setShowCreateForm(false);
    } catch (err) {
      console.error('Error creating playlist:', err);
      alert('Failed to create playlist');
    }
  };

  const handleDeletePlaylist = async (id) => {
    if (!window.confirm('Are you sure you want to delete this playlist?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'playlists', id));
      setPlaylists(playlists.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting playlist:', err);
      alert('Failed to delete playlist');
    }
  };

  const handleRemoveFavorite = (id) => {
    try {
      const updated = favorites.filter(f => f.id !== id);
      setFavorites(updated);
      // Save favorite IDs to localStorage
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated.map(f => ({ id: f.id }))));
    } catch (err) {
      console.error('Error removing favorite:', err);
    }
  };

  return (
    <ScreenLayout showBackButton={false}>
      <div style={{ paddingTop: 8 }}>
        {/* Segmented Control - Spotify style */}
        <div className="glass-segmented-control" style={{ marginBottom: 24 }}>
          <div
            className={`glass-segmented-control-item ${activeView === 'playlists' ? 'active' : ''}`}
            onClick={() => setActiveView('playlists')}
          >
            Playlists
          </div>
          <div
            className={`glass-segmented-control-item ${activeView === 'favorites' ? 'active' : ''}`}
            onClick={() => setActiveView('favorites')}
          >
            Liked Songs
          </div>
        </div>

        {activeView === 'playlists' ? (
          <>
            {/* Create Playlist Button */}
            <div style={{ marginBottom: 24 }}>
              {!showCreateForm ? (
                <GlassButton
                  onClick={() => {
                    if (!user) {
                      alert('Please log in to create playlists');
                      return;
                    }
                    setShowCreateForm(true);
                  }}
                  style={{ width: '100%', padding: '14px' }}
                >
                  + Create Playlist
                </GlassButton>
              ) : (
                <div className="liquid-glass-card" style={{ padding: 16 }}>
                  <input
                    type="text"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    placeholder="Playlist name"
                    className="liquid-glass-input"
                    style={{ width: '100%', marginBottom: 12 }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreatePlaylist();
                      if (e.key === 'Escape') {
                        setShowCreateForm(false);
                        setNewPlaylistName('');
                      }
                    }}
                    autoFocus
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <GlassButton onClick={handleCreatePlaylist} style={{ flex: 1 }}>
                      Create
                    </GlassButton>
                    <GlassButton
                      variant="secondary"
                      onClick={() => {
                        setShowCreateForm(false);
                        setNewPlaylistName('');
                      }}
                      style={{ flex: 1 }}
                    >
                      Cancel
                    </GlassButton>
                  </div>
                </div>
              )}
            </div>

            {/* Playlists Grid - Spotify style */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '64px 16px' }}>
                <p className="text-tertiary">Loading playlists...</p>
              </div>
            ) : playlists.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                {playlists.map((playlist) => (
                  <GlassCard
                    key={playlist.id}
                    hoverable
                    onClick={() => push(`/playlist/${playlist.id}`)}
                    style={{ padding: 16 }}
                  >
                    <div
                      style={{
                        width: '100%',
                        aspectRatio: '1',
                        borderRadius: 8,
                        background: `url(${playlist.image}) center/cover`,
                        marginBottom: 12,
                        boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                      }}
                    />
                    <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{playlist.title}</div>
                    <div className="text-tertiary" style={{ fontSize: 13 }}>
                      {playlist.songCount || playlist.songs?.length || 0} {(playlist.songCount || playlist.songs?.length || 0) === 1 ? 'song' : 'songs'}
                    </div>
                    <button
                      className="liquid-glass-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePlaylist(playlist.id);
                      }}
                      style={{
                        marginTop: 8,
                        padding: '6px 12px',
                        fontSize: 12,
                        width: '100%',
                        background: 'rgba(255, 107, 107, 0.2)',
                        border: '1px solid rgba(255, 107, 107, 0.3)',
                        color: '#ff6b6b',
                      }}
                    >
                      Delete
                    </button>
                  </GlassCard>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '64px 16px' }}>
                <p className="text-tertiary">No playlists yet. Create your first playlist!</p>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Liked Songs - Spotify style */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 8,
                    background: 'linear-gradient(135deg, #450af5, #c44569)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                  }}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
                    Playlist
                  </div>
                  <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Liked Songs</h1>
                  <div className="text-secondary" style={{ fontSize: 14 }}>
                    {favorites.length} {favorites.length === 1 ? 'song' : 'songs'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <GlassButton
                  onClick={() => {
                    if (favorites.length > 0) {
                      setCurrentTrack({
                        ...favorites[0],
                        artworkUrl: favorites[0].image,
                        lyrics: favorites[0].lyrics, // Include lyrics if available
                      });
                    }
                  }}
                  style={{ padding: '12px 32px', fontSize: 14, fontWeight: 700 }}
                >
                  Play
                </GlassButton>
                <GlassButton variant="secondary" style={{ padding: '12px 24px' }}>
                  Shuffle
                </GlassButton>
              </div>
            </div>

            {/* Favorites List */}
            {favorites.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {favorites.map((song, index) => (
                  <GlassListRow
                    key={song.id}
                    leftContent={
                      <div style={{ width: 40, textAlign: 'center', fontSize: 15, color: 'var(--tertiary-text)' }}>
                        {index + 1}
                      </div>
                    }
                    rightContent={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="text-tertiary" style={{ fontSize: 13 }}>{song.duration}</span>
                        <button
                          className="liquid-glass-btn glass-btn-icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFavorite(song.id);
                          }}
                          style={{ padding: 4 }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                        </button>
                      </div>
                    }
                    onClick={() => {
                      setCurrentTrack({
                        ...song,
                        lyrics: song.lyrics, // Include lyrics if available
                        artworkUrl: song.image,
                      });
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                      <img
                        src={song.imageUrl || song.image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop'}
                        alt={song.title}
                        style={{ width: 48, height: 48, borderRadius: 6, objectFit: 'cover' }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{song.title}</div>
                        <div className="text-tertiary" style={{ fontSize: 13 }}>{song.artist}</div>
                      </div>
                    </div>
                  </GlassListRow>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '64px 16px' }}>
                <p className="text-tertiary">No liked songs yet. Start liking songs to see them here!</p>
              </div>
            )}
          </>
        )}
      </div>
    </ScreenLayout>
  );
}
