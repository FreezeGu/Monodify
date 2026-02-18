import React, { useState } from 'react';
import { useTabNavigation } from '../context/TabNavigationContext';
import ScreenLayout from '../components/ScreenLayout';
import GlassCard from '../components/GlassCard';
import GlassListRow from '../components/GlassListRow';

const TABS = ['Playlists', 'Artists', 'Albums', 'Songs', 'Downloaded'];

const MOCK_PLAYLISTS = [
  { id: '1', title: 'My Favorites', songCount: 24, image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop' },
  { id: '2', title: 'Peaceful Morning', songCount: 15, image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop' },
];

const MOCK_ARTISTS = [
  { id: '1', name: 'Maher Zain', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop' },
  { id: '2', name: 'Sami Yusuf', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop' },
];

const MOCK_ALBUMS = [
  { id: '1', title: 'Thank You Allah', artist: 'Maher Zain', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop' },
  { id: '2', title: 'Salam', artist: 'Sami Yusuf', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop' },
];

const MOCK_SONGS = [
  { id: '1', title: 'Bismillah', artist: 'Maher Zain', duration: '3:45', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop' },
  { id: '2', title: 'Allahu', artist: 'Sami Yusuf', duration: '4:12', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop' },
];

export default function Library() {
  const { push } = useTabNavigation();
  const [activeTab, setActiveTab] = useState('Playlists');

  const renderContent = () => {
    switch (activeTab) {
      case 'Playlists':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {MOCK_PLAYLISTS.map((playlist) => (
              <GlassCard key={playlist.id} hoverable onClick={() => push(`/playlist/${playlist.id}`)}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 12,
                      background: `url(${playlist.image}) center/cover`,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 4 }}>{playlist.title}</div>
                    <div className="text-tertiary" style={{ fontSize: 14 }}>{playlist.songCount} songs</div>
                  </div>
                </div>
              </GlassCard>
            ))}
            <button className="liquid-glass-btn" style={{ marginTop: 8, padding: '12px' }}>
              + Create Playlist
            </button>
          </div>
        );
      case 'Artists':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {MOCK_ARTISTS.map((artist) => (
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
        );
      case 'Albums':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {MOCK_ALBUMS.map((album) => (
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
        );
      case 'Songs':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {MOCK_SONGS.map((song) => (
              <GlassListRow
                key={song.id}
                leftContent={
                  <img
                    src={song.image}
                    alt={song.title}
                    style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover' }}
                  />
                }
                rightContent={<span className="text-tertiary" style={{ fontSize: 13 }}>{song.duration}</span>}
              >
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{song.title}</div>
                <div className="text-tertiary" style={{ fontSize: 13 }}>{song.artist}</div>
              </GlassListRow>
            ))}
          </div>
        );
      case 'Downloaded':
        return (
          <div style={{ textAlign: 'center', padding: '64px 16px' }}>
            <p className="text-tertiary">No downloaded content yet. Download albums or playlists to listen offline.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <ScreenLayout showBackButton={false} title="Library">
      <div style={{ paddingTop: 16 }}>
        <div className="glass-segmented-control" style={{ marginBottom: 24 }}>
          {TABS.map((tab) => (
            <div
              key={tab}
              className={`glass-segmented-control-item ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </div>
          ))}
        </div>
        {renderContent()}
      </div>
    </ScreenLayout>
  );
}
