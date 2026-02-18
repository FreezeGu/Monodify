import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { db } from '../config/firebase';
import GlassButton from './GlassButton';

export default function AddToPlaylist({ nasheed, onClose }) {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPlaylists();
    }
  }, [user]);

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
      // Firestore does not allow undefined; only include defined fields
      const raw = {
        id: nasheed.id,
        title: nasheed.title,
        artist: nasheed.artist,
        imageUrl: nasheed.imageUrl,
        audioUrl: nasheed.audioUrl,
        lyrics: nasheed.lyrics,
        genre: nasheed.genre,
      };
      const nasheedData = Object.fromEntries(
        Object.entries(raw).filter(([, v]) => v !== undefined)
      );

      await updateDoc(playlistRef, {
        songs: arrayUnion(nasheedData),
        // Update playlist image if it doesn't have one
        ...(nasheed.imageUrl && { imageUrl: nasheed.imageUrl }),
      });

      if (onClose) onClose();
    } catch (err) {
      console.error('Error adding to playlist:', err);
      alert('Failed to add to playlist');
    }
  };

  if (!user) {
    return (
      <div className="liquid-glass-card" style={{ padding: 20 }}>
        <p className="text-tertiary">Please log in to add songs to playlists</p>
      </div>
    );
  }

  return (
    <div className="liquid-glass-card" style={{ padding: 20 }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Add to Playlist</h3>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '32px 16px' }}>
          <p className="text-tertiary">Loading playlists...</p>
        </div>
      ) : playlists.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 16px' }}>
          <p className="text-tertiary" style={{ marginBottom: 16 }}>No playlists yet</p>
          <GlassButton onClick={() => window.location.href = '/playlists'}>
            Create Playlist
          </GlassButton>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
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
      
      {onClose && (
        <GlassButton
          variant="secondary"
          onClick={onClose}
          style={{ width: '100%', marginTop: 16 }}
        >
          Cancel
        </GlassButton>
      )}
    </div>
  );
}
