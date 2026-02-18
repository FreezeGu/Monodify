import React, { useState } from 'react';
import { useTabNavigation } from '../context/TabNavigationContext';
import ScreenLayout from '../components/ScreenLayout';
import GlassCard from '../components/GlassCard';

const FILTER_CHIPS = ['Playlists', 'Favorites', 'Downloaded'];

const MOCK_PLAYLISTS = [
  { id: '1', title: 'My Favorites', songCount: 24, image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop', isPublic: true },
  { id: '2', title: 'Peaceful Morning', songCount: 15, image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop', isPublic: false },
  { id: '3', title: 'Ramadan Vibes', songCount: 32, image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=400&fit=crop', isPublic: true },
  { id: '4', title: 'Late Night Dhikr', songCount: 18, image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop', isPublic: false },
];

const LIKED_SONGS_COUNT = 47;

export default function Playlists() {
  const { push } = useTabNavigation();
  const [activeFilter, setActiveFilter] = useState('Playlists');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      setNewPlaylistName('');
      setShowCreateModal(false);
    }
  };

  const renderContent = () => {
    switch (activeFilter) {
      case 'Favorites':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Liked songs content as list */}
            {[
              { id: 1, title: 'Bismillah', artist: 'Maher Zain', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop' },
              { id: 2, title: 'Allahu', artist: 'Sami Yusuf', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop' },
              { id: 3, title: 'Ya Nabi Salam', artist: 'Mesut Kurtis', image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=400&fit=crop' },
              { id: 4, title: 'Kun Anta', artist: 'Humood', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop' },
            ].map((song) => (
              <div key={song.id} className="glass-list-row" style={{ borderRadius: 0, cursor: 'pointer' }}>
                <img
                  src={song.image}
                  alt={song.title}
                  style={{ width: 48, height: 48, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{song.title}</div>
                  <div className="text-tertiary" style={{ fontSize: 13 }}>{song.artist}</div>
                </div>
                <HeartFilledIcon />
              </div>
            ))}
          </div>
        );

      case 'Downloaded':
        return (
          <div style={{ textAlign: 'center', padding: '64px 16px' }}>
            <div style={{ marginBottom: 16 }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--tertiary-text)" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <p className="text-tertiary" style={{ fontSize: 15 }}>
              No downloaded content yet
            </p>
            <p className="text-tertiary" style={{ fontSize: 13, marginTop: 4 }}>
              Download playlists to listen offline
            </p>
          </div>
        );

      default: // Playlists
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {MOCK_PLAYLISTS.map((playlist) => (
              <div
                key={playlist.id}
                className="glass-list-row"
                onClick={() => push(`/playlist/${playlist.id}`)}
                style={{ borderRadius: 12, cursor: 'pointer', padding: '10px 14px' }}
              >
                <img
                  src={playlist.image}
                  alt={playlist.title}
                  style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 3 }}>{playlist.title}</div>
                  <div className="text-tertiary" style={{ fontSize: 13 }}>
                    {'Playlist'} {' \u00B7 '} {playlist.songCount} songs
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <ScreenLayout showBackButton={false}>
      <div style={{ paddingTop: 8 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>Your Library</h1>
          <button
            className="liquid-glass-btn"
            onClick={() => setShowCreateModal(true)}
            style={{ padding: '8px 16px', fontSize: 24, lineHeight: 1, borderRadius: 99 }}
            aria-label="Create playlist"
          >
            +
          </button>
        </div>

        {/* Filter chips */}
        <div className="glass-filter-chips" style={{ marginBottom: 24 }}>
          {FILTER_CHIPS.map((chip) => (
            <button
              key={chip}
              className={`glass-filter-chip ${activeFilter === chip ? 'active' : ''}`}
              onClick={() => setActiveFilter(chip)}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Liked Songs card */}
        <div
          className="liked-songs-card"
          onClick={() => push('/playlist/liked')}
          style={{ marginBottom: 20, cursor: 'pointer' }}
        >
          <div className="liked-songs-inner">
            <div className="liked-songs-content">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
                <span className="text-tertiary" style={{ fontSize: 12 }}>
                  {'Bismillah \u00B7 Allahu \u00B7 Ya Nabi Salam \u00B7 Kun Anta \u00B7 and more...'}
                </span>
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#fff' }}>Liked Songs</h3>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
                {LIKED_SONGS_COUNT} songs
              </div>
            </div>
          </div>
        </div>

        {/* Playlist list / Favorites / Downloaded */}
        {renderContent()}

        {/* Create Playlist Modal */}
        {showCreateModal && (
          <div
            className="glass-modal-backdrop"
            onClick={(e) => { if (e.target === e.currentTarget) setShowCreateModal(false); }}
          >
            <div className="glass-modal-content" style={{ width: '90%', maxWidth: 360 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, textAlign: 'center' }}>Create Playlist</h3>
              <input
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="Playlist name"
                className="liquid-glass-input"
                style={{ width: '100%', marginBottom: 20 }}
                autoFocus
              />
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  className="liquid-glass-btn"
                  onClick={() => setShowCreateModal(false)}
                  style={{ flex: 1, padding: '12px' }}
                >
                  Cancel
                </button>
                <button
                  className="btn-primary"
                  onClick={handleCreatePlaylist}
                  style={{ flex: 1, padding: '12px' }}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ScreenLayout>
  );
}

function HeartFilledIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="rgba(30, 215, 96, 0.9)" stroke="none">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
