import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { db } from '../config/firebase';
import AddToPlaylist from './AddToPlaylist';

export default function NasheedContextMenu({ nasheed, onClose, position }) {
  const { user } = useAuth();
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && showAddToPlaylist) {
      loadPlaylists();
    }
  }, [user, showAddToPlaylist]);

  const loadPlaylists = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, 'playlists'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      const loadedPlaylists = snapshot.docs.map((doc) => ({ 
        id: doc.id, 
        ...doc.data(),
      }));
      setPlaylists(loadedPlaylists);
    } catch (err) {
      console.error('Error loading playlists:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToPlaylist = async (playlistId) => {
    if (!user || !nasheed) return;

    try {
      const playlistRef = doc(db, 'playlists', playlistId);
      const nasheedData = {
        id: nasheed.id,
        title: nasheed.title,
        artist: nasheed.artist,
        imageUrl: nasheed.imageUrl,
        audioUrl: nasheed.audioUrl,
        lyrics: nasheed.lyrics,
        genre: nasheed.genre,
      };

      await updateDoc(playlistRef, {
        songs: arrayUnion(nasheedData),
        ...(nasheed.imageUrl && { imageUrl: nasheed.imageUrl }),
      });

      if (onClose) onClose();
    } catch (err) {
      console.error('Error adding to playlist:', err);
      alert('Failed to add to playlist');
    }
  };

  const handleAddToFavorites = () => {
    try {
      const favorites = JSON.parse(localStorage.getItem('monody-favorites') || '[]');
      const favoriteIds = favorites.map(f => f.id);
      
      if (!favoriteIds.includes(nasheed.id)) {
        favorites.push({ id: nasheed.id });
        localStorage.setItem('monody-favorites', JSON.stringify(favorites));
      }
      
      if (onClose) onClose();
    } catch (err) {
      console.error('Error adding to favorites:', err);
    }
  };

  if (showAddToPlaylist) {
    return (
      <div
        className="liquid-glass-card"
        style={{
          position: 'fixed',
          top: position?.y || '50%',
          left: position?.x || '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10000,
          padding: 20,
          maxWidth: '90vw',
          maxHeight: '80vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>Add to Playlist</h3>
          <button
            className="liquid-glass-btn"
            onClick={() => setShowAddToPlaylist(false)}
            style={{ padding: '4px 12px', fontSize: 14 }}
          >
            Back
          </button>
        </div>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '32px 16px' }}>
            <p className="text-tertiary">Loading playlists...</p>
          </div>
        ) : playlists.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 16px' }}>
            <p className="text-tertiary" style={{ marginBottom: 16 }}>No playlists yet</p>
            <button
              className="liquid-glass-btn"
              onClick={() => {
                window.location.href = '/playlists';
                if (onClose) onClose();
              }}
            >
              Create Playlist
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {playlists.map((playlist) => (
              <button
                key={playlist.id}
                className="liquid-glass-btn"
                onClick={() => handleAddToPlaylist(playlist.id)}
                style={{
                  padding: 12,
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 8,
                    background: playlist.imageUrl 
                      ? `url(${playlist.imageUrl}) center/cover`
                      : 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{playlist.title}</div>
                  <div className="text-tertiary" style={{ fontSize: 12 }}>
                    {playlist.songs?.length || 0} songs
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="liquid-glass-card"
      style={{
        position: 'fixed',
        top: position?.y || '50%',
        left: position?.x || '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10000,
        padding: 12,
        minWidth: 200,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {user ? (
        <>
          <button
            className="liquid-glass-btn"
            onClick={() => setShowAddToPlaylist(true)}
            style={{
              width: '100%',
              padding: 12,
              textAlign: 'left',
              marginBottom: 8,
            }}
          >
            Add to Playlist
          </button>
          <button
            className="liquid-glass-btn"
            onClick={handleAddToFavorites}
            style={{
              width: '100%',
              padding: 12,
              textAlign: 'left',
            }}
          >
            Add to Liked Songs
          </button>
        </>
      ) : (
        <p className="text-tertiary" style={{ padding: 12 }}>
          Please log in to add songs to playlists
        </p>
      )}
    </div>
  );
}
